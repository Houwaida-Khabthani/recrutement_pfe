import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export interface Notification {
  id_notif: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  lu: number; // 0 = unread, 1 = read
  date: string;
  id_user?: number;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  fetchRecentNotifications: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  createNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  });

  // Fetch all notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/notifications', {
        headers: getAuthHeader(),
      });

      if (response.data.success) {
        setNotifications(response.data.data);
        const unread = response.data.data.filter((n: Notification) => n.lu === 0).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch recent notifications
  const fetchRecentNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/notifications/recent', {
        headers: getAuthHeader(),
      });

      if (response.data.success) {
        setNotifications(response.data.data);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (err) {
      console.error('Error fetching recent notifications:', err);
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await axios.put(
        `/api/notifications/${notificationId}/read`,
        {},
        { headers: getAuthHeader() }
      );

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id_notif === notificationId ? { ...notif, lu: 1 } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Failed to mark notification as read');
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await axios.put('/api/notifications/read-all', {}, { headers: getAuthHeader() });

      // Update local state
      setNotifications((prev) => prev.map((notif) => ({ ...notif, lu: 1 })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
      setError('Failed to mark all as read');
    }
  }, []);

  // Create notification
  const createNotification = useCallback(
    async (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
      try {
        const response = await axios.post(
          '/api/notifications',
          { message, type },
          { headers: getAuthHeader() }
        );

        if (response.data.success) {
          // Fetch updated notifications list
          await fetchRecentNotifications();
        }
      } catch (err) {
        console.error('Error creating notification:', err);
        setError('Failed to create notification');
      }
    },
    [fetchRecentNotifications]
  );

  // Auto-fetch notifications on mount
  useEffect(() => {
    fetchRecentNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchRecentNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchRecentNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchRecentNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
  };
};
