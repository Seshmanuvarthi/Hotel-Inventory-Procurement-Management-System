# TODO: Email Service Configuration

## Current Status
- Using Brevo SMTP for email delivery
- Added validation for email credentials
- Implemented 30-second timeout to prevent hanging
- Using plain text emails to avoid spam filters

## Brevo Setup
The application is configured to use Brevo (formerly Sendinblue) for email services:

### Step 1: Create Brevo Account
1. Go to https://www.brevo.com and sign up for a free account
2. Verify your email address

### Step 2: Get SMTP Credentials
1. In Brevo dashboard, go to **SMTP & API**
2. Generate SMTP credentials
3. Copy the SMTP settings:
   - **SMTP Host**: smtp-relay.brevo.com (already configured in code)
   - **SMTP Port**: 587 (already configured in code)
   - **SMTP Username**: (copy this)
   - **SMTP Password**: (copy this)

### Step 3: Set Environment Variables in Render.com
1. Go to your Render.com dashboard → Service → Environment
2. Add these variables:
   - `EMAIL_USER` = your Brevo SMTP username
   - `EMAIL_PASS` = your Brevo SMTP password
   - `EMAIL_SENDER` = your verified sender email

### Step 4: Deploy and Test
1. Deploy your updated code to Render.com
2. Test the forgot password functionality
3. Check Render.com logs for success messages

## Benefits of Brevo
- 300 free emails per day
- Good deliverability for transactional emails
- Easy SMTP setup
- Professional email infrastructure

## Troubleshooting
- If emails don't send, check Render.com logs for error messages
- Make sure the SMTP credentials are copied exactly
- Verify your Brevo account is verified and has credits
