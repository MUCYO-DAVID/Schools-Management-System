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
const { getEmailStatus, verifyEmailConnection, sendTestEmail } = require('./utils/emailService');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

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

let dbInitPromise = null;

const ensureDb = async () => {
  if (!dbInitPromise) {
    dbInitPromise = initializeDb();
  }
  return dbInitPromise;
};

const createApp = () => {
  const app = express();

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

  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // Swagger UI — open at /api-docs (no auth required for presentation)
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'RSBS API Docs',
    swaggerOptions: { persistAuthorization: true },
  }));

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

  app.get('/api/health', (req, res) => {
    res.json({
      ok: true,
      platform: process.env.VERCEL ? 'vercel' : 'node',
      aiEngine: 'groq-only',
      gitCommit: process.env.RENDER_GIT_COMMIT || null,
      gitBranch: process.env.RENDER_GIT_BRANCH || null,
    });
  });

  app.get('/api/health/email', async (req, res) => {
    const status = getEmailStatus();
    const verify = status.configured ? await verifyEmailConnection() : { ok: false, message: 'Not configured' };
    return res.json({
      success: true,
      emailConfigured: status.configured,
      emailReady: verify.ok,
      smtpReady: verify.ok,
      service: status.service,
      transport: status.transport,
      host: status.host,
      from: status.from,
      hasUser: status.hasUser,
      hasPassword: status.hasPassword,
      hasBrevoApiKey: status.hasBrevoApiKey,
      brevoKeyValid: status.brevoKeyValid,
      brevoKeyIssue: status.brevoKeyIssue,
      message: verify.ok
        ? 'Email service ready'
        : status.brevoKeyIssue ||
          verify.message ||
          'Local dev: set SMTP_USER + SMTP_PASSWORD. Render: set BREVO_API_KEY (xkeysib-...).',
    });
  });

  // Diagnostic: send a test email and return the provider's real result.
  // Locked to the system sender address only, so it cannot be abused to spam others.
  // Usage: /api/health/email/test
  app.get('/api/health/email/test', async (req, res) => {
    const status = getEmailStatus();
    const senderMatch = String(status.from || '').match(/<([^>]+)>/);
    const to = (senderMatch ? senderMatch[1] : status.from || '').trim();
    if (!to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
      return res.status(400).json({ success: false, message: 'No valid sender address configured (EMAIL_FROM).' });
    }
    const result = await sendTestEmail(to);
    return res.status(result.ok ? 200 : 502).json({ success: result.ok, sentTo: to, ...result });
  });

  return app;
};

module.exports = {
  createApp,
  ensureDb,
};
