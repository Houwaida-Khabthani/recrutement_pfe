const notificationService = require("./notification.service");

// Get all notifications for user
exports.getUserNotifications = async (req, res) => {
  try {
    const id_user = req.user.id;
    const notifications = await notificationService.getUserNotifications(id_user);
    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get recent notifications (latest 5)
exports.getRecentNotifications = async (req, res) => {
  try {
    const id_user = req.user.id;
    const notifications = await notificationService.getRecentNotifications(id_user);
    const unreadCount = await notificationService.getUnreadCount(id_user);
    res.json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    console.error("Error fetching recent notifications:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const id_user = req.user.id;
    const unreadCount = await notificationService.getUnreadCount(id_user);
    res.json({ success: true, data: { unreadCount } });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create notification
exports.createNotification = async (req, res) => {
  try {
    const { message, type, id_user } = req.body;

    if (!message || !id_user) {
      return res.status(400).json({ success: false, message: "Message and user ID are required" });
    }

    await notificationService.createNotification({
      message,
      type: type || "info",
      id_user,
    });

    res.status(201).json({ success: true, message: "Notification created" });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Mark single notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await notificationService.markAsRead(id);
    res.json({ success: true, message: "Marked as read" });
  } catch (error) {
    console.error("Error marking as read:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const id_user = req.user.id;
    await notificationService.markAllAsRead(id_user);
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all as read:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};