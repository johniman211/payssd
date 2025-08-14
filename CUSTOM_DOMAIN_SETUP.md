# Custom Domain Setup for PaySSD

This guide explains how to configure PaySSD to use the custom domain `payssd.com` instead of the default Render domain `payssd.onrender.com`.

## Changes Made

The following files have been updated to support the custom domain:

### Environment Configuration
- `.env.production` - Updated CLIENT_URL and APP_URL to use `https://payssd.com`
- `client/.env.production` - Updated REACT_APP_API_URL to use `https://payssd.com`
- `render.yaml` - Updated all URL environment variables to use `https://payssd.com`

### Code Updates
- `server.js` - Added domain redirect middleware to redirect from Render domain to custom domain
- `client/src/pages/static/ApiDocumentationPage.js` - Updated API base URL examples
- `client/src/pages/static/IntegrationGuidePage.js` - Updated API URLs in code examples
- `client/src/pages/static/NotFoundPage.js` - Created custom 404 page
- `client/src/App.js` - Added 404 route to replace default Render error pages

## Render Custom Domain Setup

### Step 1: Add Custom Domain in Render Dashboard

1. Log in to your Render dashboard
2. Navigate to your PaySSD service
3. Go to the "Settings" tab
4. Scroll down to "Custom Domains"
5. Click "Add Custom Domain"
6. Enter `payssd.com`
7. Click "Save"

### Step 2: Configure DNS Records

Add the following DNS records to your domain registrar:

```
Type: CNAME
Name: www
Value: payssd.onrender.com

Type: A
Name: @
Value: 216.24.57.1
```

**Alternative (if CNAME for root domain is not supported):**
```
Type: ALIAS or ANAME
Name: @
Value: payssd.onrender.com

Type: CNAME
Name: www
Value: payssd.onrender.com
```

### Step 3: SSL Certificate

Render will automatically provision an SSL certificate for your custom domain. This process may take a few minutes to complete.

### Step 4: Update Environment Variables

In your Render service settings, update the following environment variables:

```
CLIENT_URL=https://payssd.com
REACT_APP_API_URL=https://payssd.com
APP_URL=https://payssd.com
```

### Step 5: Deploy Changes

1. Commit and push all code changes to your repository
2. Render will automatically deploy the updated code
3. Wait for the deployment to complete

## Features Implemented

### 1. Automatic Domain Redirects
- All requests to `*.onrender.com` are automatically redirected to `payssd.com`
- HTTP requests are automatically redirected to HTTPS
- 301 redirects preserve SEO value

### 2. Custom 404 Page
- Replaced default Render "Page Not Found" with branded 404 page
- Includes navigation options and support contact information
- Maintains consistent branding with the rest of the application

### 3. Updated API Documentation
- All code examples now use `https://payssd.com` as the base URL
- Integration guides updated with correct endpoints
- Consistent domain usage across all documentation

### 4. CORS and Security
- CORS configured to allow requests from the custom domain
- Security headers properly configured for the new domain
- Rate limiting works correctly with the custom domain

## Testing

After deployment, test the following:

1. **Domain Access**: Visit `https://payssd.com` - should load the homepage
2. **Redirects**: Visit `https://payssd.onrender.com` - should redirect to `https://payssd.com`
3. **HTTPS**: Visit `http://payssd.com` - should redirect to `https://payssd.com`
4. **404 Page**: Visit `https://payssd.com/nonexistent-page` - should show custom 404 page
5. **API Endpoints**: Test API calls to ensure they work with the new domain
6. **Payment Links**: Test payment processing to ensure all redirects work correctly

## Troubleshooting

### DNS Propagation
- DNS changes can take up to 48 hours to propagate globally
- Use tools like `dig` or online DNS checkers to verify propagation

### SSL Certificate Issues
- If SSL certificate provisioning fails, check DNS configuration
- Ensure CNAME records point to the correct Render domain

### Redirect Loops
- If experiencing redirect loops, check environment variables
- Ensure `APP_URL` is set to `https://payssd.com` (not the Render domain)

### API Issues
- Verify `REACT_APP_API_URL` is set correctly in production
- Check browser network tab for any requests still going to old domain

## Monitoring

After deployment, monitor:
- Server logs for any redirect issues
- Analytics for traffic patterns
- Error rates and performance metrics
- SSL certificate expiration dates

## Support

For issues with this setup, contact:
- Technical Support: support@payssd.com
- Development Team: dev@payssd.com

---

**Note**: This setup ensures that `https://payssd.com` becomes the primary domain for the PaySSD application, with all traffic properly redirected and SSL certificates configured for secure access.