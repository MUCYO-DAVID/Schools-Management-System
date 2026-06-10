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

const resolveEmailService = () => {
  if (process.env.EMAIL_SERVICE) {
    return process.env.EMAIL_SERVICE.toLowerCase();
  }
  if (process.env.RESEND_API_KEY) {
    return 'resend';
  }
  if (getMailUser() && getMailPass()) {
    if (process.env.SMTP_HOST) return 'smtp';
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

  return {
    configured: Boolean(
      service === 'resend'
        ? process.env.RESEND_API_KEY
        : service && user && pass && (service !== 'smtp' || host)
    ),
    service: service || 'none',
    host: host || null,
    from: getFromAddress(),
    hasUser: Boolean(user),
    hasPassword: Boolean(pass),
    hasSmtpHost: Boolean(host),
    isProduction,
  };
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

const createSmtpTransport = ({ port, secure, name }) => {
  const host = getSmtpHost() || 'smtp.gmail.com';
  const user = getMailUser();
  const pass = getMailPass();

  if (!user || !pass) {
    throw new Error('SMTP_USER and SMTP_PASSWORD are required');
  }

  return {
    name,
    transport: nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 25000,
      tls: { rejectUnauthorized: true },
    }),
  };
};

const getSendStrategies = () => {
  const service = resolveEmailService();
  if (service === 'resend') {
    return [{ name: 'resend', send: sendViaResend }];
  }

  if (service === 'gmail') {
    const user = getMailUser();
    const pass = getMailPass();
    return [
      {
        name: 'gmail-service',
        send: async (mailOptions) => {
          const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: { user, pass },
            connectionTimeout: 15000,
            greetingTimeout: 15000,
            socketTimeout: 25000,
          });
          return transport.sendMail(mailOptions);
        },
      },
    ];
  }

  if (service === 'smtp') {
    const configuredPort = parseInt(process.env.SMTP_PORT, 10);
    const configuredSecure = process.env.SMTP_SECURE === 'true';
    const strategies = [];

    if (configuredPort) {
      strategies.push({
        name: `smtp-${configuredPort}`,
        send: async (mailOptions) => {
          const { transport } = createSmtpTransport({
            port: configuredPort,
            secure: configuredSecure,
            name: `smtp-${configuredPort}`,
          });
          return transport.sendMail(mailOptions);
        },
      });
    }

    strategies.push(
      {
        name: 'smtp-587-starttls',
        send: async (mailOptions) => {
          const { transport } = createSmtpTransport({ port: 587, secure: false, name: 'smtp-587' });
          return transport.sendMail(mailOptions);
        },
      },
      {
        name: 'smtp-465-ssl',
        send: async (mailOptions) => {
          const { transport } = createSmtpTransport({ port: 465, secure: true, name: 'smtp-465' });
          return transport.sendMail(mailOptions);
        },
      },
      {
        name: 'gmail-service-fallback',
        send: async (mailOptions) => {
          const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: getMailUser(), pass: getMailPass() },
            connectionTimeout: 15000,
            greetingTimeout: 15000,
            socketTimeout: 25000,
          });
          return transport.sendMail(mailOptions);
        },
      }
    );

    return strategies;
  }

  if (isProduction) {
    return [
      {
        name: 'unconfigured',
        send: async () => {
          throw new Error(
            'Email not configured on server. Set EMAIL_SERVICE=smtp, SMTP_USER, SMTP_PASSWORD, SMTP_HOST on Render.'
          );
        },
      },
    ];
  }

  return [
    {
      name: 'dev-console',
      send: async (mailOptions) => {
        console.log('\n📧 Email would be sent (dev mode):');
        console.log('To:', mailOptions.to);
        console.log('Subject:', mailOptions.subject);
        console.log('Body:', mailOptions.text || mailOptions.html);
        console.log('-------------------\n');
        return { messageId: 'dev-mode-' + Date.now() };
      },
    },
  ];
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
    throw new Error(
      'Email service is not configured. On Render add: EMAIL_SERVICE=smtp, SMTP_HOST=smtp.gmail.com, SMTP_USER, SMTP_PASSWORD (Gmail App Password).'
    );
  }

  const strategies = getSendStrategies();
  let lastError = null;

  for (const strategy of strategies) {
    try {
      const result = await strategy.send(mailOptions);
      console.log(
        `📬 Email sent via ${strategy.name} to ${mailOptions.to} (id: ${result.messageId || 'n/a'})`
      );
      return result;
    } catch (error) {
      lastError = error;
      console.error(`❌ Email failed (${strategy.name}):`, error.message);
    }
  }

  throw lastError || new Error('Failed to send email');
};

const verifyEmailConnection = async () => {
  const status = getEmailStatus();
  if (!status.configured) {
    return { ok: false, message: 'Email not configured', status };
  }

  if (status.service === 'resend') {
    return { ok: true, message: 'Resend API configured', status };
  }

  const strategies = getSendStrategies().filter((s) => s.name.startsWith('smtp') || s.name === 'gmail-service');
  for (const strategy of strategies.slice(0, 2)) {
    try {
      if (strategy.name.startsWith('smtp')) {
        const port = strategy.name.includes('465') ? 465 : 587;
        const secure = port === 465;
        const { transport } = createSmtpTransport({ port, secure, name: strategy.name });
        await transport.verify();
        return { ok: true, message: `SMTP verified (${strategy.name})`, status };
      }
    } catch (error) {
      return { ok: false, message: error.message, status };
    }
  }

  return { ok: false, message: 'Could not verify SMTP', status };
};

// Log status at startup
const startupStatus = getEmailStatus();
if (startupStatus.configured) {
  console.log(
    `✅ Email service configured (${startupStatus.service}) — host: ${startupStatus.host || 'gmail'} — from: ${startupStatus.from}`
  );
  verifyEmailConnection()
    .then((result) => {
      if (!result.ok) {
        console.error('❌ Email verify failed:', result.message);
        console.error('   Fix SMTP_USER / SMTP_PASSWORD on Render (use Gmail App Password, no spaces)');
      }
    })
    .catch(() => {});
} else if (isProduction) {
  console.error('❌ Email NOT configured on Render — OTP emails will fail');
  console.error('   Required: EMAIL_SERVICE=smtp, SMTP_HOST=smtp.gmail.com, SMTP_USER, SMTP_PASSWORD');
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
};
