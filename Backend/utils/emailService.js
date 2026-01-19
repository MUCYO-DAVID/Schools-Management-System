const nodemailer = require('nodemailer');

// Create transporter - configure with your email service
const createTransporter = () => {
  // For development, use ethereal email (fake SMTP service)
  // For production, use your actual email service (Gmail, SendGrid, etc.)

  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  if (process.env.EMAIL_SERVICE === 'smtp') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }

  // Default: use console logging for development
  return {
    sendMail: async (mailOptions) => {
      console.log('\n📧 Email would be sent:');
      console.log('To:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      console.log('Body:', mailOptions.html || mailOptions.text);
      console.log('-------------------\n');
      return { messageId: 'dev-mode-' + Date.now() };
    }
  };
};

const transporter = createTransporter();

// Send application status email to student
const sendApplicationStatusEmail = async (application, status, rejectionReason = null) => {
  const { email, first_name, last_name, parent_email, school_name } = application;

  let statusText = '';
  let statusColor = '';
  let messageContent = '';

  if (status === 'approved') {
    statusText = 'Approved';
    statusColor = '#10b981'; // green
    messageContent = `
      <p>Congratulations! Your application to <strong>${school_name}</strong> has been approved.</p>
      <p>The school will contact you soon with the next steps for enrollment.</p>
    `;
  } else if (status === 'rejected') {
    statusText = 'Not Approved';
    statusColor = '#ef4444'; // red
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
          <p>This is an automated message from Rwanda School Browsing System</p>
          <p>Please do not reply to this email</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'Rwanda School System <noreply@rsbs.rw>',
    to: email,
    subject: `Application ${statusText} - ${school_name}`,
    html: htmlContent
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to student: ${email}`);

    // Also send to parent if parent email exists
    if (parent_email && parent_email !== email) {
      const parentMailOptions = {
        ...mailOptions,
        to: parent_email,
        subject: `Student Application ${statusText} - ${first_name} ${last_name} - ${school_name}`
      };
      await transporter.sendMail(parentMailOptions);
      console.log(`✅ Email sent to parent: ${parent_email}`);
    }
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    // Don't throw error - we don't want email failures to break the application flow
  }
};

// Send new application notification to school leader
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

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'Rwanda School Bridge System <noreply@rsbs.rw>',
    to: leaderEmail,
    subject: `New Application - ${studentName}`,
    html: htmlContent
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ New application notification sent to leader: ${leaderEmail}`);
  } catch (error) {
    console.error('❌ Error sending notification email:', error.message);
  }
};

// Send verification code email for login
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
          <h1>Rwanda School Browsing System</h1>
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
          <p>This is an automated message from Rwanda School Browsing System</p>
          <p>Please do not reply to this email</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'Rwanda School System <noreply@rsbs.rw>',
    to: email,
    subject: 'Your Login Verification Code',
    html: htmlContent
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification code email sent to: ${email}`);
  } catch (error) {
    console.error('❌ Error sending verification code email:', error.message);
    throw error; // Re-throw so the caller knows it failed
  }
};

module.exports = {
  sendApplicationStatusEmail,
  sendNewApplicationNotification,
  sendVerificationCode
};
