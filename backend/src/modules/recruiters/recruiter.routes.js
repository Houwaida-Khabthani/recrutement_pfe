const express = require('express');
const recruiterController = require('./recruiter.controller');
const auth = require('../../middlewares/auth.middleware');

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.error('=== RECRUITER ROUTER === Method:', req.method, 'URL:', req.url);
  next();
});

// Get recruiter profile (protected route)
router.get('/profile', auth, (req, res, next) => {
  console.error('=== RECRUITER /PROFILE GET HANDLER ===');
  recruiterController.getRecruiterProfile(req, res, next);
});

module.exports = router;
