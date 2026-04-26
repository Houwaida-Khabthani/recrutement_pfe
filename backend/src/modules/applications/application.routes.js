const express = require("express");
const router = express.Router();
const applicationController = require("./application.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const upload = require("../../middlewares/upload.middleware");

// Candidate routes
router.post("/apply/:jobId", authMiddleware, upload.single('cv'), applicationController.apply);
router.get("/my-applications", authMiddleware, applicationController.getMyApplications);

// Recruiter routes
router.get("/company-applications", authMiddleware, applicationController.getCompanyApplications);
router.get("/job/:jobId", authMiddleware, applicationController.getJobApplications);
router.patch("/:id/status", authMiddleware, applicationController.updateStatus);
router.patch("/:id/offer-response", authMiddleware, applicationController.respondToOffer);

module.exports = router;