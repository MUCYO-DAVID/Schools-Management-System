require('dotenv').config(); // Add this line at the very top

const express = require('express');
const cors = require('cors');
const path = require('path');

const initializeDb = require('./db/schema');
const schoolsRouter = require('./routes/schools');
const contactsRouter = require('./routes/contacts')
const authRouter = require('./routes/auth');
const surveysRouter = require('./routes/surveys');
const faqsRouter = require('./routes/faqs');

const app = express();
const port = process.env.PORT || 5000;
const initDb = require('./init');
app.use(cors());
app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', schoolsRouter);
app.use('/api', contactsRouter);
app.use('/api', authRouter);
app.use('/api', surveysRouter);
app.use('/api', faqsRouter);


initDb();

// Start server
app.listen(port, async () => {
  console.log(`🚀 Server running on port ${port}`);
  // Initialize database schema (tables) only; do not auto-seed schools.
  await initializeDb();
});
