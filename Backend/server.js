require('dotenv').config();
const { createApp, ensureDb } = require('./createApp');
const { getEmailStatus } = require('./utils/emailService');

const port = process.env.PORT || 5000;

(async () => {
  try {
    await ensureDb();
    const app = createApp();

    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      const aiConfigured = Boolean((process.env.GROQ_API_KEY || '').replace(/["']/g, '').trim());
      const emailStatus = getEmailStatus();
      console.log(
        aiConfigured
          ? `✅ Groq AI configured (model: ${process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'})`
          : '❌ GROQ_API_KEY missing on Render'
      );
      console.log(
        emailStatus.configured
          ? `✅ Email service configured (${emailStatus.service}) — ${emailStatus.host || 'gmail'}`
          : '❌ Email not configured on Render — add EMAIL_SERVICE, SMTP_USER, SMTP_PASSWORD, SMTP_HOST'
      );
    });

    setInterval(() => {}, 1000);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();
