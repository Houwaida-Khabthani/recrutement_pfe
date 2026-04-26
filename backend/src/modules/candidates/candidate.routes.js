const express = require("express");
const router = express.Router();

const candidateController = require("./candidate.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const upload = require("../../middlewares/upload.middleware");

// Get candidate profile
router.get("/profile", authMiddleware, candidateController.getCandidateProfile);

// Update candidate profile
router.put(
  "/profile",
  authMiddleware,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "cv", maxCount: 1 },
    { name: "portfolio", maxCount: 1 },
    { name: "certifications", maxCount: 10 }
  ]),
  candidateController.updateCandidateProfile
);

// Get candidate stats
router.get("/stats", authMiddleware, candidateController.getCandidateStats);

module.exports = router;