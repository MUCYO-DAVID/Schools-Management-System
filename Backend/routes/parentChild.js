const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// Get all children for a parent
router.get('/parent-children', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'parent' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const parentId = req.user.role === 'admin' ? req.query.parent_id || req.user.id : req.user.id;

        const result = await pool.query(
            `SELECT 
        pcr.*,
        u.id as child_id,
        u.first_name,
        u.last_name,
        u.email,
        u.role
       FROM parent_child_relationships pcr
       INNER JOIN users u ON pcr.child_id = u.id
       WHERE pcr.parent_id = $1
       ORDER BY pcr.is_primary DESC, u.first_name ASC`,
            [parentId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching parent children:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get parent(s) for a child (student)
router.get('/child-parents', authMiddleware, async (req, res) => {
    try {
        const childId = req.user.role === 'admin' ? req.query.child_id || req.user.id : req.user.id;

        // Students can view their own parents, parents can view their own info, admins can view all
        if (req.user.role === 'student' && req.user.id !== parseInt(childId)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const result = await pool.query(
            `SELECT 
        pcr.*,
        u.id as parent_id,
        u.first_name,
        u.last_name,
        u.email,
        u.role
       FROM parent_child_relationships pcr
       INNER JOIN users u ON pcr.parent_id = u.id
       WHERE pcr.child_id = $1
       ORDER BY pcr.is_primary DESC, u.first_name ASC`,
            [childId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching child parents:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Link a parent to a child (admin or parent can do this)
router.post('/parent-children', authMiddleware, async (req, res) => {
    try {
        const { parent_id, child_id, relationship_type, is_primary } = req.body;

        if (!parent_id || !child_id) {
            return res.status(400).json({ message: 'parent_id and child_id are required' });
        }

        // Check if parent and child exist and have correct roles
        const parentCheck = await pool.query('SELECT id, role FROM users WHERE id = $1', [parent_id]);
        const childCheck = await pool.query('SELECT id, role FROM users WHERE id = $1', [child_id]);

        if (parentCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Parent not found' });
        }
        if (childCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Child not found' });
        }
        if (parentCheck.rows[0].role !== 'parent') {
            return res.status(400).json({ message: 'Parent user must have role "parent"' });
        }
        if (childCheck.rows[0].role !== 'student') {
            return res.status(400).json({ message: 'Child user must have role "student"' });
        }

        // Permission check: admin can link any, parent can only link themselves
        if (req.user.role !== 'admin' && req.user.id !== parseInt(parent_id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Check if relationship already exists
        const existing = await pool.query(
            'SELECT * FROM parent_child_relationships WHERE parent_id = $1 AND child_id = $2',
            [parent_id, child_id]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ message: 'Relationship already exists' });
        }

        // If setting as primary, unset other primary relationships for this parent
        if (is_primary) {
            await pool.query(
                'UPDATE parent_child_relationships SET is_primary = false WHERE parent_id = $1',
                [parent_id]
            );
        }

        const result = await pool.query(
            `INSERT INTO parent_child_relationships (parent_id, child_id, relationship_type, is_primary)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [parent_id, child_id, relationship_type || 'parent', is_primary || false]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating parent-child relationship:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Update relationship (e.g., change primary status)
router.put('/parent-children/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { relationship_type, is_primary } = req.body;

        // Get the relationship
        const relationship = await pool.query(
            'SELECT * FROM parent_child_relationships WHERE id = $1',
            [id]
        );

        if (relationship.rows.length === 0) {
            return res.status(404).json({ message: 'Relationship not found' });
        }

        // Permission check: admin or the parent themselves
        if (req.user.role !== 'admin' && req.user.id !== relationship.rows[0].parent_id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // If setting as primary, unset other primary relationships for this parent
        if (is_primary) {
            await pool.query(
                'UPDATE parent_child_relationships SET is_primary = false WHERE parent_id = $1 AND id != $2',
                [relationship.rows[0].parent_id, id]
            );
        }

        const result = await pool.query(
            `UPDATE parent_child_relationships
       SET relationship_type = COALESCE($1, relationship_type),
           is_primary = COALESCE($2, is_primary)
       WHERE id = $3
       RETURNING *`,
            [relationship_type, is_primary, id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating parent-child relationship:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Remove relationship
router.delete('/parent-children/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // Get the relationship
        const relationship = await pool.query(
            'SELECT * FROM parent_child_relationships WHERE id = $1',
            [id]
        );

        if (relationship.rows.length === 0) {
            return res.status(404).json({ message: 'Relationship not found' });
        }

        // Permission check: admin or the parent themselves
        if (req.user.role !== 'admin' && req.user.id !== relationship.rows[0].parent_id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await pool.query('DELETE FROM parent_child_relationships WHERE id = $1', [id]);

        res.json({ message: 'Relationship removed successfully' });
    } catch (err) {
        console.error('Error deleting parent-child relationship:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
