const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const PaymentLink = require('./models/PaymentLink');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy setting for rate limiting
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100, // limit each IP to requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Serve React app static files
app.use(express.static('client/build'));
// Serve static assets with correct paths
app.use('/static', express.static('client/build/static'));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/payssd', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/kyc', require('./routes/kyc'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/payouts', require('./routes/payouts'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/jobs', require('./routes/jobs'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'PaySSD API is running' });
});

// Readiness probe: verifies DB connectivity and client build presence
app.get('/api/ready', async (req, res) => {
  try {
    // DB connectivity: use mongoose connection state
    // 1 = connected, 2 = connecting. We accept connected; reject others
    const connState = mongoose.connection.readyState;
    const dbReady = connState === 1;

    // Client build presence
    const indexPath = path.join(__dirname, 'client', 'build', 'index.html');
    const hasClientBuild = fs.existsSync(indexPath);

    const ready = dbReady && hasClientBuild;

    if (!ready) {
      return res.status(503).json({
        success: false,
        ready,
        dbReady,
        hasClientBuild,
        message: 'Service not ready',
      });
    }

    return res.json({
      success: true,
      ready: true,
      dbReady,
      hasClientBuild,
      message: 'Service is ready',
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Readiness check failed', details: err.message });
  }
});

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  // Only serve React app for non-API routes
  if (!req.path.startsWith('/api/')) {
    const indexPath = path.join(__dirname, 'client/build', 'index.html');
    
    // Check if build file exists
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      // Fallback response if build files don't exist
      res.status(503).json({ 
        success: false,
        message: 'Application is being deployed. Please try again in a few minutes.',
        error: 'Build files not found'
      });
    }
  } else {
    res.status(404).json({ message: 'API route not found' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  // Log error details in development, minimal in production
  if (process.env.NODE_ENV === 'development') {
    console.error('Error details:', err.stack);
  } else {
    console.error('Error occurred:', err.message);
  }
  
  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message || 'Something went wrong!';
    
  res.status(err.status || 500).json({ 
    success: false,
    message 
  });
});



app.listen(PORT, () => {
  console.log(`PaySSD Server running on port ${PORT}`);
});

// Schedule cleanup of expired payment links every hour (except test env)
if (process.env.NODE_ENV !== 'test') {
  setInterval(async () => {
    try {
      const result = await PaymentLink.cleanupExpiredLinks();
      if (result?.modifiedCount) {
        console.log(`PaymentLink cleanup: expired ${result.modifiedCount} links.`);
      }
    } catch (e) {
      console.error('PaymentLink cleanup error:', e.message);
    }
  }, 60 * 60 * 1000);
}

module.exports = app;