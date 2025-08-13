const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  experience: {
    type: String,
    required: true
  },
  education: {
    type: String,
    required: true
  },
  currentRole: {
    type: String,
    trim: true
  },
  currentCompany: {
    type: String,
    trim: true
  },
  expectedSalary: {
    type: Number
  },
  availabilityDate: {
    type: Date
  },
  coverLetter: {
    type: String,
    required: true
  },
  resumeUrl: {
    type: String
  },
  portfolioUrl: {
    type: String
  },
  linkedinUrl: {
    type: String
  },
  githubUrl: {
    type: String
  },
  skills: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'shortlisted', 'interviewed', 'rejected', 'hired'],
    default: 'pending'
  },
  notes: {
    type: String
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt before saving
jobApplicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for better query performance
jobApplicationSchema.index({ job: 1 });
jobApplicationSchema.index({ email: 1 });
jobApplicationSchema.index({ status: 1 });
jobApplicationSchema.index({ createdAt: -1 });
jobApplicationSchema.index({ job: 1, email: 1 }, { unique: true }); // Prevent duplicate applications

module.exports = mongoose.model('JobApplication', jobApplicationSchema);