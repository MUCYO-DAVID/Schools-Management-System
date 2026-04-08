require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const initializeDb = require('./db/schema');
const schoolsRouter = require('./routes/schools');
const contactsRouter = require('./routes/contacts');
const authRouter = require('./routes/auth');
const surveysRouter = require('./routes/surveys');
const faqsRouter = require('./routes/faqs');
const studentApplicationsRouter = require('./routes/studentApplications');
const schoolDetailsRouter = require('./routes/schoolDetails');
const chatRouter = require('./routes/chat');
const activitiesRouter = require('./routes/activities');
const portalRouter = require('./routes/portal');
const paymentsRouter = require('./routes/payments');
const usersRouter = require('./routes/users');
const notificationsRouter = require('./routes/notifications');
const gradesRouter = require('./routes/grades');
const eventsRouter = require('./routes/events');
const galleriesRouter = require('./routes/galleries');
const realtimeChatRouter = require('./routes/realtime-chat');
const scholarshipsRouter = require('./routes/scholarships');
const parentChildRouter = require('./routes/parentChild');
const surveyTemplatesRouter = require('./routes/surveyTemplates');
const connectionsRouter = require('./routes/connections');

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
app.use('/api', chatRouter);
app.use('/api', activitiesRouter);
app.use('/api', portalRouter);
app.use('/api', paymentsRouter);
app.use('/api', usersRouter);
app.use('/api', notificationsRouter);
app.use('/api', gradesRouter);
app.use('/api', eventsRouter);
app.use('/api', galleriesRouter);
app.use('/api', realtimeChatRouter);
app.use('/api', scholarshipsRouter);
app.use('/api', parentChildRouter);
app.use('/api', surveyTemplatesRouter);
app.use('/api', connectionsRouter);

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