# Email Configuration Guide

This guide will help you set up email sending for verification codes in the RSB Schools Management System.

## Required Environment Variables

Add the following variables to your `.env` file in the `Backend` directory:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## Gmail Setup (Recommended)

If you're using Gmail, you'll need to:

1. **Enable 2-Step Verification** on your Google account
2. **Generate an App Password**:
   - Go to your Google Account settings
   - Navigate to Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this 16-character password as your `SMTP_PASSWORD`

## Other Email Providers

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
```

### Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASSWORD=your-app-password
```

### Custom SMTP Server
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-password
```

## Testing

After configuring your email settings, restart your backend server and try logging in. The verification code will be sent to the user's email address with RSB branding.

## Troubleshooting

- **"Email configuration missing"**: Make sure `SMTP_USER` and `SMTP_PASSWORD` are set in your `.env` file
- **"Authentication failed"**: Check that your email and password are correct. For Gmail, use an App Password, not your regular password
- **"Connection timeout"**: Verify your SMTP host and port are correct for your email provider
