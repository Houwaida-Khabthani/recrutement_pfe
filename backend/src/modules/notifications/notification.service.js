const notificationModel = require("./notification.model");
const socketService = require("../../services/socket.service");

// Get all notifications for user
exports.getUserNotifications = async (id_user) => {
  const [rows] = await notificationModel.getByUser(id_user);
  return rows;
};

// Get recent notifications (latest 5)
exports.getRecentNotifications = async (id_user) => {
  const [rows] = await notificationModel.getRecentByUser(id_user, 5);
  return rows;
};

// Get unread count for user
exports.getUnreadCount = async (id_user) => {
  const [rows] = await notificationModel.getUnreadCount(id_user);
  return rows[0]?.unreadCount || 0;
};

// Create notification
exports.createNotification = async (data) => {
  const { message, type, id_user } = data;
  const [result] = await notificationModel.create({
    message,
    type: type || "info",
    id_user,
  });

  const createdNotification = {
    id_notif: result?.insertId || null,
    message,
    type: type || "info",
    id_user,
    lu: 0,
    date: new Date().toISOString(),
  };

  try {
    socketService.emitToUser(id_user, "notification:new", createdNotification);
  } catch (emitError) {
    console.error("⚠️ Socket notification emit failed:", emitError.message);
  }
};

// Mark single notification as read
exports.markAsRead = async (id_notif) => {
  await notificationModel.markAsRead(id_notif);
};

// Mark all notifications as read
exports.markAllAsRead = async (id_user) => {
  await notificationModel.markAllAsRead(id_user);
};

// Get notification by ID
exports.getNotificationById = async (id_notif) => {
  const [rows] = await notificationModel.getById(id_notif);
  return rows[0] || null;
};

// Delete notification
exports.deleteNotification = async (id_notif) => {
  await notificationModel.delete(id_notif);
};