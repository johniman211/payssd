import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  MegaphoneIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../ui/LoadingSpinner';
import { TokenStorage } from '../../utils/security';

const AnnouncementManager = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    active: true,
    startDate: '',
    endDate: '',
    priority: 1,
    dismissible: true,
    actionButton: {
      text: '',
      url: ''
    }
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('/api/announcements', {
        headers: {
          Authorization: `Bearer ${TokenStorage.getToken(TokenStorage.getCurrentRole())}`
        }
      });
      // Handle the nested response structure
      setAnnouncements(response.data.announcements || response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        isActive: formData.active, // Map frontend 'active' to backend 'isActive'
        actionButton: formData.actionButton.text && formData.actionButton.url 
          ? formData.actionButton 
          : undefined
      };
      // Remove the frontend 'active' field to avoid confusion
      delete payload.active;

      if (editingAnnouncement) {
        await axios.put(`/api/announcements/${editingAnnouncement._id}`, payload, {
          headers: {
            Authorization: `Bearer ${TokenStorage.getToken(TokenStorage.getCurrentRole())}`
          }
        });
        toast.success('Announcement updated successfully');
      } else {
        await axios.post('/api/announcements', payload, {
          headers: {
            Authorization: `Bearer ${TokenStorage.getToken(TokenStorage.getCurrentRole())}`
          }
        });
        toast.success('Announcement created successfully');
      }
      
      setShowModal(false);
      setEditingAnnouncement(null);
      resetForm();
      fetchAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast.error(error.response?.data?.message || 'Failed to save announcement');
    }
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      active: announcement.isActive,
      startDate: announcement.startDate ? new Date(announcement.startDate).toISOString().split('T')[0] : '',
      endDate: announcement.endDate ? new Date(announcement.endDate).toISOString().split('T')[0] : '',
      priority: announcement.priority,
      dismissible: announcement.dismissible,
      actionButton: announcement.actionButton || { text: '', url: '' }
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      await axios.delete(`/api/announcements/${id}`, {
        headers: {
          Authorization: `Bearer ${TokenStorage.getToken(TokenStorage.getCurrentRole())}`
        }
      });
      toast.success('Announcement deleted successfully');
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await axios.patch(`/api/announcements/${id}/toggle`, {}, {
        headers: {
          Authorization: `Bearer ${TokenStorage.getToken(TokenStorage.getCurrentRole())}`
        }
      });
      toast.success(`Announcement ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error toggling announcement status:', error);
      toast.error('Failed to update announcement status');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'info',
      active: true,
      startDate: '',
      endDate: '',
      priority: 1,
      dismissible: true,
      actionButton: {
        text: '',
        url: ''
      }
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'warning':
        return ExclamationTriangleIcon;
      case 'success':
        return CheckCircleIcon;
      case 'error':
        return XCircleIcon;
      default:
        return InformationCircleIcon;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <MegaphoneIcon className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Announcement Manager
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage announcements displayed on the landing page
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            resetForm();
            setEditingAnnouncement(null);
            setShowModal(true);
          }}
          className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <PlusIcon className="h-5 w-5" />
          <span>New Announcement</span>
        </motion.button>
      </div>

      {/* Announcements List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {announcements.length === 0 ? (
          <div className="text-center py-12">
            <MegaphoneIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No announcements yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first announcement to display on the landing page
            </p>
            <button
              onClick={() => {
                resetForm();
                setEditingAnnouncement(null);
                setShowModal(true);
              }}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Create Announcement
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {announcements.map((announcement) => {
              const TypeIcon = getTypeIcon(announcement.type);
              return (
                <motion.div
                  key={announcement._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`p-2 rounded-lg ${getTypeColor(announcement.type)}`}>
                          <TypeIcon className="h-4 w-4" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {announcement.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          announcement.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {announcement.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {announcement.message}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>Priority: {announcement.priority}</span>
                        <span>Views: {announcement.viewCount}</span>
                        {announcement.startDate && (
                          <span>Start: {new Date(announcement.startDate).toLocaleDateString()}</span>
                        )}
                        {announcement.endDate && (
                          <span>End: {new Date(announcement.endDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleStatus(announcement._id, announcement.isActive)}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          announcement.isActive
                            ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900'
                            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        title={announcement.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {announcement.isActive ? (
                          <EyeIcon className="h-5 w-5" />
                        ) : (
                          <EyeSlashIcon className="h-5 w-5" />
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(announcement)}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors duration-200"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(announcement._id)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors duration-200"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter announcement title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter announcement message"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="info">Info</option>
                        <option value="warning">Warning</option>
                        <option value="success">Success</option>
                        <option value="error">Error</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Priority
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Action Button (Optional)
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          value={formData.actionButton.text}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            actionButton: { ...formData.actionButton, text: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="Button text"
                        />
                      </div>
                      <div>
                        <input
                          type="url"
                          value={formData.actionButton.url}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            actionButton: { ...formData.actionButton, url: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="Button URL"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.dismissible}
                        onChange={(e) => setFormData({ ...formData, dismissible: e.target.checked })}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Dismissible</span>
                    </label>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
                    >
                      {editingAnnouncement ? 'Update' : 'Create'} Announcement
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnnouncementManager;