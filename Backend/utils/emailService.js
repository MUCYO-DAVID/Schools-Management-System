const nodemailer = require('nodemailer');

const isProduction = process.env.NODE_ENV === 'production' || !!process.env.RENDER;

const resolveEmailService = () => {
  if (process.env.EMAIL_SERVICE) {
    return process.env.EMAIL_SERVICE.toLowerCase();
  }
  if (process.env.RESEND_API_KEY) {
    return 'resend';
  }
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    return 'gmail';
  }
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    return 'smtp';
  }
  return null;
};

const emailServiceType = resolveEmailService();

const extractEmailAddress = (value) => {
  const match = String(value || '').match(/<([^>]+)>/);
  return (match ? match[1] : value || '').trim();
};

const getFromAddress = () => {
  const user = process.env.EMAIL_USER?.trim();
  const configured = process.env.EMAIL_FROM?.trim();
  const displayName = 'Rwanda School Bridge System';

  if (emailServiceType === 'gmail' || emailServiceType === 'smtp') {
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

const sendViaResend = async (mailOptions) => {
  const apiKey = process.env.RESEND_API_KEY;
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

const createTransporter = () => {
  if (emailServiceType === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER?.trim(),
        pass: process.env.EMAIL_PASSWORD?.trim(),
      },
    });
  }

  if (emailServiceType === 'smtp') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  if (emailServiceType === 'resend') {
    return {
      sendMail: sendViaResend,
    };
  }

  if (isProduction) {
    console.error(
      '❌ EMAIL NOT CONFIGURED FOR PRODUCTION. Set EMAIL_SERVICE=gmail (with EMAIL_USER + EMAIL_PASSWORD), EMAIL_SERVICE=smtp, or RESEND_API_KEY on your hosting provider.'
    );
    return {
      sendMail: async () => {
        throw new Error(
          'Email service is not configured for production. Set EMAIL_SERVICE and credentials on Render.'
        );
      },
    };
  }

  return {
    sendMail: async (mailOptions) => {
      console.log('\n📧 Email would be sent (dev mode):');
      console.log('To:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      console.log('Body:', mailOptions.html || mailOptions.text);
      console.log('-------------------\n');
      return { messageId: 'dev-mode-' + Date.now() };
    },
  };
};

const transporter = createTransporter();

if (emailServiceType === 'smtp' || emailServiceType === 'gmail') {
  transporter.verify((err) => {
    if (err) {
      console.error('❌ Email service FAILED to connect:', err.message);
      console.error('   Fix: Check EMAIL credentials (Gmail App Password may be expired)');
    } else {
      console.log(`✅ Email service connected (${emailServiceType})`);
    }
  });
} else if (emailServiceType === 'resend') {
  console.log(`✅ Email service configured (resend) — from: ${getFromAddress()}`);
} else if (isProduction) {
  console.error('❌ Production email service is NOT configured — OTP emails will fail until env vars are set');
} else {
  console.log('📧 Email service in dev console mode (emails logged, not sent)');
}

const buildMailOptions = ({ to, subject, html, text }) => {
  const from = getFromAddress();
  const sender = process.env.EMAIL_USER?.trim() || extractEmailAddress(from);
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
    replyTo: process.env.EMAIL_REPLY_TO?.trim() || sender || undefined,
    headers: {
      'X-Priority': '1',
      Importance: 'high',
    },
  };

  if ((emailServiceType === 'gmail' || emailServiceType === 'smtp') && sender) {
    options.envelope = { from: sender, to };
  }

  return options;
};

const sendMail = async (mailOptions) => {
  const result = await transporter.sendMail(mailOptions);
  console.log(`📬 Email accepted for delivery to ${mailOptions.to} (id: ${result.messageId || 'n/a'})`);
  return result;
};

// Send application status email to student
const sendApplicationStatusEmail = async (application, status, rejectionReason = null) => {
  const { email, first_name, last_name, parent_email, school_name } = application;

  let statusText = '';
  let statusColor = '';
  let messageContent = '';

  if (status === 'approved') {
    statusText = 'Approved';
    statusColor = '#10b981';
    messageContent = `
      <p>Congratulations! Your application to <strong>${school_name}</strong> has been approved.</p>
      <p>The school will contact you soon with the next steps for enrollment.</p>
    `;
  } else if (status === 'rejected') {
    statusText = 'Not Approved';
    statusColor = '#ef4444';
    messageContent = `
      <p>We regret to inform you that your application to <strong>${school_name}</strong> was not approved at this time.</p>
      ${rejectionReason ? `<p><strong>Reason:</strong> ${rejectionReason}</p>` : ''}
      <p>We encourage you to apply again in the future or consider other schools in the system.</p>
    `;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .status-badge { display: inline-block; padding: 10px 20px; background: ${statusColor}; color: white; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
        .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Rwanda School Bridge System</h1>
          <p>Application Status Update</p>
        </div>
        <div class="content">
          <h2>Dear ${first_name} ${last_name},</h2>
          <div class="status-badge">Application Status: ${statusText}</div>
          ${messageContent}
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/student?tab=applications" class="button">View Your Applications</a>
          <p style="margin-top: 30px;">If you have any questions, please contact the school directly or reach out to our support team.</p>
        </div>
        <div class="footer">
          <p>This is an automated message from Rwanda School Bridge System</p>
          <p>Please do not reply to this email</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = buildMailOptions({
    to: email,
    subject: `Application ${statusText} - ${school_name}`,
    html: htmlContent,
  });

  try {
    await sendMail(mailOptions);
    console.log(`✅ Email sent to student: ${email}`);

    if (parent_email && parent_email !== email) {
      const parentMailOptions = {
        ...mailOptions,
        to: parent_email,
        subject: `Student Application ${statusText} - ${first_name} ${last_name} - ${school_name}`,
      };
      await sendMail(parentMailOptions);
      console.log(`✅ Email sent to parent: ${parent_email}`);
    }
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
  }
};

const sendNewApplicationNotification = async (leaderEmail, studentName, schoolName) => {
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
        .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Application Received</h1>
        </div>
        <div class="content">
          <h2>Dear School Leader,</h2>
          <p>A new student application has been submitted to <strong>${schoolName}</strong>.</p>
          <p><strong>Student:</strong> ${studentName}</p>
          <p>Please log in to your dashboard to review the application and supporting documents.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/leader" class="button">Review Application</a>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = buildMailOptions({
    to: leaderEmail,
    subject: `New Application - ${studentName}`,
    html: htmlContent,
  });

  try {
    await sendMail(mailOptions);
    console.log(`✅ New application notification sent to leader: ${leaderEmail}`);
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
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
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
          
          <div class="code-box">
            <div class="code">${code}</div>
          </div>
          
          <p><strong>This code will expire in 10 minutes.</strong></p>
          <p>If you didn't request this code, please ignore this email or contact support if you have concerns.</p>
        </div>
        <div class="footer">
          <p>This is an automated message from Rwanda School Bridge System</p>
          <p>Please do not reply to this email</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = buildMailOptions({
    to: email,
    subject: 'Your RSBS Login Verification Code',
    html: htmlContent,
    text: `Your Rwanda School Bridge System login code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, ignore this email.`,
  });

  try {
    await sendMail(mailOptions);
    console.log(`✅ Verification code email sent to: ${email} via ${emailServiceType || 'dev'} from ${getFromAddress()}`);
  } catch (error) {
    console.error('❌ Error sending verification code email:', error.message);
    throw error;
  }
};

const sendNotificationEmail = async (userEmail, userName, title, message, link = null) => {
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
        .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 Notification</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName},</h2>
          <h3>${title}</h3>
          <p>${message}</p>
          ${link ? `<a href="${link}" class="button">View Details</a>` : ''}
        </div>
        <div class="footer">
          <p>This is an automated message from Rwanda School Bridge System</p>
          <p>Please do not reply to this email</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = buildMailOptions({
    to: userEmail,
    subject: title,
    html: htmlContent,
  });

  try {
    await sendMail(mailOptions);
    console.log(`✅ Notification email sent to: ${userEmail}`);
  } catch (error) {
    console.error('❌ Error sending notification email:', error.message);
  }
};

module.exports = {
  sendApplicationStatusEmail,
  sendNotificationEmail,
  sendNewApplicationNotification,
  sendVerificationCode,
};
