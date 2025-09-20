/**
 * Splitwise Backend API
 * Provides secure endpoints for Firebase UID resolution
 * 
 * @author Yash Bakadiya
 * @version 1.0.0
 */

const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, query, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for API
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:4200',
      'http://localhost:3000',
      'http://127.0.0.1:4200',
      'http://127.0.0.1:3000'
    ];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Firebase Admin SDK
// You need to download your service account key from Firebase Console
// Go to Project Settings > Service Accounts > Generate New Private Key
let serviceAccount;
try {
  // Try to load from environment variable first (for production)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  } else {
    // For development, load from file
    serviceAccount = require('./service-account-key.json');
  }
} catch (error) {
  console.error('❌ Error loading Firebase service account key:');
  console.error('Please download your service account key from Firebase Console');
  console.error('and save it as "service-account-key.json" in the backend folder');
  console.error('Or set FIREBASE_SERVICE_ACCOUNT_KEY environment variable');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

console.log('✅ Firebase Admin SDK initialized successfully');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Splitwise Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// API endpoint to get UID by email
app.get('/api/users/uid-by-email', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ 
        error: 'Email parameter is required',
        example: '/api/users/uid-by-email?email=user@example.com'
      });
    }

    console.log(`🔍 Looking up UID for email: ${email}`);

    // Get user by email using Firebase Admin SDK
    const userRecord = await admin.auth().getUserByEmail(email);
    
    console.log(`✅ Found user: ${userRecord.email} (UID: ${userRecord.uid})`);
    
    res.json({
      success: true,
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      emailVerified: userRecord.emailVerified,
      createdAt: userRecord.metadata.creationTime
    });
    
  } catch (error) {
    console.error(`❌ Error getting user by email ${req.query.email}:`, error.message);
    
    if (error.code === 'auth/user-not-found') {
      res.status(404).json({ 
        success: false,
        error: 'User not found',
        message: `No user found with email: ${req.query.email}`
      });
    } else if (error.code === 'auth/invalid-email') {
      res.status(400).json({ 
        success: false,
        error: 'Invalid email',
        message: 'The provided email address is invalid'
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: 'Internal server error',
        message: 'An error occurred while looking up the user'
      });
    }
  }
});

// API endpoint to get multiple UIDs by emails
app.post('/api/users/uid-by-emails', async (req, res) => {
  try {
    const { emails } = req.body;
    
    if (!emails || !Array.isArray(emails)) {
      return res.status(400).json({ 
        success: false,
        error: 'Emails array is required',
        example: { emails: ['user1@example.com', 'user2@example.com'] }
      });
    }

    console.log(`🔍 Looking up UIDs for ${emails.length} emails`);

    const results = [];
    
    for (const email of emails) {
      try {
        const userRecord = await admin.auth().getUserByEmail(email);
        results.push({
          email,
          success: true,
          uid: userRecord.uid,
          displayName: userRecord.displayName,
          emailVerified: userRecord.emailVerified
        });
        console.log(`✅ Found: ${email} (${userRecord.uid})`);
      } catch (error) {
        results.push({
          email,
          success: false,
          error: error.code === 'auth/user-not-found' ? 'User not found' : 'Error fetching user'
        });
        console.log(`❌ Not found: ${email}`);
      }
    }
    
    res.json({ 
      success: true,
      results,
      summary: {
        total: emails.length,
        found: results.filter(r => r.success).length,
        notFound: results.filter(r => !r.success).length
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting users by emails:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while looking up users'
    });
  }
});

// API endpoint to get all users (for debugging - use with caution)
app.get('/api/users/all', async (req, res) => {
  try {
    const { maxResults = 1000, pageToken } = req.query;
    
    const listUsersResult = await admin.auth().listUsers(parseInt(maxResults), pageToken);
    
    const users = listUsersResult.users.map(user => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
      createdAt: user.metadata.creationTime
    }));
    
    res.json({
      success: true,
      users,
      totalCount: users.length,
      nextPageToken: listUsersResult.pageToken
    });
    
  } catch (error) {
    console.error('❌ Error listing users:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while listing users'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({ 
    success: false,
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Splitwise Backend API running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔍 UID lookup: http://localhost:${PORT}/api/users/uid-by-email?email=user@example.com`);
  console.log(`📋 All users: http://localhost:${PORT}/api/users/all`);
});
