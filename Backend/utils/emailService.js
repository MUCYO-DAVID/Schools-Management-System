const nodemailer = require('nodemailer');

const isProduction = process.env.NODE_ENV === 'production' || !!process.env.RENDER;

const stripQuotes = (value) => {
  if (!value) return '';
  const trimmed = String(value).trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
};

const getMailUser = () =>
  stripQuotes(process.env.EMAIL_USER) || stripQuotes(process.env.SMTP_USER);

const getMailPass = () => {
  const raw =
    stripQuotes(process.env.EMAIL_PASSWORD) || stripQuotes(process.env.SMTP_PASSWORD);
  // Gmail app passwords are sometimes pasted with spaces — strip them
  return raw.replace(/\s+/g, '');
};

const getResendApiKey = () => stripQuotes(process.env.RESEND_API_KEY);

const getBrevoApiKeyRaw = () => stripQuotes(process.env.BREVO_API_KEY);

// Brevo API keys start with "xkeysib-". The SMTP key (xsmtpsib-) will not work here.
const getBrevoKeyIssue = (key = getBrevoApiKeyRaw()) => {
  if (!key) return 'BREVO_API_KEY is missing.';
  if (key.startsWith('xsmtpsib-')) {
    return 'Wrong key type: that is the Brevo SMTP key (xsmtpsib-). In Brevo go to Settings → SMTP & API → API Keys and create an API key that starts with xkeysib-.';
  }
  if (!key.startsWith('xkeysib-')) {
    return 'BREVO_API_KEY must start with xkeysib- (Brevo API key, not the SMTP password).';
  }
  return null;
};

const getBrevoApiKey = () => {
  const key = getBrevoApiKeyRaw();
  return getBrevoKeyIssue(key) ? '' : key;
};

// HTTP-based providers (Resend, Brevo) use HTTPS/443, which works on Render where
// outbound SMTP ports (587/465) are blocked.
const usesHttpEmail = () => {
  const service = resolveEmailService();
  return service === 'resend' || service === 'brevo';
};

// Provider priority is driven by which credentials are present, so the SAME codebase
// runs Gmail SMTP locally and a cloud-friendly HTTP API on Render with zero code changes.
//   1. Resend   — if RESEND_API_KEY is set
//   2. Brevo    — if BREVO_API_KEY is set (recommended for Render production)
//   3. SMTP/Gmail — local dev fallback using SMTP_USER / SMTP_PASSWORD
const resolveEmailService = () => {
  if (getResendApiKey()) return 'resend';
  if (getBrevoApiKeyRaw()) return 'brevo';

  const explicit = stripQuotes(process.env.EMAIL_SERVICE).toLowerCase();
  if (explicit === 'smtp' || explicit === 'gmail') return explicit;

  if (getMailUser() && getMailPass()) {
    if (stripQuotes(process.env.SMTP_HOST)) return 'smtp';
    return 'gmail';
  }
  return null;
};

const getSmtpHost = () => {
  const configured = stripQuotes(process.env.SMTP_HOST);
  if (configured) return configured;

  const user = getMailUser().toLowerCase();
  if (user.endsWith('@gmail.com') || user.endsWith('@googlemail.com')) {
    return 'smtp.gmail.com';
  }

  return null;
};

const extractEmailAddress = (value) => {
  const match = String(value || '').match(/<([^>]+)>/);
  return (match ? match[1] : value || '').trim();
};

const getFromAddress = () => {
  const user = getMailUser();
  const configured = stripQuotes(process.env.EMAIL_FROM);
  const displayName = 'Rwanda School Bridge System';
  const service = resolveEmailService();

  if (service === 'gmail' || service === 'smtp') {
    if (user) {
      if (configured && extractEmailAddress(configured).toLowerCase() === user.toLowerCase()) {
        return configured;
      }
      return `${displayName} <${user}>`;
    }
  }

  if (configured) return configured;
  if (user) return `${displayName} <${user}>`;
  return `${displayName} <noreply@rsbs.rw>`;
};

const getEmailStatus = () => {
  const service = resolveEmailService();
  const user = getMailUser();
  const pass = getMailPass();
  const host = getSmtpHost();
  const brevoKeyRaw = getBrevoApiKeyRaw();
  const brevoKeyIssue = brevoKeyRaw ? getBrevoKeyIssue(brevoKeyRaw) : null;
  const brevoKeyValid = Boolean(getBrevoApiKey());
  const resendKey = getResendApiKey();

  const configured = Boolean(
    service === 'resend'
      ? resendKey
      : service === 'brevo'
        ? brevoKeyValid
        : service && user && pass && (service !== 'smtp' || host)
  );

  const reportedHost =
    service === 'brevo' ? 'api.brevo.com' : service === 'resend' ? 'api.resend.com' : host || null;

  return {
    configured,
    service: service || 'none',
    host: reportedHost,
    from: getFromAddress(),
    hasUser: Boolean(user),
    hasPassword: Boolean(pass),
    hasSmtpHost: Boolean(host),
    hasBrevoApiKey: Boolean(brevoKeyRaw),
    brevoKeyValid,
    brevoKeyIssue,
    hasResendApiKey: Boolean(resendKey),
    transport: usesHttpEmail() ? 'https-api' : 'smtp',
    isProduction,
  };
};

const parseSender = () => {
  const from = getFromAddress();
  const email = extractEmailAddress(from) || getMailUser();
  const nameMatch = String(from).match(/^(.+?)\s*</);
  const name = nameMatch
    ? nameMatch[1].trim().replace(/^["']|["']$/g, '')
    : 'Rwanda School Bridge System';
  return { name, email };
};

const formatBrevoError = (message = '') => {
  const text = String(message);
  if (/unrecognised ip|unrecognized ip|authorised_ips|authorized_ips/i.test(text)) {
    return (
      'Brevo blocked the server IP. In Brevo go to Security → Authorized IPs and turn OFF IP ' +
      'restriction (recommended for cloud hosting like Render), or whitelist the IP at ' +
      'https://app.brevo.com/security/authorised_ips'
    );
  }
  return text || 'Brevo could not send the email.';
};

const sendViaBrevoApi = async (mailOptions) => {
  const keyIssue = getBrevoKeyIssue();
  if (keyIssue) {
    throw new Error(keyIssue);
  }
  const apiKey = getBrevoApiKey();
  const sender = parseSender();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: sender.name, email: sender.email },
        to: [{ email: mailOptions.to }],
        subject: mailOptions.subject,
        htmlContent: mailOptions.html,
        textContent: mailOptions.text,
        replyTo: mailOptions.replyTo ? { email: extractEmailAddress(mailOptions.replyTo) } : undefined,
      }),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        formatBrevoError(data.message || data.code || `Brevo API error (${response.status})`)
      );
    }

    return { messageId: data.messageId || `brevo-${Date.now()}` };
  } finally {
    clearTimeout(timeout);
  }
};

const sendViaResend = async (mailOptions) => {
  const apiKey = stripQuotes(process.env.RESEND_API_KEY);
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: getFromAddress(),
      to: [mailOptions.to],
      subject: mailOptions.subject,
      html: mailOptions.html,
      text: mailOptions.text,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || `Resend API error (${response.status})`);
  }

  return { messageId: data.id || `resend-${Date.now()}` };
};

const createSmtpTransport = ({ port, secure }) => {
  const host = getSmtpHost() || 'smtp.gmail.com';
  const user = getMailUser();
  const pass = getMailPass();

  if (!user || !pass) {
    throw new Error('SMTP_USER and SMTP_PASSWORD are required');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    pool: true,
    maxConnections: 3,
    maxMessages: 50,
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 12000,
    tls: { rejectUnauthorized: true },
  });
};

let cachedTransport = null;
let cachedTransportLabel = null;

const getMailTransport = () => {
  if (cachedTransport) return { transport: cachedTransport, label: cachedTransportLabel };

  const service = resolveEmailService();
  const user = getMailUser();
  const pass = getMailPass();

  if (service === 'resend') {
    return { transport: null, label: 'resend' };
  }

  if (!user || !pass) {
    return { transport: null, label: 'unconfigured' };
  }

  if (service === 'gmail') {
    cachedTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      pool: true,
      maxConnections: 3,
      maxMessages: 50,
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 12000,
    });
    cachedTransportLabel = 'gmail-service';
    return { transport: cachedTransport, label: cachedTransportLabel };
  }

  if (service === 'smtp') {
    const port = parseInt(process.env.SMTP_PORT, 10) || 587;
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;
    cachedTransport = createSmtpTransport({ port, secure });
    cachedTransportLabel = `smtp-${port}`;
    return { transport: cachedTransport, label: cachedTransportLabel };
  }

  return { transport: null, label: 'unconfigured' };
};

const buildMailOptions = ({ to, subject, html, text }) => {
  const from = getFromAddress();
  const sender = getMailUser() || extractEmailAddress(from);
  const service = resolveEmailService();
  const plainText =
    text ||
    html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const options = {
    from,
    to,
    subject,
    html,
    text: plainText,
    replyTo: stripQuotes(process.env.EMAIL_REPLY_TO) || sender || undefined,
    headers: {
      'X-Priority': '1',
      Importance: 'high',
    },
  };

  if ((service === 'gmail' || service === 'smtp') && sender) {
    options.envelope = { from: sender, to };
  }

  return options;
};

const sendMail = async (mailOptions) => {
  const status = getEmailStatus();

  if (!status.configured) {
    if (!isProduction) {
      console.log('\n📧 Email would be sent (dev mode):');
      console.log('To:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      console.log('Body:', mailOptions.text || mailOptions.html);
      return { messageId: 'dev-mode-' + Date.now() };
    }
    throw new Error(
      'Email not configured. Local dev: set SMTP_USER + SMTP_PASSWORD (Gmail App Password). ' +
        'Render production: set BREVO_API_KEY (starts with xkeysib-).'
    );
  }

  const service = resolveEmailService();
  if (service === 'resend') {
    const result = await sendViaResend(mailOptions);
    console.log(`📬 Email sent via resend to ${mailOptions.to}`);
    return result;
  }

  if (service === 'brevo') {
    const result = await sendViaBrevoApi(mailOptions);
    console.log(`📬 Email sent via brevo-api to ${mailOptions.to} (id: ${result.messageId})`);
    return result;
  }

  const { transport, label } = getMailTransport();
  if (!transport) {
    throw new Error('Email transport not available. Check SMTP_USER and SMTP_PASSWORD on Render.');
  }

  const result = await transport.sendMail(mailOptions);
  console.log(`📬 Email sent via ${label} to ${mailOptions.to} (id: ${result.messageId || 'n/a'})`);
  return result;
};

const verifyEmailConnection = async () => {
  const status = getEmailStatus();
  if (!status.configured) {
    return { ok: false, message: 'Email not configured', status };
  }

  if (status.service === 'resend') {
    return { ok: true, message: 'Resend API configured', status };
  }

  if (status.service === 'brevo') {
    if (status.brevoKeyIssue) {
      return { ok: false, message: status.brevoKeyIssue, status };
    }
    try {
      const response = await fetch('https://api.brevo.com/v3/account', {
        headers: { 'api-key': getBrevoApiKey(), accept: 'application/json' },
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        return {
          ok: false,
          message: formatBrevoError(data.message || `Brevo rejected the API key (${response.status})`),
          status,
        };
      }
      return { ok: true, message: 'Brevo API verified', status };
    } catch (error) {
      return { ok: false, message: error.message || 'Could not reach Brevo API', status };
    }
  }

  const { transport, label } = getMailTransport();
  if (!transport) {
    return { ok: false, message: 'Transport not configured', status };
  }

  try {
    await transport.verify();
    return { ok: true, message: `SMTP verified (${label})`, status };
  } catch (error) {
    return { ok: false, message: error.message, status };
  }
};

// Log status at startup
const startupStatus = getEmailStatus();

// Warn early if SMTP is selected in production — Render blocks outbound SMTP ports.
if (startupStatus.configured && startupStatus.service === 'smtp' && isProduction) {
  console.warn('⚠️  Using SMTP in production. Render blocks SMTP ports (587/465).');
  console.warn('   If emails time out, add BREVO_API_KEY (xkeysib-...) to switch to the Brevo HTTP API.');
}

// Pre-warm the SMTP pool only for real SMTP/Gmail transports (HTTP APIs need no transport).
if (startupStatus.configured && !usesHttpEmail()) {
  getMailTransport();
}

if (startupStatus.configured) {
  console.log(
    `✅ Email service configured (${startupStatus.service}) — host: ${startupStatus.host || 'gmail'} — from: ${startupStatus.from}`
  );
  verifyEmailConnection()
    .then((result) => {
      if (!result.ok) {
        console.error('❌ Email verify failed:', result.message);
        if (startupStatus.service === 'brevo') {
          console.error('   Check BREVO_API_KEY (must start with xkeysib-) and Brevo Authorized IPs.');
        } else {
          console.error('   Local dev: check SMTP_USER / SMTP_PASSWORD (Gmail App Password, no spaces).');
        }
      }
    })
    .catch(() => {});
} else if (isProduction) {
  console.error('❌ Email NOT configured on Render — OTP emails will fail.');
  console.error('   Add BREVO_API_KEY (xkeysib-...) and EMAIL_FROM to the Render environment.');
} else {
  console.log('📧 Email service in dev console mode (emails logged, not sent)');
}

const sendApplicationStatusEmail = async (studentEmail, studentName, schoolName, status, reason = '') => {
  const statusColors = {
    approved: '#10b981',
    rejected: '#ef4444',
    pending: '#f59e0b',
    withdrawn: '#6b7280',
  };

  const statusMessages = {
    approved: 'Congratulations! Your application has been approved.',
    rejected: 'We regret to inform you that your application was not successful.',
    pending: 'Your application is currently under review.',
    withdrawn: 'Your application has been withdrawn.',
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="font-family: Arial, sans-serif;">
      <h2>Application Update - ${schoolName}</h2>
      <p>Dear ${studentName},</p>
      <p style="color: ${statusColors[status] || '#333'}">${statusMessages[status] || 'Status updated.'}</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
    </body>
    </html>
  `;

  try {
    await sendMail(
      buildMailOptions({
        to: studentEmail,
        subject: `Application ${status} - ${schoolName}`,
        html: htmlContent,
      })
    );
  } catch (error) {
    console.error('❌ Error sending application status email:', error.message);
  }
};

const sendNewApplicationNotification = async (leaderEmail, schoolName, studentName) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif;">
      <h2>New Application Received</h2>
      <p>A new application from <strong>${studentName}</strong> was submitted to <strong>${schoolName}</strong>.</p>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/leader">Review in dashboard</a></p>
    </body>
    </html>
  `;

  try {
    await sendMail(
      buildMailOptions({
        to: leaderEmail,
        subject: `New Application - ${studentName}`,
        html: htmlContent,
      })
    );
  } catch (error) {
    console.error('❌ Error sending notification email:', error.message);
  }
};

const sendVerificationCode = async (email, code) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .code-box { background: white; border: 2px dashed #3b82f6; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
        .code { font-size: 32px; font-weight: bold; color: #1e40af; letter-spacing: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Rwanda School Bridge System</h1>
          <p>Login Verification Code</p>
        </div>
        <div class="content">
          <h2>Your Verification Code</h2>
          <p>Use this code to complete your login:</p>
          <div class="code-box"><div class="code">${code}</div></div>
          <p><strong>This code will expire in 10 minutes.</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendMail(
    buildMailOptions({
      to: email,
      subject: 'Your RSBS Login Verification Code',
      html: htmlContent,
      text: `Your Rwanda School Bridge System login code is: ${code}\n\nThis code expires in 10 minutes.`,
    })
  );
  console.log(`✅ Verification code email sent to: ${email}`);
};

const sendNotificationEmail = async (userEmail, userName, title, message, link = null) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif;">
      <h2>${title}</h2>
      <p>Hello ${userName},</p>
      <p>${message}</p>
      ${link ? `<p><a href="${link}">View Details</a></p>` : ''}
    </body>
    </html>
  `;

  try {
    await sendMail(
      buildMailOptions({
        to: userEmail,
        subject: title,
        html: htmlContent,
      })
    );
  } catch (error) {
    console.error('❌ Error sending notification email:', error.message);
  }
};

module.exports = {
  sendApplicationStatusEmail,
  sendNotificationEmail,
  sendNewApplicationNotification,
  sendVerificationCode,
  getEmailStatus,
  verifyEmailConnection,
  usesHttpEmail,
};
