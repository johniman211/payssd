import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

const AnnouncementBanner = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState(
    JSON.parse(localStorage.getItem('dismissedAnnouncements') || '[]')
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveAnnouncements();
  }, []);

  useEffect(() => {
    // Auto-rotate announcements every 10 seconds if there are multiple
    if (announcements.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          (prevIndex + 1) % announcements.length
        );
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [announcements.length]);

  const fetchActiveAnnouncements = async () => {
    try {
      const response = await axios.get('/api/announcements/active');
      const activeAnnouncements = response.data.filter(
        announcement => !dismissedAnnouncements.includes(announcement._id)
      );
      setAnnouncements(activeAnnouncements);
      
      // Track view count for each announcement
      activeAnnouncements.forEach(announcement => {
        axios.post(`/api/announcements/${announcement._id}/view`).catch(() => {});
      });
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissAnnouncement = (announcementId) => {
    const newDismissed = [...dismissedAnnouncements, announcementId];
    setDismissedAnnouncements(newDismissed);
    localStorage.setItem('dismissedAnnouncements', JSON.stringify(newDismissed));
    
    // Remove from current announcements
    const filteredAnnouncements = announcements.filter(a => a._id !== announcementId);
    setAnnouncements(filteredAnnouncements);
    
    // Adjust current index if necessary
    if (currentIndex >= filteredAnnouncements.length && filteredAnnouncements.length > 0) {
      setCurrentIndex(0);
    }
  };

  const getIconForType = (type) => {
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

  const getColorClasses = (type) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getButtonClasses = (type) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'error':
        return 'bg-red-600 hover:bg-red-700 text-white';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  if (loading || announcements.length === 0) {
    return null;
  }

  const currentAnnouncement = announcements[currentIndex];
  const Icon = getIconForType(currentAnnouncement.type);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentAnnouncement._id}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.3 }}
        className={`relative border-b ${getColorClasses(currentAnnouncement.type)} px-4 py-3 sm:px-6 lg:px-8`}
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between flex-wrap">
            <div className="flex items-center flex-1 min-w-0">
              <Icon className="h-5 w-5 flex-shrink-0 mr-3" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {currentAnnouncement.title}
                </p>
                <p className="text-sm opacity-90 mt-1">
                  {currentAnnouncement.message}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 mt-2 sm:mt-0">
              {/* Action Button */}
              {currentAnnouncement.actionButton?.text && currentAnnouncement.actionButton?.url && (
                <a
                  href={currentAnnouncement.actionButton.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-200 ${getButtonClasses(currentAnnouncement.type)}`}
                >
                  {currentAnnouncement.actionButton.text}
                  <ArrowRightIcon className="ml-1 h-3 w-3" />
                </a>
              )}
              
              {/* Pagination dots for multiple announcements */}
              {announcements.length > 1 && (
                <div className="flex space-x-1">
                  {announcements.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                        index === currentIndex 
                          ? 'bg-current opacity-100' 
                          : 'bg-current opacity-40 hover:opacity-60'
                      }`}
                    />
                  ))}
                </div>
              )}
              
              {/* Dismiss Button */}
              {currentAnnouncement.dismissible && (
                <button
                  onClick={() => dismissAnnouncement(currentAnnouncement._id)}
                  className="flex-shrink-0 p-1 rounded-md hover:bg-black hover:bg-opacity-10 transition-colors duration-200"
                  aria-label="Dismiss announcement"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AnnouncementBanner;