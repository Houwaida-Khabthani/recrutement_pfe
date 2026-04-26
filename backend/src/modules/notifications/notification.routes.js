const express = require("express");
const router = express.Router();
const controller = require("./notification.controller");
const authMiddleware = require("../../middlewares/auth.middleware");

// Get all notifications
router.get("/", authMiddleware, controller.getUserNotifications);

// Get recent notifications (latest 5) with unread count
router.get("/recent", authMiddleware, controller.getRecentNotifications);

// Get unread count
router.get("/unread-count", authMiddleware, controller.getUnreadCount);

// Create notification
router.post("/", controller.createNotification);

// Mark single notification as read
router.put("/:id/read", authMiddleware, controller.markAsRead);

// Mark all notifications as read
router.put("/read-all", authMiddleware, controller.markAllAsRead);

module.exports = router;