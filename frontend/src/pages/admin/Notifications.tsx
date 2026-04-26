import React, { useState, useEffect } from 'react';
import { Bell, ArrowLeft, Trash2, AlertCircle, AlertTriangle, CheckCircle2, Info, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import axios from 'axios';

interface Notification {
  id_notif: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  lu: number; // 0 = unread, 1 = read
  date: string;
}

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Fetch all notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/notifications', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.success) {
        setNotifications(response.data.data);
        const unread = response.data.data.filter((n: Notification) => n.lu === 0).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await axios.put(
        `/api/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id_notif === notificationId ? { ...notif, lu: 1 } : notif
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await axios.put(
        '/api/notifications/read-all',
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setNotifications((prev) => prev.map((notif) => ({ ...notif, lu: 1 })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Get icon for notification type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  // Get background color for notification
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/30';
      case 'error':
        return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/30';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/30';
      case 'info':
      default:
        return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/30';
    }
  };

  // Get type badge color
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300';
      case 'error':
        return 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300';
      case 'warning':
        return 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300';
      case 'info':
      default:
        return 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300';
    }
  };

  // Filter notifications
  const filteredNotifications = filter === 'unread' ? notifications.filter((n) => n.lu === 0) : notifications;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 dark:text-white transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-950/30">
              <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Notifications</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'You\'re all caught up!'}
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors relative ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 font-semibold transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <div className="w-8 h-8 border-3 border-slate-300 dark:border-slate-600 border-t-blue-600 dark:border-t-blue-400 rounded-full" />
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-lg font-semibold text-slate-400 dark:text-slate-500">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              {filter === 'unread'
                ? 'Great job keeping up with notifications!'
                : 'You\'re all caught up!'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id_notif}
                className={`p-5 rounded-2xl border-2 transition-all hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20 ${getTypeColor(notification.type)} ${
                  notification.lu === 0 ? 'shadow-md dark:shadow-lg dark:shadow-black/20' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 p-3 rounded-xl bg-white/50 dark:bg-slate-800/50">
                    {getTypeIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-lg leading-snug">
                          {notification.message}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {format(new Date(notification.date), 'MMMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                      <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getTypeBadgeColor(notification.type)}`}>
                        {notification.type}
                      </span>
                    </div>

                    {/* Status Indicator */}
                    <div className="flex items-center gap-2 mt-3">
                      {notification.lu === 0 && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/50 dark:bg-slate-800/50 text-xs font-semibold text-blue-700 dark:text-blue-400">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                          Unread
                        </div>
                      )}
                      {notification.lu === 1 && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/50 dark:bg-slate-800/50 text-xs font-semibold text-slate-600 dark:text-slate-400">
                          <CheckCircle2 className="w-4 h-4" />
                          Read
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {notification.lu === 0 && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id_notif)}
                      className="flex-shrink-0 p-2.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-lg transition-colors group"
                      title="Mark as read"
                    >
                      <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
