const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

// Configure multer for resume uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/resumes';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  }
});

// PUBLIC ROUTES

// Get all active jobs (public)
router.get('/public', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      department,
      location,
      type,
      level,
      search
    } = req.query;

    const query = { active: true };

    // Add filters
    if (department) query.department = department;
    if (location) query.location = new RegExp(location, 'i');
    if (type) query.type = type;
    if (level) query.level = level;
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'firstName lastName')
      .sort({ featured: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single job by slug (public)
router.get('/public/:slug', async (req, res) => {
  try {
    const job = await Job.findOne({ slug: req.params.slug, active: true })
      .populate('postedBy', 'firstName lastName');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Increment view count
    job.views += 1;
    await job.save();

    res.json({ success: true, job });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Apply for a job
router.post('/apply/:jobId', upload.single('resume'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job || !job.active) {
      return res.status(404).json({ success: false, message: 'Job not found or inactive' });
    }

    // Check if application deadline has passed
    if (job.applicationDeadline && new Date() > job.applicationDeadline) {
      return res.status(400).json({ success: false, message: 'Application deadline has passed' });
    }

    const applicationData = {
      job: req.params.jobId,
      ...req.body,
      skills: req.body.skills ? req.body.skills.split(',').map(skill => skill.trim()) : []
    };

    if (req.file) {
      applicationData.resumeUrl = `/uploads/resumes/${req.file.filename}`;
    }

    const application = new JobApplication(applicationData);
    await application.save();

    // Increment application count
    job.applicationCount += 1;
    await job.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: {
        _id: application._id,
        status: application.status,
        createdAt: application.createdAt
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already applied for this job' });
    }
    console.error('Error submitting application:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get job departments and locations for filters
router.get('/filters', async (req, res) => {
  try {
    const departments = await Job.distinct('department', { active: true });
    const locations = await Job.distinct('location', { active: true });
    const types = await Job.distinct('type', { active: true });
    const levels = await Job.distinct('level', { active: true });

    res.json({
      success: true,
      filters: {
        departments,
        locations,
        types,
        levels
      }
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// General resume submission (no specific job)
router.post('/general-application', upload.single('resume'), async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      location,
      experience,
      skills,
      coverLetter
    } = req.body;

    // Create a general application entry
    const application = new JobApplication({
      job: null, // No specific job
      fullName,
      email,
      phone,
      location,
      experience,
      skills,
      coverLetter,
      resume: req.file ? req.file.path : null,
      status: 'submitted'
    });

    await application.save();

    res.json({
      success: true,
      message: 'Resume submitted successfully',
      applicationId: application._id
    });
  } catch (error) {
    console.error('Error submitting general application:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ADMIN ROUTES

// Get all jobs (admin)
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      department,
      location,
      type,
      level,
      active,
      search
    } = req.query;

    const query = {};

    // Add filters
    if (department) query.department = department;
    if (location) query.location = new RegExp(location, 'i');
    if (type) query.type = type;
    if (level) query.level = level;
    if (active !== undefined) query.active = active === 'true';
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single job (admin)
router.get('/:id', auth, adminOnly, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'firstName lastName');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({ success: true, job });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create new job (admin)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      postedBy: req.user.id,
      requirements: Array.isArray(req.body.requirements) ? req.body.requirements : req.body.requirements.split('\n').filter(r => r.trim()),
      responsibilities: Array.isArray(req.body.responsibilities) ? req.body.responsibilities : req.body.responsibilities.split('\n').filter(r => r.trim()),
      benefits: req.body.benefits ? (Array.isArray(req.body.benefits) ? req.body.benefits : req.body.benefits.split('\n').filter(b => b.trim())) : [],
      skills: req.body.skills ? (Array.isArray(req.body.skills) ? req.body.skills : req.body.skills.split(',').map(s => s.trim())) : []
    };

    const job = new Job(jobData);
    await job.save();

    const populatedJob = await Job.findById(job._id)
      .populate('postedBy', 'firstName lastName');

    res.status(201).json({ success: true, job: populatedJob });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update job (admin)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      requirements: Array.isArray(req.body.requirements) ? req.body.requirements : req.body.requirements.split('\n').filter(r => r.trim()),
      responsibilities: Array.isArray(req.body.responsibilities) ? req.body.responsibilities : req.body.responsibilities.split('\n').filter(r => r.trim()),
      benefits: req.body.benefits ? (Array.isArray(req.body.benefits) ? req.body.benefits : req.body.benefits.split('\n').filter(b => b.trim())) : [],
      skills: req.body.skills ? (Array.isArray(req.body.skills) ? req.body.skills : req.body.skills.split(',').map(s => s.trim())) : []
    };

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('postedBy', 'firstName lastName');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({ success: true, job });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete job (admin)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Also delete all applications for this job
    await JobApplication.deleteMany({ job: req.params.id });

    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Toggle job active status (admin)
router.patch('/:id/toggle-active', auth, adminOnly, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    job.active = !job.active;
    await job.save();

    res.json({ success: true, job });
  } catch (error) {
    console.error('Error toggling job status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Toggle job featured status (admin)
router.patch('/:id/toggle-featured', auth, adminOnly, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    job.featured = !job.featured;
    await job.save();

    res.json({ success: true, job });
  } catch (error) {
    console.error('Error toggling job featured status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get job applications (admin)
router.get('/:id/applications', auth, adminOnly, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search
    } = req.query;

    const query = { job: req.params.id };

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { currentRole: new RegExp(search, 'i') },
        { currentCompany: new RegExp(search, 'i') }
      ];
    }

    const applications = await JobApplication.find(query)
      .populate('job', 'title')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await JobApplication.countDocuments(query);

    res.json({
      success: true,
      applications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update application status (admin)
router.patch('/applications/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const { status, notes } = req.body;

    const application = await JobApplication.findByIdAndUpdate(
      req.params.id,
      {
        status,
        notes,
        reviewedBy: req.user.id,
        reviewedAt: new Date()
      },
      { new: true }
    ).populate('job', 'title');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({ success: true, application });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get general applications (admin)
router.get('/general-applications', auth, adminOnly, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search
    } = req.query;

    const query = { job: null }; // General applications have no specific job

    // Add filters
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { fullName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { skills: new RegExp(search, 'i') }
      ];
    }

    const applications = await JobApplication.find(query)
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await JobApplication.countDocuments(query);

    res.json({
      success: true,
      applications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching general applications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get job statistics (admin)
router.get('/stats/overview', auth, adminOnly, async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ active: true });
    const featuredJobs = await Job.countDocuments({ featured: true });
    const totalApplications = await JobApplication.countDocuments();
    const pendingApplications = await JobApplication.countDocuments({ status: 'pending' });
    const totalViews = await Job.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);

    // Applications by status
    const applicationsByStatus = await JobApplication.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Jobs by department
    const jobsByDepartment = await Job.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalJobs,
        activeJobs,
        featuredJobs,
        totalApplications,
        pendingApplications,
        totalViews: totalViews[0]?.totalViews || 0,
        applicationsByStatus,
        jobsByDepartment
      }
    });
  } catch (error) {
    console.error('Error fetching job stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;