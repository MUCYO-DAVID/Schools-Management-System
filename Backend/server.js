const express = require('express');
const cors = require('cors');

const initializeDb = require('./db/schema');
const seedSchools = require('./db/seed');
const schoolsRouter = require('./routes/schools');
const contactsRouter =require('./routes/contacts')

const app = express();
const port = process.env.PORT || 5000;
const initDb = require('./init');
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', schoolsRouter);
app.use('/api', contactsRouter);


initDb();

// Start server
app.listen(port, async () => {
  console.log(`🚀 Server running on port ${port}`);
  await initializeDb();
  await seedSchools();
});
