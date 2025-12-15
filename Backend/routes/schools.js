const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const router = express.Router();
const pool = require('../db');

// Multer storage configuration for school images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });

router.get('/schools', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM schools');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching schools:', err.message);
    res.status(500).send('Server Error');
  }
});

// Get top-rated schools (e.g., for homepage recommendations)
router.get('/schools/top', async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 4;
    const result = await pool.query(
      `SELECT *,
              CASE
                WHEN rating_count > 0 THEN rating_total::FLOAT / rating_count
                ELSE 0
              END AS average_rating
       FROM schools
       ORDER BY average_rating DESC, created_at DESC
       LIMIT $1`,
      [limit]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching top schools:', err.message);
    res.status(500).send('Server Error');
  }
});

// Create school with optional images
router.post('/schools', upload.array('images', 10), async (req, res) => {
  const {
    name,
    nameRw,
    name_rw,
    location,
    type,
    level,
    students,
    established,
  } = req.body;

  const schoolId = uuidv4();

  // Map potential field name differences between frontend and backend
  const englishName = name;
  const kinyarwandaName = name_rw || nameRw || '';

  const imageUrls = (req.files || []).map((file) => `/uploads/${file.filename}`);

  try {
    const newSchool = await pool.query(
      `INSERT INTO schools
        (id, name, name_rw, location, type, level, students, established, image_urls)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        schoolId,
        englishName,
        kinyarwandaName,
        location,
        type,
        level,
        students ? Number(students) : 0,
        established ? Number(established) : null,
        imageUrls.length ? JSON.stringify(imageUrls) : null,
      ]
    );

    res.status(201).json(newSchool.rows[0]);
  } catch (error) {
    console.error('Error inserting school:', error.message);
    res.status(500).send('Server Error');
  }
});

// Rate a school (1–5 stars)
router.post('/schools/:id/rate', async (req, res) => {
  const { id } = req.params;
  const { rating } = req.body;

  const parsedRating = Number(rating);
  if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  try {
    const result = await pool.query(
      `UPDATE schools
       SET rating_total = rating_total + $1,
           rating_count = rating_count + 1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [parsedRating, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'School not found' });
    }

    const updated = result.rows[0];
    const average_rating =
      updated.rating_count > 0
        ? updated.rating_total / updated.rating_count
        : 0;

    res.json({ ...updated, average_rating });
  } catch (err) {
    console.error('Error rating school:', err.message);
    res.status(500).send('Server Error');
  }
});
router.delete('/schools/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM schools WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).send('School not found');
        }
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting school:', err.message);
        res.status(500).send('Server Error');
    }
});
// Update school with optional new images and deletions
router.put('/schools/:id', upload.array('images', 10), async (req, res) => {
  const { id } = req.params;
  const {
    name,
    nameRw,
    name_rw,
    location,
    type,
    level,
    students,
    established,
    imagesToDelete,
  } = req.body;

  try {
    // Fetch existing school to merge image URLs
    const existing = await pool.query('SELECT image_urls FROM schools WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).send('School not found');
    }

    let currentImages = [];
    if (existing.rows[0].image_urls) {
      try {
        currentImages = JSON.parse(existing.rows[0].image_urls);
      } catch {
        currentImages = [];
      }
    }

    // Normalize imagesToDelete into an array
    let toDelete = [];
    if (imagesToDelete) {
      if (Array.isArray(imagesToDelete)) {
        toDelete = imagesToDelete;
      } else {
        toDelete = [imagesToDelete];
      }
    }

    // Remove deleted images from the list and disk
    toDelete.forEach((url) => {
      const index = currentImages.indexOf(url);
      if (index !== -1) {
        currentImages.splice(index, 1);
      }
      const filePath = path.join(__dirname, '..', url.replace(/^\/+/, ''));
      fs.unlink(filePath, () => {});
    });

    // Add newly uploaded images
    const newImageUrls = (req.files || []).map((file) => `/uploads/${file.filename}`);
    const finalImages = [...currentImages, ...newImageUrls];

    const englishName = name;
    const kinyarwandaName = name_rw || nameRw || '';

    const result = await pool.query(
      `UPDATE schools
       SET name = $1,
           name_rw = $2,
           location = $3,
           type = $4,
           level = $5,
           students = $6,
           established = $7,
           image_urls = $8,
           updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [
        englishName,
        kinyarwandaName,
        location,
        type,
        level,
        students ? Number(students) : 0,
        established ? Number(established) : null,
        finalImages.length ? JSON.stringify(finalImages) : null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('School not found');
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating school:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
