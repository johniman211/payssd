const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, merchantAuth, adminAuth } = require('../middleware/auth');
const { requireEmailVerification } = require('../middleware/emailVerification');

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/kyc');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `${req.user.id}-${file.fieldname}-${uniqueSuffix}${extension}`);
  }
});

// File filter for allowed file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    'image/jpeg': true,
    'image/jpg': true,
    'image/png': true,
    'application/pdf': true
  };
  
  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  }
});

// @route   POST /api/kyc/submit
// @desc    Submit KYC documents
// @access  Private (Merchant)
router.post('/submit', auth, requireEmailVerification, merchantAuth, upload.fields([
  { name: 'idDocument', maxCount: 1 },
  { name: 'businessLicense', maxCount: 1 },
  { name: 'proofOfAddress', maxCount: 1 }
]), [
  body('idType')
    .isIn(['national_id', 'passport', 'driving_license'])
    .withMessage('Please select a valid ID type'),
  body('idNumber')
    .trim()
    .isLength({ min: 5 })
    .withMessage('ID number must be at least 5 characters long'),
  body('businessName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Business name must be at least 2 characters long')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Clean up uploaded files if validation fails
      if (req.files) {
        Object.values(req.files).flat().forEach(file => {
          fs.unlink(file.path, () => {});
        });
      }
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { idType, idNumber, businessName } = req.body;
    const files = req.files;

    // Debug logging
    console.log('KYC submission - req.body:', req.body);
    console.log('KYC submission - req.files:', files);
    console.log('KYC submission - files keys:', files ? Object.keys(files) : 'no files');
    if (files && files.idDocument) {
      console.log('KYC submission - idDocument:', files.idDocument);
    }

    // Get current user first to check existing KYC data
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if ID document is required (only if user doesn't have existing ID document)
    if (!files || !files.idDocument) {
      if (!user.kyc.documents.idDocument) {
        console.log('KYC submission failed - ID document missing for new submission');
        return res.status(400).json({
          success: false,
          message: 'ID document is required'
        });
      }
      console.log('KYC resubmission - using existing ID document');
    }

    // Check if KYC is already approved
    if (user.kyc.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'KYC is already approved'
      });
    }

    // Update KYC information
    user.kyc.documents.idType = idType;
    user.kyc.documents.idNumber = idNumber;
    
    // Only update ID document if a new one is provided
    if (files && files.idDocument) {
      // Clean up old ID document if it exists
      if (user.kyc.documents.idDocument) {
        const oldPath = path.join(__dirname, '../uploads/kyc', path.basename(user.kyc.documents.idDocument));
        fs.unlink(oldPath, () => {});
      }
      user.kyc.documents.idDocument = files.idDocument[0].filename;
    }
    
    // Only update business license if a new one is provided
    if (files && files.businessLicense) {
      // Clean up old business license if it exists
      if (user.kyc.documents.businessLicense) {
        const oldPath = path.join(__dirname, '../uploads/kyc', path.basename(user.kyc.documents.businessLicense));
        fs.unlink(oldPath, () => {});
      }
      user.kyc.documents.businessLicense = files.businessLicense[0].filename;
    }
    
    // Only update proof of address if a new one is provided
    if (files && files.proofOfAddress) {
      // Clean up old proof of address if it exists
      if (user.kyc.documents.proofOfAddress) {
        const oldPath = path.join(__dirname, '../uploads/kyc', path.basename(user.kyc.documents.proofOfAddress));
        fs.unlink(oldPath, () => {});
      }
      user.kyc.documents.proofOfAddress = files.proofOfAddress[0].filename;
    }

    // Update business name if provided
    if (businessName) {
      user.profile.businessName = businessName;
    }

    // Set KYC status to pending
    user.kyc.status = 'pending';
    user.kyc.submittedAt = new Date();
    user.kyc.reviewedAt = undefined;
    user.kyc.reviewedBy = undefined;
    user.kyc.rejectionReason = undefined;

    await user.save();

    res.json({
      success: true,
      message: 'KYC documents submitted successfully. Your application is under review.',
      kyc: {
        status: user.kyc.status,
        submittedAt: user.kyc.submittedAt,
        documents: {
          idType: user.kyc.documents.idType,
          hasIdDocument: !!user.kyc.documents.idDocument,
          hasBusinessLicense: !!user.kyc.documents.businessLicense,
          hasProofOfAddress: !!user.kyc.documents.proofOfAddress
        }
      }
    });

  } catch (error) {
    console.error('KYC submission error:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      Object.values(req.files).flat().forEach(file => {
        fs.unlink(file.path, () => {});
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during KYC submission'
    });
  }
});

// @route   GET /api/kyc/status
// @desc    Get KYC status
// @access  Private (Merchant)
router.get('/status', auth, requireEmailVerification, merchantAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('kyc profile.businessName');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      kyc: {
        status: user.kyc.status,
        submittedAt: user.kyc.submittedAt,
        reviewedAt: user.kyc.reviewedAt,
        rejectionReason: user.kyc.rejectionReason,
        verificationLevel: user.kyc.verificationLevel,
        documents: {
          idType: user.kyc.documents.idType,
          hasIdDocument: !!user.kyc.documents.idDocument,
          hasBusinessLicense: !!user.kyc.documents.businessLicense,
          hasProofOfAddress: !!user.kyc.documents.proofOfAddress
        }
      },
      businessName: user.profile.businessName
    });

  } catch (error) {
    console.error('Get KYC status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/kyc/pending
// @desc    Get all pending KYC applications (Admin only)
// @access  Private (Admin)
router.get('/pending', auth, adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const pendingApplications = await User.find({
      'kyc.status': 'pending'
    })
    .select('email profile kyc createdAt')
    .sort({ 'kyc.submittedAt': -1 })
    .skip(skip)
    .limit(limit);

    const total = await User.countDocuments({ 'kyc.status': 'pending' });

    res.json({
      success: true,
      applications: pendingApplications,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get pending KYC error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/kyc/application/:userId
// @desc    Get specific KYC application details (Admin only)
// @access  Private (Admin)
router.get('/application/:userId', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('email profile kyc createdAt lastLogin');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      application: {
        userId: user._id,
        email: user.email,
        profile: user.profile,
        kyc: user.kyc,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Get KYC application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/kyc/review/:userId
// @desc    Approve or reject KYC application (Admin only)
// @access  Private (Admin)
router.post('/review/:userId', auth, adminAuth, [
  body('action')
    .isIn(['approve', 'reject'])
    .withMessage('Action must be either approve or reject'),
  body('rejectionReason')
    .if(body('action').equals('reject'))
    .notEmpty()
    .withMessage('Rejection reason is required when rejecting')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { action, rejectionReason } = req.body;
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.kyc.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'KYC application is not pending review'
      });
    }

    // Update KYC status
    user.kyc.status = action === 'approve' ? 'approved' : 'rejected';
    user.kyc.reviewedAt = new Date();
    user.kyc.reviewedBy = req.user.id;
    
    if (action === 'reject') {
      user.kyc.rejectionReason = rejectionReason;
    } else {
      user.kyc.rejectionReason = undefined;
      user.kyc.verificationLevel = 'basic';
    }

    await user.save();

    // TODO: Send notification email to user
    // You can implement email notification here

    res.json({
      success: true,
      message: `KYC application ${action}d successfully`,
      kyc: {
        status: user.kyc.status,
        reviewedAt: user.kyc.reviewedAt,
        rejectionReason: user.kyc.rejectionReason
      }
    });

  } catch (error) {
    console.error('KYC review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during KYC review'
    });
  }
});

// @route   GET /api/kyc/document/:userId/:documentType
// @desc    View KYC document (Admin only)
// @access  Private (Admin)
router.get('/document/:userId/:documentType', auth, adminAuth, async (req, res) => {
  try {
    const { userId, documentType } = req.params;
    
    const user = await User.findById(userId).select('kyc.documents');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const validDocumentTypes = ['idDocument', 'businessLicense', 'proofOfAddress'];
    if (!validDocumentTypes.includes(documentType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document type'
      });
    }

    const filename = user.kyc.documents[documentType];
    if (!filename) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const filePath = path.join(uploadsDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Document file not found'
      });
    }

    // Set appropriate headers
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (['.jpg', '.jpeg'].includes(ext)) {
      contentType = 'image/jpeg';
    } else if (ext === '.png') {
      contentType = 'image/png';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('View document error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/kyc/stats
// @desc    Get KYC statistics (Admin only)
// @access  Private (Admin)
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$kyc.status',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      not_submitted: 0
    };

    stats.forEach(stat => {
      result[stat._id] = stat.count;
      result.total += stat.count;
    });

    // Get recent submissions
    const recentSubmissions = await User.find({
      'kyc.submittedAt': { $exists: true }
    })
    .select('email profile.firstName profile.lastName kyc.submittedAt kyc.status')
    .sort({ 'kyc.submittedAt': -1 })
    .limit(5);

    res.json({
      success: true,
      stats: result,
      recentSubmissions
    });

  } catch (error) {
    console.error('Get KYC stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;