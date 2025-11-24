# Email OTP Production Issues - Troubleshooting Guide

## Common Issues & Solutions

### ✅ What I Fixed in the Code:

1. **Added Email Validation** - Validates email format before attempting to send
2. **Environment Variable Check** - Verifies EMAIL_USER and EMAIL_PASS are configured
3. **SMTP Connection Verification** - Tests connection before sending email
4. **Enhanced Error Logging** - Detailed error messages with error codes
5. **Debug Mode Enabled** - Adds detailed SMTP logs for troubleshooting
6. **Professional HTML Email** - Better formatted email template

---

## 🔍 Production Checklist

### 1. **Gmail App Password Issues** ⚠️ MOST COMMON
Your current password in .env: `dbgm itdz veda ngbi`

**Problem:** This is a Gmail App Password, which requires:
- ✅ 2-Factor Authentication enabled on Gmail account
- ✅ "Less secure app access" turned OFF (use App Password instead)
- ✅ App Password must be 16 characters (no spaces)

**Fix:**
1. Go to: https://myaccount.google.com/apppasswords
2. Sign in to `hohoanglong2508@gmail.com`
3. Generate new App Password for "Mail"
4. Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)
5. Update `.env` with NO SPACES: `EMAIL_PASS=xxxxxxxxxxxxxxxx`

---

### 2. **Environment Variables Not Loaded**
**Problem:** Production server might not load .env file

**Fix for Production:**
```bash
# Check if variables are set
echo $EMAIL_USER
echo $EMAIL_PASS

# If empty, set them explicitly:
export EMAIL_USER=hohoanglong2508@gmail.com
export EMAIL_PASS=your_app_password_here
```

Or in your hosting platform (Vercel/Render/Railway):
- Add environment variables in dashboard
- Don't rely on .env file

---

### 3. **Gmail Blocks Production IPs**
**Problem:** Gmail might block emails from unknown IPs

**Symptoms:**
- Error code: `EAUTH` or `535`
- Error: "Username and Password not accepted"

**Fix:**
1. Login to Gmail from production server IP once
2. OR use a different email service:
   - **SendGrid** (free tier: 100 emails/day)
   - **Mailgun** (free tier: 5000 emails/month)
   - **Amazon SES** (very cheap)

---

### 4. **Redis Connection Issues**
**Problem:** OTP stored in Redis but Redis is unreachable

**Fix:**
```bash
# Test Redis connection
curl https://liberal-hippo-36446.upstash.io:6379

# Check logs for Redis errors
```

Update `redisClient.ts` to handle connection failures better.

---

### 5. **Firewall Blocks Port 587**
**Problem:** Production server firewall blocks SMTP port

**Symptoms:**
- Error: `ETIMEDOUT` or `ECONNREFUSED`
- Connection hangs

**Fix:**
- Try port 465 (SSL) instead of 587 (TLS)
- Update `mail.service.ts`:
```typescript
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use SSL
    auth: {
        user: ENV.EMAIL_USER,
        pass: ENV.EMAIL_PASS
    }
});
```

---

## 🧪 Testing in Production

### Check Email Service:
```bash
# SSH into production server
# Run test:
curl -X POST https://your-api.com/api/mail/send-otp \\
  -H "Content-Type: application/json" \\
  -d '{"email":"test@example.com"}'
```

### Check Logs:
```bash
# Look for these messages:
# ✅ "SMTP connection verified" - Good!
# ❌ "SMTP verification failed" - Check credentials
# ❌ "Error code: EAUTH" - Wrong password
# ❌ "Error code: ETIMEDOUT" - Port blocked
```

---

## 🔧 Quick Fix Recommendations

### Option 1: Use SendGrid (Recommended for Production)
```bash
npm install @sendgrid/mail
```

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendOtpEmail(to: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const msg = {
        to: to,
        from: 'noreply@basan.com', // Use your verified sender
        subject: 'Mã OTP xác thực - BáSàn',
        html: `<div>Mã OTP: <strong>${otp}</strong></div>`,
    };
    
    await sgMail.send(msg);
    await redisClient.set(`otp:${to}`, otp, { EX: 300 });
}
```

### Option 2: Alternative Gmail Configuration
```typescript
// Try OAuth2 instead of App Password
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: ENV.EMAIL_USER,
        clientId: ENV.GMAIL_CLIENT_ID,
        clientSecret: ENV.GMAIL_CLIENT_SECRET,
        refreshToken: ENV.GMAIL_REFRESH_TOKEN
    }
});
```

---

## 📊 Check Your Current Status

Run this test script on production:
```javascript
// test-email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify()
    .then(() => console.log('✅ Email service ready'))
    .catch(err => console.error('❌ Email service failed:', err));
```

---

## 🆘 Still Not Working?

1. **Check server logs** for detailed error messages (now included)
2. **Verify App Password** is exactly 16 characters with no spaces
3. **Try from local machine** - if it works locally but not in production, it's likely a firewall/IP block
4. **Consider using SendGrid** for production reliability

**Need help?** Check the error logs with the new detailed error reporting I added.
