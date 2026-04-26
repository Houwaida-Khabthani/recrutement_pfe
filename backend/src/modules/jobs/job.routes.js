const express = require("express");
const router = express.Router();

const jobController = require("./job.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const { jobSchema } = require("./job.validation");

// Public routes
router.get("/recommended", jobController.getRecommendedJobs);

// Recruiter routes - MUST come before /:id to avoid conflict
router.get("/my-jobs", authMiddleware, jobController.getMyJobs);

// Public routes continued
router.get("/", jobController.getAllJobs);
router.get("/:id", jobController.getJobDetails);

router.post("/", authMiddleware, validate(jobSchema), jobController.createJob);
router.put("/:id", authMiddleware, validate(jobSchema), jobController.updateJob);
router.delete("/:id", authMiddleware, jobController.deleteJob);

module.exports = router;