const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'success', 'error'],
    default: 'info'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null // null means no end date
  },
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 5 // 1 = lowest, 5 = highest priority
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  dismissible: {
    type: Boolean,
    default: true
  },
  actionButton: {
    text: {
      type: String,
      maxlength: 50
    },
    url: {
      type: String,
      maxlength: 200
    }
  }
}, {
  timestamps: true
});

// Index for efficient querying
announcementSchema.index({ isActive: 1, startDate: 1, endDate: 1, priority: -1 });

// Method to check if announcement is currently active
announcementSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  return this.isActive && 
         this.startDate <= now && 
         (!this.endDate || this.endDate >= now);
};

// Static method to get active announcements
announcementSchema.statics.getActiveAnnouncements = function() {
  const now = new Date();
  return this.find({
    isActive: true,
    startDate: { $lte: now },
    $or: [
      { endDate: null },
      { endDate: { $gte: now } }
    ]
  }).sort({ priority: -1, createdAt: -1 }).populate('createdBy', 'name email');
};

module.exports = mongoose.model('Announcement', announcementSchema);