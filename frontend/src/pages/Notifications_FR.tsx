import { useEffect, useState } from 'react';
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from "../store/api/notificationApi";
import { format } from 'date-fns';
import { Bell, CheckCheck, AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface Notification {
  id_notif: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  lu: number; // 0 = unread, 1 = read
  date: string;
}

const Notifications = () => {
  const { data, isLoading, error } = useGetNotificationsQuery(undefined);
  const [markAsRead] = useMarkNotificationReadMutation();
  const [markAllAsRead] = useMarkAllNotificationsReadMutation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  useEffect(() => {
    if (data) {
      // Sort by newest first
      const sorted = [...data].sort((a: Notification, b: Notification) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setNotifications(sorted);
    }
  }, [data]);

  const unreadCount = notifications.filter((n) => n.lu === 0).length;

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id.toString()).unwrap();
      setNotifications((prev) =>
        prev.map((n) => (n.id_notif === id ? { ...n, lu: 1 } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    
    setIsMarkingAll(true);
    try {
      await markAllAsRead().unwrap();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, lu: 1 }))
      );
    } catch (error) {
      console.error("Error marking all as read:", error);
    } finally {
      setIsMarkingAll(false);
    }
  };

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

  const getTypeColor = (type: string, isRead: boolean) => {
    if (isRead) {
      return 'bg-white hover:bg-slate-50';
    }
    
    switch (type) {
      case 'success':
        return 'bg-emerald-50 hover:bg-emerald-100';
      case 'error':
        return 'bg-red-50 hover:bg-red-100';
      case 'warning':
        return 'bg-amber-50 hover:bg-amber-100';
      case 'info':
      default:
        return 'bg-blue-50 hover:bg-blue-100';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="inline-block animate-spin mb-4">
            <div className="w-12 h-12 border-4 border-slate-300 border-t-blue-600 rounded-full" />
          </div>
          <p className="text-slate-600 font-medium">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-2xl">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
                <p className="text-slate-600 mt-1">
                  {unreadCount > 0 
                    ? `${unreadCount} unread` 
                    : 'You\'re all caught up'}
                </p>
              </div>
            </div>

            {/* Mark All as Read Button */}
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAll}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-2xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCheck className={`w-5 h-5 transition-transform ${isMarkingAll ? 'animate-spin' : ''}`} />
                <span>Mark all as read</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-200">
            <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-lg font-semibold text-slate-600">No notifications</p>
            <p className="text-slate-500 mt-2">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif, index) => (
              <div
                key={notif.id_notif}
                className={`
                  ${getTypeColor(notif.type, notif.lu === 1)} 
                  border-2 ${notif.lu === 0 ? 'border-slate-300' : 'border-slate-200'}
                  rounded-2xl p-5 transition-all duration-300 ease-out
                  hover:shadow-md cursor-default
                  animate-in slide-in-from-left fade-in
                `}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'both',
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {getTypeIcon(notif.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 capitalize">
                          {notif.type}
                        </p>
                        <p className="text-slate-700 mt-2 leading-relaxed">
                          {notif.message || 'Vous avez une nouvelle mise à jour.'}
                        </p>
                        <p className="text-xs text-slate-500 mt-2 font-medium">
                          {format(new Date(notif.date), 'dd MMMM yyyy à HH:mm')}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0">
                        {notif.lu === 0 && (
                          <button
                            onClick={() => handleMarkAsRead(notif.id_notif)}
                            className="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-xl hover:bg-blue-600 transition-colors duration-200 hover:shadow-md whitespace-nowrap"
                          >
                            Mark as read
                          </button>
                        )}
                        {notif.lu === 1 && (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg">
                            ✓ Read
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Unread Indicator */}
                  {notif.lu === 0 && (
                    <div className="flex-shrink-0 w-2.5 h-2.5 bg-blue-500 rounded-full mt-2 animate-pulse" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
            <p className="text-red-700 font-semibold">Loading error</p>
            <p className="text-red-600 text-sm mt-1">
              An error occurred. Please refresh the page.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
