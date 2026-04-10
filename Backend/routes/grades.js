const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');
const { createNotification } = require('./notifications');
const { sendNotificationEmail } = require('../utils/emailService');
const multer = require('multer');
const csv = require('csv-parser');
const { Readable } = require('stream');

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Get grades for a student (parent/student/teacher/admin can access)
router.get('/grades/student/:studentId', authMiddleware, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { term, academic_year, school_id } = req.query;

    // Permission check
    if (req.user.role === 'student' && req.user.id !== parseInt(studentId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let query = `
      SELECT g.*, u.first_name, u.last_name, s.name as school_name,
             t.first_name as teacher_first_name, t.last_name as teacher_last_name
      FROM grades g
      LEFT JOIN users u ON g.student_user_id = u.id
      LEFT JOIN schools s ON g.school_id = s.id
      LEFT JOIN users t ON g.teacher_id = t.id
      WHERE g.student_user_id = $1
    `;
    const params = [studentId];
    let paramCount = 1;

    if (term) {
      paramCount++;
      query += ` AND g.term = $${paramCount}`;
      params.push(term);
    }
    if (academic_year) {
      paramCount++;
      query += ` AND g.academic_year = $${paramCount}`;
      params.push(academic_year);
    }
    if (school_id) {
      paramCount++;
      query += ` AND g.school_id = $${paramCount}`;
      params.push(school_id);
    }

    query += ' ORDER BY g.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching grades:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get all grades (for teachers of their students, admins)
router.get('/grades', authMiddleware, async (req, res) => {
  try {
    const { school_id, term, academic_year, teacher_id } = req.query;

    if (req.user.role !== 'admin' && req.user.role !== 'teacher' && req.user.role !== 'leader') {
      return res.status(403).json({ message: 'Access denied' });
    }

    let query = `
      SELECT g.*, u.first_name, u.last_name, u.email, s.name as school_name,
             t.first_name as teacher_first_name, t.last_name as teacher_last_name
      FROM grades g
      LEFT JOIN users u ON g.student_user_id = u.id
      LEFT JOIN schools s ON g.school_id = s.id
      LEFT JOIN users t ON g.teacher_id = t.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (school_id) {
      paramCount++;
      query += ` AND g.school_id = $${paramCount}`;
      params.push(school_id);
    }
    if (term) {
      paramCount++;
      query += ` AND g.term = $${paramCount}`;
      params.push(term);
    }
    if (academic_year) {
      paramCount++;
      query += ` AND g.academic_year = $${paramCount}`;
      params.push(academic_year);
    }
    if (teacher_id) {
      paramCount++;
      query += ` AND g.teacher_id = $${paramCount}`;
      params.push(teacher_id);
    }

    // Teachers can only see their own grades
    if (req.user.role === 'teacher') {
      paramCount++;
      query += ` AND g.teacher_id = $${paramCount}`;
      params.push(req.user.id);
    }

    query += ' ORDER BY g.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching grades:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create/Upload grades (teachers and admins)
router.post('/grades', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers and admins can upload grades' });
    }

    const {
      student_user_id,
      school_id,
      subject,
      grade,
      score,
      max_score,
      term,
      academic_year,
      comments,
      is_document,
      document_url
    } = req.body;

    if (!student_user_id || !school_id || !subject) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validation for non-document grades
    if (!is_document && !grade) {
      return res.status(400).json({ message: 'Grade is required for non-document uploads' });
    }

    const result = await pool.query(
      `INSERT INTO grades (student_user_id, school_id, subject, grade, score, max_score, term, academic_year, teacher_id, comments, is_document, document_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        student_user_id, 
        school_id, 
        subject, 
        grade || 'DOC', 
        score || null, 
        max_score || 100, 
        term, 
        academic_year, 
        req.user.id, 
        comments || null,
        is_document || false,
        document_url || null
      ]
    );

    // Send notification to student
    try {
      await createNotification(
        student_user_id,
        'New Grade Posted',
        `Your ${subject} grade for ${term} ${academic_year} has been posted: ${grade}`,
        'info',
        '/student'
      );

      // Also notify parents
      const parentsResult = await pool.query(
        'SELECT parent_id FROM parent_child_relationships WHERE child_id = $1',
        [student_user_id]
      );
      for (const parent of parentsResult.rows) {
        await createNotification(
          parent.parent_id,
          'Child Grade Posted',
          `Your child's ${subject} grade for ${term} ${academic_year} has been posted: ${grade}`,
          'info',
          '/parent'
        );
      }
    } catch (notifErr) {
      console.error('Failed to send notification:', notifErr.message);
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating grade:', err.message);
    if (err.code === '23503') {
      if (err.constraint === 'grades_student_user_id_fkey') {
        return res.status(400).json({ message: 'Invalid Student ID. Student not found in database.' });
      }
      if (err.constraint === 'grades_school_id_fkey') {
        return res.status(400).json({ message: 'Invalid School ID. School not found in database.' });
      }
    }
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

// Update grade
router.put('/grades/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;
    const { subject, grade, score, max_score, comments } = req.body;

    // Check if grade exists and belongs to teacher (if not admin)
    if (req.user.role === 'teacher') {
      const check = await pool.query('SELECT * FROM grades WHERE id = $1 AND teacher_id = $2', [id, req.user.id]);
      if (check.rows.length === 0) {
        return res.status(404).json({ message: 'Grade not found or access denied' });
      }
    }

    const result = await pool.query(
      `UPDATE grades 
       SET subject = COALESCE($1, subject), 
           grade = COALESCE($2, grade), 
           score = COALESCE($3, score),
           max_score = COALESCE($4, max_score),
           comments = COALESCE($5, comments),
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [subject, grade, score, max_score, comments, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating grade:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete grade
router.delete('/grades/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;

    // Check if grade exists and belongs to teacher (if not admin)
    if (req.user.role === 'teacher') {
      const check = await pool.query('SELECT * FROM grades WHERE id = $1 AND teacher_id = $2', [id, req.user.id]);
      if (check.rows.length === 0) {
        return res.status(404).json({ message: 'Grade not found or access denied' });
      }
    }

    await pool.query('DELETE FROM grades WHERE id = $1', [id]);
    res.json({ message: 'Grade deleted successfully' });
  } catch (err) {
    console.error('Error deleting grade:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Generate report card
router.post('/report-cards/generate', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'teacher' && req.user.role !== 'leader') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const {
      student_user_id,
      school_id,
      term,
      academic_year,
      attendance_percentage,
      teacher_comments,
      principal_comments
    } = req.body;

    if (!student_user_id || !school_id || !term || !academic_year) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Calculate overall grade from all subject grades
    const gradesResult = await pool.query(
      'SELECT * FROM grades WHERE student_user_id = $1 AND school_id = $2 AND term = $3 AND academic_year = $4',
      [student_user_id, school_id, term, academic_year]
    );

    let overall_percentage = null;
    let overall_grade = null;

    if (gradesResult.rows.length > 0) {
      const totalScore = gradesResult.rows.reduce((sum, g) => sum + (parseFloat(g.score) || 0), 0);
      const totalMaxScore = gradesResult.rows.reduce((sum, g) => sum + (parseFloat(g.max_score) || 100), 0);
      overall_percentage = (totalScore / totalMaxScore) * 100;

      // Calculate letter grade
      if (overall_percentage >= 90) overall_grade = 'A';
      else if (overall_percentage >= 80) overall_grade = 'B';
      else if (overall_percentage >= 70) overall_grade = 'C';
      else if (overall_percentage >= 60) overall_grade = 'D';
      else overall_grade = 'F';
    }

    // Insert or update report card
    const result = await pool.query(
      `INSERT INTO report_cards (student_user_id, school_id, term, academic_year, overall_grade, overall_percentage, attendance_percentage, teacher_comments, principal_comments)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (student_user_id, school_id, term, academic_year)
       DO UPDATE SET overall_grade = $5, overall_percentage = $6, attendance_percentage = $7, teacher_comments = $8, principal_comments = $9, generated_at = NOW()
       RETURNING *`,
      [student_user_id, school_id, term, academic_year, overall_grade, overall_percentage, attendance_percentage, teacher_comments, principal_comments]
    );

    // Send notification to student
    try {
      await createNotification(
        student_user_id,
        'Report Card Available',
        `Your report card for ${term} ${academic_year} is now available`,
        'success',
        '/student'
      );

      // Also notify parents
      const parentsResult = await pool.query(
        'SELECT parent_id FROM parent_child_relationships WHERE child_id = $1',
        [student_user_id]
      );
      for (const parent of parentsResult.rows) {
        const studentResult = await pool.query('SELECT first_name, last_name FROM users WHERE id = $1', [student_user_id]);
        const studentName = studentResult.rows[0] ? `${studentResult.rows[0].first_name} ${studentResult.rows[0].last_name}` : 'Your child';

        await createNotification(
          parent.parent_id,
          'Child Report Card Available',
          `${studentName}'s report card for ${term} ${academic_year} is now available`,
          'success',
          '/parent'
        );
      }
    } catch (notifErr) {
      console.error('Failed to send notification:', notifErr.message);
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error generating report card:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get report cards for a student
router.get('/report-cards/student/:studentId', authMiddleware, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Permission check
    if (req.user.role === 'student' && req.user.id !== parseInt(studentId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await pool.query(
      `SELECT rc.*, u.first_name, u.last_name, s.name as school_name
       FROM report_cards rc
       LEFT JOIN users u ON rc.student_user_id = u.id
       LEFT JOIN schools s ON rc.school_id = s.id
       WHERE rc.student_user_id = $1
       ORDER BY rc.generated_at DESC`,
      [studentId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching report cards:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Bulk upload grades from CSV
router.post('/grades/bulk-upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'teacher' && req.user.role !== 'leader') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { school_id, term, academic_year } = req.body;
    if (!school_id || !term || !academic_year) {
      return res.status(400).json({ message: 'Missing required fields: school_id, term, academic_year' });
    }

    const results = [];
    const errors = [];
    const csvData = [];

    // Parse CSV
    const stream = Readable.from(req.file.buffer.toString());
    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (row) => {
          csvData.push(row);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Process each row
    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      try {
        // Expected CSV format: student_email, subject, grade, score, max_score, comments
        const studentEmail = row.student_email || row.email || row['Student Email'];
        const subject = row.subject || row['Subject'];
        const grade = row.grade || row['Grade'];
        const score = row.score || row['Score'];
        const maxScore = row.max_score || row['Max Score'] || row['Max_Score'] || 100;
        const comments = row.comments || row['Comments'] || '';

        if (!studentEmail || !subject || !grade) {
          errors.push({ row: i + 1, error: 'Missing required fields (student_email, subject, grade)' });
          continue;
        }

        // Find student by email
        const studentResult = await pool.query('SELECT id FROM users WHERE email = $1 AND role = $2', [studentEmail, 'student']);
        if (studentResult.rows.length === 0) {
          errors.push({ row: i + 1, error: `Student not found: ${studentEmail}` });
          continue;
        }

        const studentUserId = studentResult.rows[0].id;

        // Insert grade
        const gradeResult = await pool.query(
          `INSERT INTO grades (student_user_id, school_id, subject, grade, score, max_score, term, academic_year, teacher_id, comments)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           RETURNING *`,
          [studentUserId, school_id, subject, grade, score || null, maxScore, term, academic_year, req.user.id, comments || null]
        );

        results.push(gradeResult.rows[0]);

        // Send notification to student
        try {
          await createNotification(
            studentUserId,
            'New Grade Posted',
            `Your ${subject} grade for ${term} ${academic_year} has been posted: ${grade}`,
            'info',
            '/student'
          );

          // Also notify parents
          const parentsResult = await pool.query(
            'SELECT parent_id FROM parent_child_relationships WHERE child_id = $1',
            [studentUserId]
          );
          for (const parent of parentsResult.rows) {
            await createNotification(
              parent.parent_id,
              'Child Grade Posted',
              `Your child's ${subject} grade for ${term} ${academic_year} has been posted: ${grade}`,
              'info',
              '/parent'
            );
          }
        } catch (notifErr) {
          console.error('Failed to send notification:', notifErr.message);
        }
      } catch (err) {
        errors.push({ row: i + 1, error: err.message });
      }
    }

    res.json({
      success: true,
      uploaded: results.length,
      errors: errors.length,
      results: results,
      errors: errors
    });
  } catch (err) {
    console.error('Error bulk uploading grades:', err.message);
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

// Bulk generate report cards and send emails
router.post('/report-cards/bulk-generate', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'teacher' && req.user.role !== 'leader') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { school_id, term, academic_year, student_ids, send_emails } = req.body;
    if (!school_id || !term || !academic_year) {
      return res.status(400).json({ message: 'Missing required fields: school_id, term, academic_year' });
    }

    // Get students - either specific IDs or all students in the school
    let studentsQuery = `
      SELECT DISTINCT u.id, u.email, u.first_name, u.last_name
      FROM grades g
      INNER JOIN users u ON g.student_user_id = u.id
      WHERE g.school_id = $1 AND g.term = $2 AND g.academic_year = $3
    `;
    const params = [school_id, term, academic_year];

    if (student_ids && Array.isArray(student_ids) && student_ids.length > 0) {
      params.push(student_ids);
      studentsQuery += ` AND u.id = ANY($4)`;
    }

    const studentsResult = await pool.query(studentsQuery, params);
    const students = studentsResult.rows;

    const results = [];
    const errors = [];

    for (const student of students) {
      try {
        // Calculate overall grade
        const gradesResult = await pool.query(
          'SELECT * FROM grades WHERE student_user_id = $1 AND school_id = $2 AND term = $3 AND academic_year = $4',
          [student.id, school_id, term, academic_year]
        );

        let overall_percentage = null;
        let overall_grade = null;

        if (gradesResult.rows.length > 0) {
          const totalScore = gradesResult.rows.reduce((sum, g) => sum + (parseFloat(g.score) || 0), 0);
          const totalMaxScore = gradesResult.rows.reduce((sum, g) => sum + (parseFloat(g.max_score) || 100), 0);
          overall_percentage = (totalScore / totalMaxScore) * 100;

          if (overall_percentage >= 90) overall_grade = 'A';
          else if (overall_percentage >= 80) overall_grade = 'B';
          else if (overall_percentage >= 70) overall_grade = 'C';
          else if (overall_percentage >= 60) overall_grade = 'D';
          else overall_grade = 'F';
        }

        // Generate report card
        const reportCardResult = await pool.query(
          `INSERT INTO report_cards (student_user_id, school_id, term, academic_year, overall_grade, overall_percentage, attendance_percentage, teacher_comments, principal_comments)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (student_user_id, school_id, term, academic_year)
           DO UPDATE SET overall_grade = $5, overall_percentage = $6, attendance_percentage = $7, teacher_comments = $8, principal_comments = $9, generated_at = NOW()
           RETURNING *`,
          [student.id, school_id, term, academic_year, overall_grade, overall_percentage, null, null, null]
        );

        const reportCard = reportCardResult.rows[0];
        results.push(reportCard);

        // Send notifications
        await createNotification(
          student.id,
          'Report Card Available',
          `Your report card for ${term} ${academic_year} is now available`,
          'success',
          '/student'
        );

        // Notify parents
        const parentsResult = await pool.query(
          'SELECT parent_id FROM parent_child_relationships WHERE child_id = $1',
          [student.id]
        );
        for (const parent of parentsResult.rows) {
          await createNotification(
            parent.parent_id,
            'Child Report Card Available',
            `Your child ${student.first_name} ${student.last_name}'s report card for ${term} ${academic_year} is now available`,
            'success',
            '/parent'
          );
        }

        // Send email if requested
        if (send_emails === true || send_emails === 'true') {
          try {
            const schoolResult = await pool.query('SELECT name FROM schools WHERE id = $1', [school_id]);
            const schoolName = schoolResult.rows[0]?.name || 'School';

            await sendNotificationEmail(
              student.email,
              `${student.first_name} ${student.last_name}`,
              `Report Card Available - ${term} ${academic_year}`,
              `Your report card for ${term} ${academic_year} at ${schoolName} is now available. Overall Grade: ${overall_grade || 'N/A'} (${overall_percentage ? overall_percentage.toFixed(1) : 'N/A'}%)`,
              `${process.env.FRONTEND_URL || 'http://localhost:3000'}/student`
            );

            // Send to parents
            const parentUsersResult = await pool.query(
              `SELECT u.email, u.first_name, u.last_name 
               FROM parent_child_relationships pcr
               INNER JOIN users u ON pcr.parent_id = u.id
               WHERE pcr.child_id = $1`,
              [student.id]
            );
            for (const parent of parentUsersResult.rows) {
              await sendNotificationEmail(
                parent.email,
                `${parent.first_name} ${parent.last_name}`,
                `Child Report Card Available - ${student.first_name} ${student.last_name}`,
                `Your child ${student.first_name} ${student.last_name}'s report card for ${term} ${academic_year} at ${schoolName} is now available. Overall Grade: ${overall_grade || 'N/A'} (${overall_percentage ? overall_percentage.toFixed(1) : 'N/A'}%)`,
                `${process.env.FRONTEND_URL || 'http://localhost:3000'}/parent`
              );
            }
          } catch (emailErr) {
            console.error(`Failed to send email to ${student.email}:`, emailErr.message);
            errors.push({ student: student.email, error: 'Email send failed' });
          }
        }
      } catch (err) {
        errors.push({ student: student.email, error: err.message });
      }
    }

    res.json({
      success: true,
      generated: results.length,
      errors: errors.length,
      results: results,
      errors: errors
    });
  } catch (err) {
    console.error('Error bulk generating report cards:', err.message);
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

module.exports = router;
