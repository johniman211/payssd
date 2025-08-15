const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get all active announcements (public route)
router.get('/active', async (req, res) => {
  try {
    const announcements = await Announcement.getActiveAnnouncements();
    res.json(announcements);
  } catch (error) {
    console.error('Error fetching active announcements:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Increment view count for an announcement
router.post('/:id/view', async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    announcement.viewCount += 1;
    await announcement.save();
    
    res.json({ message: 'View count updated' });
  } catch (error) {
    console.error('Error updating view count:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes - require authentication and admin role
router.use(auth);

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
};

router.use(requireAdmin);

// Get all announcements (admin only)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = {};
    
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }
    
    const announcements = await Announcement.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Announcement.countDocuments(query);
    
    res.json({
      announcements,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single announcement (admin only)
router.get('/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    res.json(announcement);
  } catch (error) {
    console.error('Error fetching announcement:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new announcement (admin only)
router.post('/', [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title must be between 1 and 100 characters'),
  body('message').trim().isLength({ min: 1, max: 500 }).withMessage('Message must be between 1 and 500 characters'),
  body('type').optional().isIn(['info', 'warning', 'success', 'error']).withMessage('Invalid announcement type'),
  body('priority').optional().isInt({ min: 1, max: 5 }).withMessage('Priority must be between 1 and 5'),
  body('startDate').optional().isISO8601().withMessage('Invalid start date'),
  body('endDate').optional().isISO8601().withMessage('Invalid end date'),
  body('dismissible').optional().isBoolean().withMessage('Dismissible must be a boolean'),
  body('actionButton.text').optional().isLength({ max: 50 }).withMessage('Action button text must be max 50 characters'),
  body('actionButton.url').optional().isURL().withMessage('Action button URL must be valid')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      title,
      message,
      type = 'info',
      priority = 1,
      startDate,
      endDate,
      dismissible = true,
      actionButton
    } = req.body;
    
    // Validate date logic
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }
    
    const announcement = new Announcement({
      title,
      message,
      type,
      priority,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      dismissible,
      actionButton,
      createdBy: req.user.id
    });
    
    await announcement.save();
    await announcement.populate('createdBy', 'name email');
    
    res.status(201).json(announcement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update announcement (admin only)
router.put('/:id', [
  body('title').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Title must be between 1 and 100 characters'),
  body('message').optional().trim().isLength({ min: 1, max: 500 }).withMessage('Message must be between 1 and 500 characters'),
  body('type').optional().isIn(['info', 'warning', 'success', 'error']).withMessage('Invalid announcement type'),
  body('priority').optional().isInt({ min: 1, max: 5 }).withMessage('Priority must be between 1 and 5'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('startDate').optional().isISO8601().withMessage('Invalid start date'),
  body('endDate').optional().isISO8601().withMessage('Invalid end date'),
  body('dismissible').optional().isBoolean().withMessage('Dismissible must be a boolean'),
  body('actionButton.text').optional().isLength({ max: 50 }).withMessage('Action button text must be max 50 characters'),
  body('actionButton.url').optional().isURL().withMessage('Action button URL must be valid')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    const updates = req.body;
    
    // Validate date logic if both dates are provided
    if (updates.startDate && updates.endDate && new Date(updates.startDate) >= new Date(updates.endDate)) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }
    
    // Convert date strings to Date objects
    if (updates.startDate) updates.startDate = new Date(updates.startDate);
    if (updates.endDate) updates.endDate = new Date(updates.endDate);
    
    Object.assign(announcement, updates);
    await announcement.save();
    await announcement.populate('createdBy', 'name email');
    
    res.json(announcement);
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete announcement (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle announcement status (admin only)
router.patch('/:id/toggle', async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    announcement.isActive = !announcement.isActive;
    await announcement.save();
    await announcement.populate('createdBy', 'name email');
    
    res.json(announcement);
  } catch (error) {
    console.error('Error toggling announcement status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;