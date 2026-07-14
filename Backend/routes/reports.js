const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Platform-wide report overview for admins: schools, users, applications, ads.
// Grouped dynamically (no hardcoded enum values) so it stays correct as statuses evolve.
router.get('/admin/overview', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [schools, usersByRole, appsByStatus, adsByStatus, revenue] = await Promise.all([
      pool.query(`SELECT type, COUNT(*)::int AS count FROM schools GROUP BY type`),
      pool.query(`SELECT role, COUNT(*)::int AS count FROM users GROUP BY role`),
      pool.query(`SELECT status, COUNT(*)::int AS count FROM student_applications GROUP BY status`),
      pool.query(`SELECT status, COUNT(*)::int AS count FROM ad_campaigns GROUP BY status`).catch(() => ({ rows: [] })),
      pool.query(`SELECT currency, SUM(amount)::numeric AS total FROM ad_campaigns WHERE payment_status = 'paid' GROUP BY currency`).catch(() => ({ rows: [] })),
    ]);

    res.json({
      schoolsByType: schools.rows,
      totalSchools: schools.rows.reduce((sum, r) => sum + r.count, 0),
      usersByRole: usersByRole.rows,
      applicationsByStatus: appsByStatus.rows,
      adsByStatus: adsByStatus.rows,
      adRevenueByCurrency: revenue.rows,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error building admin report overview:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
