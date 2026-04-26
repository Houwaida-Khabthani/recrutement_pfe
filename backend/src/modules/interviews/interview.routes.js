const express = require("express");
const router = express.Router();

const controller = require("./interview.controller");
const authMiddleware = require("../../middlewares/auth.middleware");

// Candidate interview inbox
router.get("/", authMiddleware, controller.getMyInterviews);

// Check if user can join an interview
router.get("/:id/can-join", authMiddleware, controller.canJoin);

// Application-specific interview plan for recruiter/candidate
router.get("/application/:applicationId", authMiddleware, controller.getApplicationInterviews);
router.patch("/application/:applicationId/expected", authMiddleware, controller.setExpectedInterviews);
router.post("/application/:applicationId", authMiddleware, controller.scheduleInterviewStep);

// Interview actions
router.patch("/:id/status", authMiddleware, controller.updateInterviewStatus);
router.patch("/:id/meeting-link", authMiddleware, controller.updateMeetingLink);
router.patch("/:id/confirm", authMiddleware, controller.confirm);
router.patch("/:id/cancel", authMiddleware, controller.cancel);

module.exports = router;
