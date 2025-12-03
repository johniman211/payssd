import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/supabaseClient';
import { Bell, CheckCircle, XCircle, AlertTriangle, Info, Trash2, Check } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
    const channel = supabase.channel('admin_notifications')
      .on('postgres_changes', { event: 'insert', schema: 'public', table: 'notifications', filter: 'recipient_type=eq.admin' }, (payload) => {
        setNotifications((prev) => [payload.new, ...prev])
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_type', 'admin')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_type', 'admin')
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20' };
      case 'error':
        return { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20' };
      case 'warning':
        return { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
      default:
        return { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/20' };
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.is_read;
    if (filter === 'read') return notification.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <AdminLayout activePage="notifications">
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Notifications</h1>
          <p className="text-gray-400 mt-1">System alerts and updates</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-primary-600/20 border border-primary-500/30 rounded-lg">
              <Bell size={18} className="text-primary-400" />
              <span className="text-primary-400 font-semibold">{unreadCount} unread</span>
            </div>
          )}
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Check size={18} />
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">Filter:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-700'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'unread'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'read'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Read ({notifications.length - unreadCount})
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-12">
            <div className="flex flex-col items-center justify-center text-gray-400">
              <Bell size={48} className="mb-4 opacity-50" />
              <p className="text-lg">No notifications found</p>
              <p className="text-sm mt-2">You're all caught up!</p>
            </div>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const iconData = getNotificationIcon(notification.type);
            const Icon = iconData.icon;

            return (
              <div
                key={notification.id}
                className={`bg-gray-800 rounded-xl border ${
                  notification.is_read ? 'border-gray-700' : 'border-primary-500/50'
                } p-5 hover:border-primary-500 transition-all ${
                  !notification.is_read ? 'bg-gray-800/80' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`${iconData.bg} p-3 rounded-lg flex-shrink-0`}>
                    <Icon className={iconData.color} size={24} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold ${
                          notification.is_read ? 'text-gray-300' : 'text-white'
                        }`}>
                          {notification.title}
                        </h3>
                        <p className="text-gray-400 mt-1 text-sm">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <span>{new Date(notification.created_at).toLocaleString()}</span>
                          {!notification.is_read && (
                            <span className="px-2 py-0.5 bg-primary-600/20 text-primary-400 rounded-full">
                              New
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.is_read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                            title="Mark as read"
                          >
                            <Check size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-2 bg-gray-700 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Stats */}
      {notifications.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Notifications</p>
            <p className="text-2xl font-bold text-white mt-1">{notifications.length}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Unread</p>
            <p className="text-2xl font-bold text-primary-400 mt-1">{unreadCount}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Today</p>
            <p className="text-2xl font-bold text-white mt-1">
              {notifications.filter(n => {
                const notifDate = new Date(n.created_at);
                const today = new Date();
                return notifDate.toDateString() === today.toDateString();
              }).length}
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">This Week</p>
            <p className="text-2xl font-bold text-white mt-1">
              {notifications.filter(n => {
                const notifDate = new Date(n.created_at);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return notifDate >= weekAgo;
              }).length}
            </p>
          </div>
        </div>
      )}
    </div>
    </AdminLayout>
  );
};

export default AdminNotifications;

