const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// Get all survey templates (filtered by school, status, audience)
router.get('/survey-templates', authMiddleware, async (req, res) => {
  try {
    const { school_id, status, audience_role } = req.query;

    let query = `
      SELECT st.*, s.name as school_name, u.first_name as creator_first_name, u.last_name as creator_last_name,
             (SELECT COUNT(*) FROM survey_responses WHERE survey_template_id = st.id) as response_count,
             (SELECT COUNT(*) FROM survey_questions WHERE survey_template_id = st.id) as question_count
      FROM survey_templates st
      LEFT JOIN schools s ON st.school_id = s.id
      LEFT JOIN users u ON st.created_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (school_id) {
      paramCount++;
      query += ` AND st.school_id = $${paramCount}`;
      params.push(school_id);
    }
    if (status) {
      paramCount++;
      query += ` AND st.status = $${paramCount}`;
      params.push(status);
    }
    if (audience_role) {
      paramCount++;
      query += ` AND (st.audience_role = 'all' OR st.audience_role = $${paramCount})`;
      params.push(audience_role);
    }

    // Filter by user role if not admin
    if (req.user.role !== 'admin') {
      if (req.user.role === 'leader') {
        // Leaders can see surveys for their schools
        paramCount++;
        query += ` AND (st.school_id IN (SELECT school_id FROM schools WHERE created_by = $${paramCount}) OR st.created_by = $${paramCount})`;
        params.push(req.user.id);
        params.push(req.user.id);
      } else {
        // Students/parents/teachers can see active surveys for their role
        paramCount++;
        query += ` AND st.status = 'active' AND (st.audience_role = 'all' OR st.audience_role = $${paramCount})`;
        params.push(req.user.role);
      }
    }

    query += ' ORDER BY st.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching survey templates:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get single survey template with questions
router.get('/survey-templates/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Get survey template
    const templateResult = await pool.query(
      `SELECT st.*, s.name as school_name, u.first_name as creator_first_name, u.last_name as creator_last_name
       FROM survey_templates st
       LEFT JOIN schools s ON st.school_id = s.id
       LEFT JOIN users u ON st.created_by = u.id
       WHERE st.id = $1`,
      [id]
    );

    if (templateResult.rows.length === 0) {
      return res.status(404).json({ message: 'Survey template not found' });
    }

    const template = templateResult.rows[0];

    // Get questions
    const questionsResult = await pool.query(
      `SELECT * FROM survey_questions WHERE survey_template_id = $1 ORDER BY order_index ASC, id ASC`,
      [id]
    );

    // Check if user has already responded
    let hasResponded = false;
    if (req.user) {
      const responseCheck = await pool.query(
        'SELECT id FROM survey_responses WHERE survey_template_id = $1 AND user_id = $2',
        [id, req.user.id]
      );
      hasResponded = responseCheck.rows.length > 0;
    }

    res.json({
      ...template,
      questions: questionsResult.rows,
      has_responded: hasResponded,
    });
  } catch (err) {
    console.error('Error fetching survey template:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create survey template (admin/leader)
router.post('/survey-templates', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'leader') {
      return res.status(403).json({ message: 'Only admins and leaders can create surveys' });
    }

    const {
      title,
      description,
      school_id,
      audience_role,
      status,
      start_date,
      end_date,
      questions,
    } = req.body;

    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({ message: 'Title and at least one question are required' });
    }

    // Start transaction
    await pool.query('BEGIN');

    try {
      // Create survey template
      const templateResult = await pool.query(
        `INSERT INTO survey_templates (title, description, school_id, created_by, audience_role, status, start_date, end_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          title,
          description || null,
          school_id || null,
          req.user.id,
          audience_role || 'all',
          status || 'draft',
          start_date || null,
          end_date || null,
        ]
      );

      const templateId = templateResult.rows[0].id;

      // Insert questions
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        await pool.query(
          `INSERT INTO survey_questions (survey_template_id, question_text, question_type, options, is_required, order_index)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            templateId,
            question.question_text,
            question.question_type || 'text',
            question.options ? JSON.stringify(question.options) : null,
            question.is_required || false,
            i,
          ]
        );
      }

      await pool.query('COMMIT');

      // Get full template with questions
      const fullTemplate = await pool.query(
        `SELECT st.*, s.name as school_name
         FROM survey_templates st
         LEFT JOIN schools s ON st.school_id = s.id
         WHERE st.id = $1`,
        [templateId]
      );

      const questionsResult = await pool.query(
        `SELECT * FROM survey_questions WHERE survey_template_id = $1 ORDER BY order_index ASC`,
        [templateId]
      );

      res.status(201).json({
        ...fullTemplate.rows[0],
        questions: questionsResult.rows,
      });
    } catch (err) {
      await pool.query('ROLLBACK');
      throw err;
    }
  } catch (err) {
    console.error('Error creating survey template:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update survey template
router.put('/survey-templates/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'leader') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;
    const {
      title,
      description,
      school_id,
      audience_role,
      status,
      start_date,
      end_date,
      questions,
    } = req.body;

    // Check if user created this survey (unless admin)
    if (req.user.role !== 'admin') {
      const check = await pool.query('SELECT * FROM survey_templates WHERE id = $1 AND created_by = $2', [id, req.user.id]);
      if (check.rows.length === 0) {
        return res.status(404).json({ message: 'Survey not found or access denied' });
      }
    }

    await pool.query('BEGIN');

    try {
      // Update template
      await pool.query(
        `UPDATE survey_templates
         SET title = COALESCE($1, title),
             description = COALESCE($2, description),
             school_id = COALESCE($3, school_id),
             audience_role = COALESCE($4, audience_role),
             status = COALESCE($5, status),
             start_date = COALESCE($6, start_date),
             end_date = COALESCE($7, end_date),
             updated_at = NOW()
         WHERE id = $8`,
        [title, description, school_id, audience_role, status, start_date, end_date, id]
      );

      // Update questions if provided
      if (questions) {
        // Delete existing questions
        await pool.query('DELETE FROM survey_questions WHERE survey_template_id = $1', [id]);

        // Insert new questions
        for (let i = 0; i < questions.length; i++) {
          const question = questions[i];
          await pool.query(
            `INSERT INTO survey_questions (survey_template_id, question_text, question_type, options, is_required, order_index)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              id,
              question.question_text,
              question.question_type || 'text',
              question.options ? JSON.stringify(question.options) : null,
              question.is_required || false,
              i,
            ]
          );
        }
      }

      await pool.query('COMMIT');

      // Get updated template
      const result = await pool.query(
        `SELECT st.*, s.name as school_name
         FROM survey_templates st
         LEFT JOIN schools s ON st.school_id = s.id
         WHERE st.id = $1`,
        [id]
      );

      const questionsResult = await pool.query(
        `SELECT * FROM survey_questions WHERE survey_template_id = $1 ORDER BY order_index ASC`,
        [id]
      );

      res.json({
        ...result.rows[0],
        questions: questionsResult.rows,
      });
    } catch (err) {
      await pool.query('ROLLBACK');
      throw err;
    }
  } catch (err) {
    console.error('Error updating survey template:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete survey template
router.delete('/survey-templates/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'leader') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;

    // Check if user created this survey (unless admin)
    if (req.user.role !== 'admin') {
      const check = await pool.query('SELECT * FROM survey_templates WHERE id = $1 AND created_by = $2', [id, req.user.id]);
      if (check.rows.length === 0) {
        return res.status(404).json({ message: 'Survey not found or access denied' });
      }
    }

    await pool.query('DELETE FROM survey_templates WHERE id = $1', [id]);

    res.json({ message: 'Survey template deleted successfully' });
  } catch (err) {
    console.error('Error deleting survey template:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Submit survey response
router.post('/survey-templates/:id/responses', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'Answers are required' });
    }

    // Check if survey exists and is active
    const survey = await pool.query('SELECT * FROM survey_templates WHERE id = $1', [id]);
    if (survey.rows.length === 0) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    if (survey.rows[0].status !== 'active') {
      return res.status(400).json({ message: 'Survey is not active' });
    }

    // Check date range
    const now = new Date();
    if (survey.rows[0].start_date && new Date(survey.rows[0].start_date) > now) {
      return res.status(400).json({ message: 'Survey has not started yet' });
    }
    if (survey.rows[0].end_date && new Date(survey.rows[0].end_date) < now) {
      return res.status(400).json({ message: 'Survey has ended' });
    }

    // Check if user already responded
    const existingResponse = await pool.query(
      'SELECT id FROM survey_responses WHERE survey_template_id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (existingResponse.rows.length > 0) {
      return res.status(400).json({ message: 'You have already submitted a response to this survey' });
    }

    await pool.query('BEGIN');

    try {
      // Create response
      const responseResult = await pool.query(
        `INSERT INTO survey_responses (survey_template_id, user_id)
         VALUES ($1, $2)
         RETURNING *`,
        [id, req.user.id]
      );

      const responseId = responseResult.rows[0].id;

      // Insert answers
      for (const answer of answers) {
        await pool.query(
          `INSERT INTO survey_answers (survey_response_id, question_id, answer_text, answer_value)
           VALUES ($1, $2, $3, $4)`,
          [
            responseId,
            answer.question_id,
            answer.answer_text || null,
            answer.answer_value ? JSON.stringify(answer.answer_value) : null,
          ]
        );
      }

      await pool.query('COMMIT');

      res.status(201).json({ message: 'Survey response submitted successfully' });
    } catch (err) {
      await pool.query('ROLLBACK');
      throw err;
    }
  } catch (err) {
    console.error('Error submitting survey response:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get survey analytics/results
router.get('/survey-templates/:id/analytics', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'leader') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;

    // Check if user created this survey (unless admin)
    if (req.user.role !== 'admin') {
      const check = await pool.query('SELECT * FROM survey_templates WHERE id = $1 AND created_by = $2', [id, req.user.id]);
      if (check.rows.length === 0) {
        return res.status(404).json({ message: 'Survey not found or access denied' });
      }
    }

    // Get survey template
    const template = await pool.query('SELECT * FROM survey_templates WHERE id = $1', [id]);
    if (template.rows.length === 0) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    // Get questions
    const questions = await pool.query(
      `SELECT * FROM survey_questions WHERE survey_template_id = $1 ORDER BY order_index ASC`,
      [id]
    );

    // Get total responses
    const responseCount = await pool.query(
      'SELECT COUNT(*) as count FROM survey_responses WHERE survey_template_id = $1',
      [id]
    );

    // Get answers grouped by question
    const analytics = [];
    for (const question of questions.rows) {
      const answersResult = await pool.query(
        `SELECT sa.answer_text, sa.answer_value, COUNT(*) as count
         FROM survey_answers sa
         INNER JOIN survey_responses sr ON sa.survey_response_id = sr.id
         WHERE sa.question_id = $1 AND sr.survey_template_id = $2
         GROUP BY sa.answer_text, sa.answer_value
         ORDER BY count DESC`,
        [question.id, id]
      );

      analytics.push({
        question: question,
        answers: answersResult.rows,
        total_responses: responseCount.rows[0].count,
      });
    }

    res.json({
      survey: template.rows[0],
      total_responses: parseInt(responseCount.rows[0].count),
      analytics: analytics,
    });
  } catch (err) {
    console.error('Error fetching survey analytics:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
