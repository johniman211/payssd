# PaySSD Deployment Guide

## Pre-Deployment Security Checklist

### 1. Environment Configuration
- [ ] Copy `.env.production` to `.env` and update all placeholder values
- [ ] Generate strong JWT secret (64+ characters)
- [ ] Set strong admin password
- [ ] Configure production MongoDB URI
- [ ] Set up production email service
- [ ] Configure MTN and Digicash production APIs
- [ ] Update CLIENT_URL to production domain

### 2. Security Hardening
- [ ] Ensure NODE_ENV=production
- [ ] Review and update rate limiting settings
- [ ] Verify CORS configuration
- [ ] Check file upload restrictions
- [ ] Validate input sanitization
- [ ] Review authentication middleware

### 3. Database Security
- [ ] Use MongoDB Atlas or secured MongoDB instance
- [ ] Enable authentication
- [ ] Use SSL/TLS connections
- [ ] Set up database backups
- [ ] Configure proper user permissions

### 4. File System Security
- [ ] Secure uploads directory
- [ ] Set proper file permissions
- [ ] Implement file type validation
- [ ] Set file size limits

## Deployment Steps

### Backend Deployment

1. **Prepare the server:**
   ```bash
   # Install Node.js 18+ and npm
   # Install PM2 for process management
   npm install -g pm2
   ```

2. **Deploy the application:**
   ```bash
   # Clone or upload your code
   cd /path/to/payssd
   
   # Install dependencies
   npm install --production
   
   # Set up environment
   cp .env.production .env
   # Edit .env with production values
   
   # Create uploads directory
   mkdir -p uploads/kyc
   chmod 755 uploads
   
   # Start with PM2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

### Frontend Deployment

1. **Build the React app:**
   ```bash
   cd client
   cp .env.production .env.local
   # Edit .env.local with production API URL
   npm run build
   ```

2. **Deploy to web server:**
   - Copy `client/build` folder to your web server
   - Configure nginx/Apache to serve static files
   - Set up SSL certificate
   - Configure reverse proxy for API

### Nginx Configuration Example

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Frontend
    location / {
        root /path/to/client/build;
        try_files $uri $uri/ /index.html;
    }
    
    # API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Post-Deployment

### 1. Health Checks
- [ ] Test API health endpoint: `GET /api/health`
- [ ] Verify database connectivity
- [ ] Test authentication flow
- [ ] Validate payment processing
- [ ] Check email notifications

### 2. Monitoring Setup
- [ ] Set up application monitoring
- [ ] Configure error logging
- [ ] Set up uptime monitoring
- [ ] Monitor database performance
- [ ] Set up alerts for critical issues

### 3. Backup Strategy
- [ ] Database backups
- [ ] Application code backups
- [ ] Uploaded files backups
- [ ] Environment configuration backups

## Security Maintenance

### Regular Tasks
- [ ] Update dependencies monthly
- [ ] Review security logs weekly
- [ ] Rotate JWT secrets quarterly
- [ ] Update SSL certificates before expiry
- [ ] Review user access permissions

### Incident Response
- [ ] Have rollback plan ready
- [ ] Document incident response procedures
- [ ] Set up emergency contacts
- [ ] Prepare security breach response

## Performance Optimization

- [ ] Enable gzip compression
- [ ] Set up CDN for static assets
- [ ] Implement caching strategies
- [ ] Optimize database queries
- [ ] Monitor and optimize API response times

## Compliance

- [ ] Ensure PCI DSS compliance for payment processing
- [ ] Implement data protection measures
- [ ] Set up audit logging
- [ ] Document security procedures
- [ ] Regular security assessments