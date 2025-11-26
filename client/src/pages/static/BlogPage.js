import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CalendarIcon, UserIcon, ClockIcon, TagIcon } from '@heroicons/react/24/outline';

const BlogPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredPost, setFeaturedPost] = useState(null);

  const categories = ['all', 'Product Updates', 'Industry News', 'Technical', 'Company News'];

  useEffect(() => {
    fetchBlogPosts();
  }, [selectedCategory]);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 20,
        ...(selectedCategory !== 'all' && { category: selectedCategory })
      };
      
      const response = await axios.get('/api/blog/public', { params });
      const posts = response.data.blogs;
      setBlogPosts(posts);
      
      // Find featured post
      const featured = posts.find(post => post.featured);
      setFeaturedPost(featured);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      // Fallback to hardcoded data if API fails
      const fallbackPosts = [
    {
      id: 1,
      title: 'Introducing PaySSD 2.0: Enhanced Security and Performance',
      excerpt: 'We\'re excited to announce the launch of PaySSD 2.0, featuring enhanced security measures, improved performance, and new developer tools.',
      content: 'Our latest platform update brings significant improvements to security, performance, and developer experience...',
      author: 'Sarah Johnson',
      date: '2024-01-15',
      readTime: '5 min read',
      category: 'Product Updates',
      image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      featured: true
    },
    {
      id: 2,
      title: 'The Future of Digital Payments: Trends to Watch in 2024',
      excerpt: 'Explore the key trends shaping the digital payments landscape and how businesses can prepare for the future.',
      content: 'The digital payments industry continues to evolve rapidly, driven by technological innovation and changing consumer preferences...',
      author: 'Michael Chen',
      date: '2024-01-10',
      readTime: '8 min read',
      category: 'Industry News',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      featured: false
    },
    {
      id: 3,
      title: 'Building Scalable Payment APIs: Best Practices',
      excerpt: 'Learn how to design and implement payment APIs that can handle millions of transactions while maintaining security and reliability.',
      content: 'Building payment APIs that scale requires careful consideration of architecture, security, and performance...',
      author: 'Emily Rodriguez',
      date: '2024-01-05',
      readTime: '12 min read',
      category: 'Technical',
      image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      featured: false
    },
    {
      id: 4,
      title: 'PaySSD Raises $25M Series B to Accelerate Global Expansion',
      excerpt: 'We\'re thrilled to announce our Series B funding round, which will help us expand our services to new markets worldwide.',
      content: 'Today marks a significant milestone in PaySSD\'s journey as we announce the completion of our $25M Series B funding round...',
      author: 'Sarah Johnson',
      date: '2023-12-20',
      readTime: '4 min read',
      category: 'Company News',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      featured: false
    },
    {
      id: 5,
      title: 'Understanding PCI DSS Compliance for Payment Processors',
      excerpt: 'A comprehensive guide to PCI DSS compliance requirements and how PaySSD helps merchants meet these standards.',
      content: 'PCI DSS compliance is crucial for any business handling payment card data. In this guide, we\'ll break down the requirements...',
      author: 'David Kim',
      date: '2023-12-15',
      readTime: '10 min read',
      category: 'Technical',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      featured: false
    },
    {
      id: 6,
      title: 'How Small Businesses Can Optimize Their Payment Flow',
      excerpt: 'Practical tips and strategies for small businesses to improve their payment processes and increase conversion rates.',
      content: 'For small businesses, optimizing the payment flow can significantly impact revenue and customer satisfaction...',
      author: 'Emily Rodriguez',
      date: '2023-12-10',
      readTime: '6 min read',
      category: 'Industry News',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
      featured: false
    }
  ];
      setBlogPosts(fallbackPosts);
      const featured = fallbackPosts.find(post => post.featured);
      setFeaturedPost(featured);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = selectedCategory === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  const regularPosts = blogPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              PaySSD Blog
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Insights, updates, and stories from the world of digital payments
            </p>
          </div>
        </div>
      </div>

      {/* Featured Post */}
                    {featuredPost && (
        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-8 lg:p-12 text-white">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                      Featured
                    </span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                      {featuredPost.category}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold mb-4">
                    {featuredPost.title}
                  </h2>
                  <p className="text-blue-100 mb-6">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-blue-100 text-sm mb-6">
                    <span className="flex items-center">
                      <UserIcon className="h-4 w-4 mr-1" />
                      {featuredPost.author}
                    </span>
                    <span className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {new Date(featuredPost.publishedAt || featuredPost.createdAt || featuredPost.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {featuredPost.readTime}
                    </span>
                  </div>
                  <button 
                    onClick={() => window.location.href = `/blog/${featuredPost.slug || featuredPost.id}`}
                    className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Read More
                  </button>
                </div>
                <div className="relative h-64 lg:h-auto">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category === 'all' ? 'All Posts' : category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.filter(post => !post.featured).map((post) => (
              <article key={post._id || post.id} className="bg白 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-48">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 text-gray-800 rounded-full text-xs font-medium">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <UserIcon className="h-4 w-4 mr-1" />
                      {post.author}
                    </span>
                    <span className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {new Date(post.publishedAt || post.createdAt || post.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-sm text-gray-500">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {post.readTime}
                    </span>
                    <button 
                      onClick={() => window.location.href = `/blog/${post.slug || post.id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Read More →
                    </button>
                  </div>
                </div>
              </article>
              ))}
            </div>
          )}
          
          {!loading && filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No posts found in this category.</p>
            </div>
          )}
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Stay Updated
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter to get the latest updates, insights, and industry news delivered to your inbox.
            </p>
            <div className="max-w-md mx-auto">
              <div className="flex gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Posts Sidebar */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Popular Posts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogPosts.slice(0, 3).map((post) => (
              <div key={post._id || post.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                    {post.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {new Date(post.publishedAt || post.createdAt || post.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
