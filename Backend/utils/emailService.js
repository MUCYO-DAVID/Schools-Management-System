// utils/emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config();

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  // Check if email configuration is set up
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    throw new Error('Email configuration missing. Please set SMTP_USER and SMTP_PASSWORD in your .env file.');
  }

  // If using Gmail, you'll need an App Password
  // For other services, adjust the configuration accordingly
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER, // Your email
      pass: process.env.SMTP_PASSWORD, // Your email password or app password
    },
  });
};

// Send verification code email
const sendVerificationCode = async (email, code) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"RSB" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your Verification Code - RSB',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verification Code</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 20px 0; text-align: center; background-color: #007A3D;">
                <h1 style="color:rgb(49, 97, 168); margin: 0;">RSB Schools Management System</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 20px; background-color:rgb(193, 193, 24);">
                <div style="max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #333333; margin-top: 0;">Verification Code</h2>
                  <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                    Hello,
                  </p>
                  <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                    RSB has sent you a verification code to complete your login process.
                  </p>
                  <div style="background-color: #f8f9fa; border: 2px dashed #ffffff er-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                    <p style="margin: 0; font-size: 14px; color: #666666; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                    <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; color: #007A3D; letter-spacing: 5px;">${code}</p>
                  </div>
                  <p style="color: #666666; font-size: 7x; line-height: 0.7
                    This code will expire in <strong>10 minutes</strong>. Please enter this code to verify your account.
                  </p>
                  <p style="color: #999999; font-size: 7x; line-height: 0.7argin-top: 20; border-top: 1px solid #eeeeee; padding-top: 20px;">
                    If you didn't request this code, please ignore this email or contact support if you have concerns.
                  </p>
                  <p style="color: #999999; font-size: 7x; margin-top: 10px;">
                    © ${new Date().getFullYear()} RSB Schools Management System. All rights reserved.
                  </p>
                </div>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
        RSB 
        
        Hello,
        
        RSB has sent you a verification code to complete your login process.
        
        Your Verification Code: ${code}
        
        This code will expire in 10 minutes. Please enter this code to verify your account.
        
        If you didn't request this code, please ignore this email or contact support if you have concerns.
        
        © ${new Date().getFullYear()} RSB Schools Management System. All rights reserved.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(' Verification email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(' Error sending verification email:', error.message);

    // Provide helpful error messages for common issues
    if (error.code === 'EAUTH' || error.responseCode === 535) {
      const isGmail = (process.env.SMTP_HOST || 'smtp.gmail.com').includes('gmail');
      if (isGmail) {
        throw new Error(
          'Gmail authentication failed. Please check:\n' +
          '1. You must use an App Password, NOT your regular Gmail password\n' +
          '2. Enable 2-Step Verification on your Google account\n' +
          '3. Generate an App Password at: https://myaccount.google.com/apppasswords\n' +
          '4. Use the 16-character App Password (no spaces) as SMTP_PASSWORD\n' +
          'See EMAIL_SETUP_INSTRUCTIONS.txt for detailed steps.'
        );
      } else {
        throw new Error(
          'Email authentication failed. Please verify:\n' +
          '1. SMTP_USER is correct\n' +
          '2. SMTP_PASSWORD is correct\n' +
          '3. Your email provider allows SMTP access'
        );
      }
    }

    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = {
  sendVerificationCode,
};
