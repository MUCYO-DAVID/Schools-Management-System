# Gmail App Password Setup Guide

## ⚠️ IMPORTANT: You MUST use an App Password, NOT your regular Gmail password!

If you're getting the error: **"Username and Password not accepted"**, follow these steps:

## Step-by-Step Instructions:

### Step 1: Enable 2-Step Verification
1. Go to: https://myaccount.google.com/security
2. Under "Signing in to Google", click **"2-Step Verification"**
3. If not enabled, click **"Get Started"** and follow the prompts
4. You'll need to verify your phone number

### Step 2: Generate an App Password
1. After enabling 2-Step Verification, go back to: https://myaccount.google.com/security
2. Scroll down to **"2-Step Verification"** section
3. Click on **"App passwords"** (you may need to sign in again)
4. If you don't see "App passwords", make sure 2-Step Verification is fully enabled

### Step 3: Create the App Password
1. Select **"Mail"** as the app type
2. Select **"Other (Custom name)"** as the device
3. Type: **"RSB Schools System"** (or any name you prefer)
4. Click **"Generate"**
5. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)
   - Remove all spaces when using it in your .env file

### Step 4: Update Your .env File
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=abcdefghijklmnop
```
**Important:** 
- Use the 16-character App Password (no spaces)
- Do NOT use your regular Gmail password
- The App Password should be 16 characters with no spaces

### Step 5: Restart Your Server
After updating the .env file, restart your backend server.

## Troubleshooting

### "App passwords" option is missing
- Make sure 2-Step Verification is fully enabled and verified
- Wait a few minutes after enabling 2-Step Verification
- Try refreshing the page

### Still getting authentication errors
1. Double-check you're using the App Password (16 characters, no spaces)
2. Make sure there are no extra spaces in your .env file
3. Verify your email address in SMTP_USER is correct
4. Try generating a new App Password

### Alternative: Use a different email provider
If Gmail continues to cause issues, consider using:
- **Outlook/Hotmail**: Easier setup, uses regular password
- **SendGrid**: Professional email service (free tier available)
- **Mailgun**: Another professional option

## Quick Checklist
- [ ] 2-Step Verification is enabled
- [ ] App Password is generated (16 characters)
- [ ] .env file has SMTP_USER and SMTP_PASSWORD set
- [ ] App Password has no spaces in .env file
- [ ] Server has been restarted after .env changes
