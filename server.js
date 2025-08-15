const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const PaymentLink = require('./models/PaymentLink');
const realtimeService = require('./services/realtimeService');

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

// Custom domain redirect middleware (for production)
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    const host = req.get('host');
    const protocol = req.get('x-forwarded-proto') || req.protocol;
    
    // Redirect from Render domain to custom domain
    if (host && host.includes('onrender.com')) {
      const customDomain = process.env.APP_URL || 'https://payssd.com';
      const redirectUrl = `${customDomain}${req.originalUrl}`;
      return res.redirect(301, redirectUrl);
    }
    
    // Force HTTPS in production
    if (protocol !== 'https') {
      const httpsUrl = `https://${host}${req.originalUrl}`;
      return res.redirect(301, httpsUrl);
    }
    
    next();
  });
}

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
app.use('/api/announcements', require('./routes/announcements'));

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



// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const User = require('./models/User');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Invalid authentication token'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected via Socket.IO`);
  
  // Add client to realtime service
  realtimeService.addClient(socket.userId, socket);
  
  // Handle user status requests
  socket.on('requestUserUpdate', async () => {
    await realtimeService.sendUserData(socket.userId, socket);
  });
  
  // Handle ping for connection health
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: new Date().toISOString() });
  });
  
  socket.on('disconnect', (reason) => {
    console.log(`User ${socket.userId} disconnected: ${reason}`);
    realtimeService.removeClient(socket.userId, socket);
  });
});

// Make io available globally for other modules
app.set('io', io);
global.io = io;

server.listen(PORT, () => {
  console.log(`PaySSD Server running on port ${PORT}`);
  console.log(`Socket.IO enabled for real-time updates`);
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