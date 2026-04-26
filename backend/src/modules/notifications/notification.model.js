const db = require("../../config/db");

// Get all notifications for a user
exports.getByUser = (id_user) => {
  return db.query(
    "SELECT * FROM notification WHERE id_user = ? ORDER BY date DESC",
    [id_user]
  );
};

// Get recent notifications (latest 5)
exports.getRecentByUser = (id_user, limit = 5) => {
  return db.query(
    "SELECT * FROM notification WHERE id_user = ? ORDER BY date DESC LIMIT ?",
    [id_user, limit]
  );
};

// Get unread count for a user
exports.getUnreadCount = (id_user) => {
  return db.query(
    "SELECT COUNT(*) as unreadCount FROM notification WHERE id_user = ? AND lu = 0",
    [id_user]
  );
};

// Create a notification
exports.create = (data) => {
  return db.query(
    "INSERT INTO notification (message, type, date, id_user, lu) VALUES (?, ?, NOW(), ?, 0)",
    [data.message, data.type, data.id_user]
  );
};

// Mark single notification as read
exports.markAsRead = (id_notif) => {
  return db.query("UPDATE notification SET lu = 1 WHERE id_notif = ?", [id_notif]);
};

// Mark all notifications as read for a user
exports.markAllAsRead = (id_user) => {
  return db.query("UPDATE notification SET lu = 1 WHERE id_user = ? AND lu = 0", [id_user]);
};

// Get notification by ID
exports.getById = (id_notif) => {
  return db.query("SELECT * FROM notification WHERE id_notif = ?", [id_notif]);
};

// Delete notification
exports.delete = (id_notif) => {
  return db.query("DELETE FROM notification WHERE id_notif = ?", [id_notif]);
};