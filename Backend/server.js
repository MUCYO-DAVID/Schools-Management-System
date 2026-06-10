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
const adsRouter = require('./routes/ads');

const app = express();
const port = process.env.PORT || 5000;

const normalizeOrigin = (origin) => origin.replace(/\/$/, '');
const splitOrigins = (value) =>
  (value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map(normalizeOrigin);

const allowedOrigins = new Set([
  ...splitOrigins(process.env.FRONTEND_URL),
  ...splitOrigins(process.env.FRONTEND_URLS),
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
]);

const isAllowedOrigin = (origin) => {
  const normalizedOrigin = normalizeOrigin(origin);
  if (allowedOrigins.has(normalizedOrigin)) {
    return true;
  }
  try {
    const { hostname } = new URL(normalizedOrigin);
    if (hostname.endsWith('.vercel.app') || hostname.endsWith('.onrender.com')) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      console.warn(`CORS blocked origin: ${origin}`);
      return callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);
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
app.use('/api', adsRouter);

// Start server after DB init
(async () => {
  try {
    await initializeDb();
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      const aiConfigured = Boolean((process.env.GROQ_API_KEY || '').trim());
      const emailConfigured = Boolean(
        process.env.RESEND_API_KEY ||
          (process.env.EMAIL_SERVICE && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) ||
          (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) ||
          (!process.env.NODE_ENV || process.env.NODE_ENV !== 'production')
      );
      console.log(aiConfigured ? '✅ Groq AI configured' : '❌ GROQ_API_KEY missing — AI chat will not work on deployment');
      console.log(
        emailConfigured
          ? '✅ Email service configured'
          : '❌ Email not configured — OTP emails will not be delivered'
      );
      if (allowedOrigins.size > 0) {
        console.log(`🌐 CORS allowed origins: ${[...allowedOrigins].join(', ')} (+ *.vercel.app)`);
      }
    });
    // Keep Node alive (Windows safety)
    setInterval(() => { }, 1000);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();
