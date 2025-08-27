const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { auth } = require('../middleware/auth');
const mongoose = require('mongoose');

// Get all published blogs (public)
router.get('/public', async (req, res) => {
  try {
    const { category, featured, limit = 10, page = 1 } = req.query;
    const query = { published: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (featured === 'true') {
      query.featured = true;
    }
    
    const blogs = await Blog.find(query)
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-content'); // Exclude full content for list view
    
    const total = await Blog.countDocuments(query);
    
    res.json({
      success: true,
      blogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching public blogs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single blog by slug (public)
router.get('/public/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, published: true });
    
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    
    // Increment view count
    blog.views += 1;
    await blog.save();
    
    res.json({ success: true, blog });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin routes (require authentication)
router.use(auth);

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

router.use(requireAdmin);

// Get all blogs (admin)
router.get('/', async (req, res) => {
  try {
    const { category, published, search, limit = 10, page = 1 } = req.query;
    const query = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (published !== undefined) {
      query.published = published === 'true';
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }
    
    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Blog.countDocuments(query);
    
    res.json({
      success: true,
      blogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single blog by ID (admin)
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    
    res.json({ success: true, blog });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create new blog post
router.post('/', async (req, res) => {
  try {
    const {
      title,
      excerpt,
      content,
      author,
      category,
      image,
      featured,
      published,
      readTime,
      tags
    } = req.body;
    
    // Validation
    if (!title || !excerpt || !content || !author || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, excerpt, content, author, and category are required'
      });
    }
    
    // Check if slug already exists
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
    
    const existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
      return res.status(400).json({
        success: false,
        message: 'A blog post with this title already exists'
      });
    }
    
    const blog = new Blog({
      title,
      excerpt,
      content,
      author,
      category,
      image: image || '',
      featured: featured || false,
      published: published || false,
      readTime: readTime || '5 min read',
      tags: tags || []
    });
    
    await blog.save();
    
    res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      blog
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update blog post
router.put('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    
    const {
      title,
      excerpt,
      content,
      author,
      category,
      image,
      featured,
      published,
      readTime,
      tags
    } = req.body;
    
    // If title is being changed, check for slug conflicts
    if (title && title !== blog.title) {
      const newSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
      
      const existingBlog = await Blog.findOne({ slug: newSlug, _id: { $ne: req.params.id } });
      if (existingBlog) {
        return res.status(400).json({
          success: false,
          message: 'A blog post with this title already exists'
        });
      }
    }
    
    // Update fields
    if (title !== undefined) blog.title = title;
    if (excerpt !== undefined) blog.excerpt = excerpt;
    if (content !== undefined) blog.content = content;
    if (author !== undefined) blog.author = author;
    if (category !== undefined) blog.category = category;
    if (image !== undefined) blog.image = image;
    if (featured !== undefined) blog.featured = featured;
    if (published !== undefined) blog.published = published;
    if (readTime !== undefined) blog.readTime = readTime;
    if (tags !== undefined) blog.tags = tags;
    
    await blog.save();
    
    res.json({
      success: true,
      message: 'Blog post updated successfully',
      blog
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete blog post
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid blog ID' });
    }
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    
    await Blog.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Toggle featured status
router.patch('/:id/featured', requireAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid blog ID' });
    }
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    
    blog.featured = !blog.featured;
    // Disable validation to avoid failing due to legacy invalid fields when only toggling featured
    await blog.save({ validateBeforeSave: false });
    
    res.json({
      success: true,
      message: `Blog post ${blog.featured ? 'featured' : 'unfeatured'} successfully`,
      blog
    });
  } catch (error) {
    console.error('Error toggling featured status:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Toggle published status
router.patch('/:id/publish', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid blog ID' });
    }

    // Fetch current published state without loading full document to avoid pre-save hooks
    const current = await Blog.findById(id).select('published publishedAt').lean();
    if (!current) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    const nextPublished = !current.published;
    const now = new Date();

    const update = nextPublished
      ? { published: true, publishedAt: current.publishedAt || now, updatedAt: now }
      : { published: false, updatedAt: now };

    const updated = await Blog.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: false }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    return res.json({
      success: true,
      message: `Blog post ${updated.published ? 'published' : 'unpublished'} successfully`,
      blog: updated
    });
  } catch (error) {
    console.error('Error toggling published status:', {
      id: req.params?.id,
      name: error?.name,
      code: error?.code,
      message: error?.message,
      stack: error?.stack
    });
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Like a blog post
router.post('/:id/like', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    blog.likes = (blog.likes || 0) + 1;
    await blog.save();

    res.json({ success: true, message: 'Blog post liked', likes: blog.likes });
  } catch (error) {
    console.error('Error liking blog post:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get blog statistics
router.get('/stats/overview', requireAdmin, async (req, res) => {
  try {
    const totalBlogs = await Blog.countDocuments();
    const publishedBlogs = await Blog.countDocuments({ published: true });
    const draftBlogs = await Blog.countDocuments({ published: false });
    const featuredBlogs = await Blog.countDocuments({ featured: true });
    
    const totalViews = await Blog.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);
    
    const categoryStats = await Blog.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      stats: {
        totalBlogs,
        publishedBlogs,
        draftBlogs,
        featuredBlogs,
        totalViews: totalViews[0]?.total || 0,
        categoryStats
      }
    });
  } catch (error) {
    console.error('Error fetching blog stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;