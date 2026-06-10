require('dotenv').config();
const { createApp, ensureDb } = require('./createApp');

const port = process.env.PORT || 5000;

(async () => {
  try {
    await ensureDb();
    const app = createApp();

    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      const aiConfigured = Boolean((process.env.GROQ_API_KEY || '').replace(/["']/g, '').trim());
      const emailConfigured = Boolean(
        process.env.RESEND_API_KEY ||
          (process.env.EMAIL_SERVICE && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) ||
          (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) ||
          (!process.env.NODE_ENV || process.env.NODE_ENV !== 'production')
      );
      console.log(
        aiConfigured
          ? `✅ Groq AI configured (model: ${process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'})`
          : '❌ GROQ_API_KEY missing on Render — add it under Environment variables'
      );
      console.log(
        emailConfigured
          ? '✅ Email service configured'
          : '❌ Email not configured — OTP emails will not be delivered'
      );
    });

    setInterval(() => {}, 1000);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();
