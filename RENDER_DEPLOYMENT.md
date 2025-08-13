# Render Deployment Guide for PaySSD

## Issues Fixed

### 1. Build Process
- **Problem**: Client build files were not being generated during deployment
- **Solution**: Updated `package.json` build script to install client dependencies and build the React app
- **Change**: `"build": "npm run install-client && cd client && npm run build"`

### 2. Static File Serving
- **Problem**: Server was looking for build files that didn't exist
- **Solution**: Added file existence check with graceful fallback
- **Change**: Updated `server.js` to check if `client/build/index.html` exists before serving

### 3. Environment Configuration
- **Problem**: Production environment variables were not properly configured
- **Solution**: Updated `.env.production` with correct values for Render deployment
- **Changes**:
  - `CLIENT_URL=https://payssd.onrender.com`
  - Proper MongoDB URI
  - Production email configuration

### 4. Database Connection
- **Problem**: Server was trying to connect to localhost MongoDB
- **Solution**: Ensured MongoDB Atlas URI is used in production
- **Note**: The MongoDB URI in the logs shows it's correctly configured

## Deployment Steps

### Option 1: Using Render Dashboard
1. Connect your GitHub repository to Render
2. Set the following in Render Dashboard:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node.js
   - **Node Version**: 22.16.0

### Option 2: Using render.yaml (Recommended)
1. The `render.yaml` file is already configured
2. Push your code to GitHub
3. Render will automatically deploy using the configuration

## Environment Variables

Ensure these are set in Render Dashboard or use the provided `render.yaml`:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://payssd:%2B211JOHNNINNI.com%2Fshameless@payssd.qrniazf.mongodb.net/payssd?retryWrites=true&w=majority&appName=PaySSD
JWT_SECRET=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678
CLIENT_URL=https://payssd.onrender.com
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_USER=9151d2001@smtp-brevo.com
EMAIL_PASS=a873ALqD2OjwdyT5
EMAIL_FROM=PaySSD <support@payssd.com>
ADMIN_EMAIL=admin@payssd.com
ADMIN_PASSWORD=SuperSecureAdmin2024!@
```

## Troubleshooting

### Build Failures
- Ensure all dependencies are listed in `package.json`
- Check that the build command completes successfully
- Verify Node.js version compatibility

### Database Connection Issues
- Verify MongoDB Atlas connection string
- Check IP whitelist in MongoDB Atlas (allow all IPs: 0.0.0.0/0)
- Ensure database user has proper permissions

### Static File Issues
- Verify the build process creates `client/build/` directory
- Check that `index.html` exists in the build directory
- Ensure proper file permissions

## Health Check

The application includes a health check endpoint at `/api/health` that Render can use to verify the service is running.

## Post-Deployment

1. Visit `https://payssd.onrender.com/api/health` to verify the API is running
2. Check the admin panel at `https://payssd.onrender.com/admin`
3. Test user registration and login functionality
4. Verify email notifications are working

## Security Notes

- All sensitive environment variables are properly configured
- CORS is set to allow requests from the production domain
- Rate limiting is enabled for production
- Helmet security middleware is active