# Render Environment Variables Configuration

## Required Environment Variables (Must be set for production)

### Database
- `MONGODB_URI` - MongoDB connection string with credentials
- `JWT_SECRET` - JSON Web Token secret (min 32 characters)

### Server & Client
- `PORT` - Server port (must be set to `10000` for Render)
- `CLIENT_URL` - Frontend URL (`https://payssd.onrender.com`)
- `REACT_APP_API_URL` - API base URL for the React app at build time (`https://payssd.onrender.com`)
- `NODE_ENV` - Environment (`production`)

### Email Configuration
- `EMAIL_HOST` - SMTP server host
- `EMAIL_PORT` - SMTP port (587 or 465)
- `EMAIL_USER` - SMTP username
- `EMAIL_PASS` - SMTP password
- `EMAIL_FROM` - From email address

### Security
- `SESSION_SECRET` - Session encryption secret (32+ characters)
- `ENCRYPTION_KEY` - Data encryption key (32+ characters)

### Admin Account
- `ADMIN_EMAIL` - Administrator email
- `ADMIN_PASSWORD` - Administrator password

## Optional Environment Variables (Have defaults)

### Rate Limiting
- `RATE_LIMIT_WINDOW_MS` - Rate limit window (default: 15 minutes)
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window (default: 100)

### File Upload
- `MAX_FILE_SIZE` - Max upload size in bytes (default: 5MB)
- `UPLOAD_PATH` - Upload directory (default: 'uploads')

### Support
- `SUPPORT_EMAIL` - Support contact email (default: 'support@payssd.com')

### Payment Providers (Optional - for payment features)
#### MTN Mobile Money
- `MTN_API_BASE_URL` - MTN API endpoint
- `MTN_API_KEY` - MTN API key
- `MTN_API_SECRET` - MTN API secret
- `MTN_SUBSCRIPTION_KEY` - MTN subscription key
- `MTN_TARGET_ENVIRONMENT` - MTN environment (default: 'sandbox')

#### DigiCash
- `DIGICASH_API_BASE_URL` - DigiCash API endpoint
- `DIGICASH_API_KEY` - DigiCash API key
- `DIGICASH_API_SECRET` - DigiCash API secret
- `DIGICASH_MERCHANT_ID` - DigiCash merchant ID

#### SMS (Optional)
- `SMS_API_KEY` - SMS service API key
- `SMS_API_URL` - SMS service endpoint

### Application URLs
- `APP_URL` - Backend URL for webhooks (`https://payssd.onrender.com`)

## Quick Setup for Render

### Step 1: Minimal Required Setup
Set these in Render dashboard > Environment:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/payssd
JWT_SECRET=your-32-character-secret-here
PORT=10000
CLIENT_URL=https://payssd.onrender.com
REACT_APP_API_URL=https://payssd.onrender.com
NODE_ENV=production
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
SESSION_SECRET=your-32-character-session-secret
ENCRYPTION_KEY=your-32-character-encryption-key
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure-admin-password
APP_URL=https://payssd.onrender.com
```

Notes:
- REACT_APP_API_URL must be present at build time for the React client (Create React App) to bake the correct API URL into the bundle.

### Step 2: Build & Start Commands
- Build Command: `npm install && cd client && npm install && npm run build`
- Start Command: `npm start`

### Step 3: Deploy
- Save environment variables
- Trigger manual redeploy
- Monitor build logs for React build completion

## Security Notes
- Rotate all credentials that were exposed in the repository
- Use strong, unique passwords and secrets
- Enable 2FA on your MongoDB Atlas account
- Use app passwords for Gmail SMTP