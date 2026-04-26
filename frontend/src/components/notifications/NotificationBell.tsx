import React, { useState, useEffect, useRef } from 'react';import { io, Socket } from 'socket.io-client';import { Bell, Check, CheckCheck, AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';

interface Notification {
  id_notif: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  lu: number; // 0 = unread, 1 = read
  date: string;
}

interface NotificationBellProps {
  userId?: number;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/notifications/recent', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.data.success) {
        setNotifications(response.data.data);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Socket.io: receive real-time notifications
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const endpoint = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
      : 'http://localhost:5000';

    const socket: Socket = io(endpoint, {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('[Socket] connected', socket.id);
    });

    socket.on('notification:new', (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket] connect error', error);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

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

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id_notif === notificationId ? { ...notif, lu: 1 } : notif
        )
      );

      // Recalculate unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
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

      // Update local state
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
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  // Get background color for notification
  const getTypeColor = (type: string, isRead: boolean) => {
    if (isRead) {
      return 'bg-slate-50 dark:bg-slate-800';
    }
    
    switch (type) {
      case 'success':
        return 'bg-emerald-50 dark:bg-emerald-950/30';
      case 'error':
        return 'bg-red-50 dark:bg-red-950/30';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-950/30';
      case 'info':
      default:
        return 'bg-blue-50 dark:bg-blue-950/30';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
      >
        <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'À jour'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg"
                title="Marquer toutes comme lues"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Tout lire
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="px-5 py-8 text-center text-slate-400">
                <div className="inline-block animate-spin">
                  <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full" />
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-400 dark:text-slate-500">Aucune notification</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Vous êtes à jour!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.map((notif) => (
                  <div
                    key={notif.id_notif}
                    className={`px-5 py-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer ${getTypeColor(notif.type, notif.lu === 1)}`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="mt-0.5 flex-shrink-0">
                        {getTypeIcon(notif.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-snug">
                          {notif.message}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {format(new Date(notif.date), 'dd MMM HH:mm')}
                        </p>
                      </div>

                      {/* Unread indicator & Action */}
                      <div className="flex-shrink-0 flex items-center gap-2">
                        {notif.lu === 0 && (
                          <>
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            <button
                              onClick={() => handleMarkAsRead(notif.id_notif)}
                              className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded transition-colors"
                              title="Marquer comme lu"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
              <a
                href="/admin/notifications"
                className="text-center block text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 py-2 transition-colors"
              >
                Voir toutes les notifications →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

