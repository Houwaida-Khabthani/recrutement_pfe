import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from "../store/api/notificationApi";
import { format } from 'date-fns';
import { Bell, CheckCheck, AlertCircle, AlertTriangle, CheckCircle2, Info, ArrowLeft } from 'lucide-react';
import Navbar from '../components/common/Navbar';

interface Notification {
  id_notif: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  lu: number; // 0 = unread, 1 = read
  date: string;
}

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

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

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin mb-4">
              <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full" />
            </div>
            <p className="text-slate-600 font-medium text-lg">Loading notifications...</p>
          </div>
        </div>
      );
    }

    // Filter notifications based on selected filter
    const filteredNotifications = notifications.filter((n) => {
      if (filter === 'unread') return n.lu === 0;
      if (filter === 'read') return n.lu === 1;
      return true;
    });

    const unreadCount = notifications.filter((n) => n.lu === 0).length;
    const readCount = notifications.filter((n) => n.lu === 1).length;

    return (
      <div className="w-full">
        {/* Back Button */}
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all duration-200 border border-transparent hover:border-slate-200 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Back</span>
          </button>
        </div>

        {/* Header Section */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col gap-6">
              {/* Title */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                    <Bell className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-slate-900">Notifications</h1>
                    <p className="text-slate-500 mt-1 font-medium">
                      {notifications.length} total • {unreadCount} unread
                    </p>
                  </div>
                </div>

                {/* Mark All Button */}
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={isMarkingAll}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCheck className={`w-5 h-5 ${isMarkingAll ? 'animate-spin' : ''}`} />
                    <span>Mark all as read</span>
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2 border-b border-slate-200">
                {[
                  { label: 'All', value: 'all', count: notifications.length },
                  { label: 'Unread', value: 'unread', count: unreadCount },
                  { label: 'Read', value: 'read', count: readCount },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setFilter(tab.value as any)}
                    className={`px-4 py-3 font-semibold transition-all duration-200 relative ${
                      filter === tab.value
                        ? 'text-blue-600'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="ml-2 text-sm font-medium">({tab.count})</span>
                    {filter === tab.value && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <Bell className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mb-2">No notifications</p>
              <p className="text-slate-500 text-center max-w-sm">
                {filter === 'unread'
                  ? "You're all caught up! No unread notifications."
                  : filter === 'read'
                  ? "You don't have any read notifications."
                  : "You don't have any notifications yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notif, index) => (
                <div
                  key={notif.id_notif}
                  className={`
                    group relative overflow-hidden rounded-2xl transition-all duration-300 ease-out
                    animate-in slide-in-from-left fade-in
                    ${getTypeColor(notif.type, notif.lu === 1)}
                    border ${notif.lu === 0 ? 'border-slate-300' : 'border-slate-200'}
                    hover:shadow-lg hover:border-slate-300 p-6
                  `}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'both',
                  }}
                >
                  {/* Unread Indicator Bar */}
                  {notif.lu === 0 && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-600" />
                  )}

                  <div className="flex items-start gap-5">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        notif.type === 'success' ? 'bg-emerald-100' :
                        notif.type === 'error' ? 'bg-red-100' :
                        notif.type === 'warning' ? 'bg-amber-100' :
                        'bg-blue-100'
                      }`}>
                        {getTypeIcon(notif.type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className={`font-bold capitalize text-sm ${
                            notif.type === 'success' ? 'text-emerald-700' :
                            notif.type === 'error' ? 'text-red-700' :
                            notif.type === 'warning' ? 'text-amber-700' :
                            'text-blue-700'
                          }`}>
                            {notif.type}
                          </p>
                          <p className="text-slate-700 mt-3 leading-relaxed text-base font-medium">
                            {notif.message || 'You have a new update.'}
                          </p>
                          <p className="text-xs text-slate-500 mt-3 font-semibold uppercase tracking-wider">
                            {format(new Date(notif.date), 'MMMM dd, yyyy \'at\' HH:mm')}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex-shrink-0 flex items-center gap-3">
                          {notif.lu === 0 && (
                            <button
                              onClick={() => handleMarkAsRead(notif.id_notif)}
                              className="px-5 py-2.5 bg-blue-500 text-white text-sm font-bold rounded-xl hover:bg-blue-600 transition-all duration-200 hover:shadow-md whitespace-nowrap hover:scale-105 active:scale-95"
                            >
                              Mark as read
                            </button>
                          )}
                          {notif.lu === 1 && (
                            <span className="px-4 py-2 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg flex items-center gap-1.5 uppercase tracking-wide">
                              <CheckCircle2 className="w-4 h-4" />
                              Read
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="mx-4 sm:mx-6 lg:mx-8 mt-6 p-6 bg-red-50 border-2 border-red-200 rounded-2xl">
            <p className="text-red-700 font-bold text-lg mb-2">Loading error</p>
            <p className="text-red-600 text-sm">
              An error occurred while loading notifications. Please refresh the page.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        showMenuButton={false}
        title="Tunisia Job Innovate"
        subtitle="Notifications"
        showSearch={false}
      />

      <main className="flex-1 bg-white overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default NotificationsPage;
