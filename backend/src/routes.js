const express = require("express");
const router = express.Router();

const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/users/user.routes");
const notificationRoutes = require("./modules/notifications/notification.routes");
const jobRoutes = require("./modules/jobs/job.routes");
const candidateRoutes = require("./modules/candidates/candidate.routes");
const applicationRoutes = require("./modules/applications/application.routes");
const adminRoutes = require("./modules/admin/admin.routes");
const visaRoutes = require("./modules/visas/visa.routes");
const interviewRoutes = require("./modules/interviews/interview.routes");
const companyRoutes = require("./modules/companies/company.routes");
const certificationRoutes = require("./modules/certifications/certification.routes");
const matchingRoutes = require("./modules/matching/matching.routes");
const fileRoutes = require("./modules/files/file.routes");
const recruiterRoutes = require("./modules/recruiters/recruiter.routes");
const analyticsRoutes = require("./modules/analytics/analytics.routes");

router.use("/company", companyRoutes);
// Public & Common Routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/notifications", notificationRoutes);

// Feature Routes
router.use("/jobs", jobRoutes);
router.use("/candidates", candidateRoutes);
router.use("/applications", applicationRoutes);
router.use("/visas", visaRoutes);
router.use("/interviews", interviewRoutes);
router.use("/certifications", certificationRoutes);
router.use("/matching", matchingRoutes);
router.use("/files", fileRoutes);
router.use("/analytics", analyticsRoutes);
console.error('=== REGISTERING RECRUITER ROUTES ===');
router.use("/recruiters", recruiterRoutes);
console.error('=== RECRUITER ROUTES REGISTERED ===');
// Restricted Routes
router.use("/admin", adminRoutes);

module.exports = router;