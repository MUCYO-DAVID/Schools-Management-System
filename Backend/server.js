require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const initializeDb = require('./db/schema');
const schoolsRouter = require('./routes/schools');
const contactsRouter = require('./routes/contacts')
const authRouter = require('./routes/auth');
const surveysRouter = require('./routes/surveys');
const faqsRouter = require('./routes/faqs');
const studentApplicationsRouter = require('./routes/studentApplications');
const schoolDetailsRouter = require('./routes/schoolDetails');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api', schoolsRouter);
app.use('/api', contactsRouter);
app.use('/api', authRouter);
app.use('/api', surveysRouter);
app.use('/api', faqsRouter);
app.use('/api/student', studentApplicationsRouter);
app.use('/api', schoolDetailsRouter);

// Start server after DB init
(async () => {
  try {
    await initializeDb();

    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });

    // Keep Node alive (Windows safety)
    setInterval(() => { }, 1000);

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();
