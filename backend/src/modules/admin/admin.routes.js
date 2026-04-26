const express = require("express");
const router = express.Router();
const adminController = require("./admin.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");

console.log("=== ADMIN ROUTES LOADING ===");
console.log("adminController methods:", Object.keys(adminController));

// All routes require ADMIN role
router.use(authMiddleware);
router.use(roleMiddleware("ADMIN"));

// Debug middleware to log all admin requests
router.use((req, res, next) => {
  console.log(`[ADMIN ROUTER] ${req.method} ${req.path}`, { 
    user: req.user?.id, 
    role: req.user?.role 
  });
  next();
});

router.get("/statistics", adminController.getStats);
router.get("/reports", adminController.getReports);

// User CRUD
router.get("/users", adminController.getUsers);
router.post("/users", adminController.createUser);
router.put("/users/:id", adminController.updateUser);
router.patch("/users/:id/verify", adminController.updateUserStatus);
router.delete("/users/:id", adminController.deleteUser);

// Company CRUD
router.get("/companies", adminController.getCompanies);
router.post("/companies", adminController.createCompany);

// Company Approval (MUST come before generic :id routes)
console.log("Registering approval routes: /companies/:id/approve and /companies/:id/reject");
router.put("/companies/:id/approve", adminController.approveCompany);
router.put("/companies/:id/reject", adminController.rejectCompany);

// Generic company routes (AFTER specific routes)
router.put("/companies/:id", adminController.updateCompany);
router.delete("/companies/:id", adminController.deleteCompany);

// Applications CRUD
router.get("/applications", adminController.getApplications);
router.patch("/applications/:id/status", adminController.updateApplicationStatus);
router.delete("/applications/:id", adminController.deleteApplication);

// Job CRUD
router.get("/jobs", adminController.getJobs);
router.get("/jobs/:id", adminController.getJobById);
router.patch("/jobs/:id/approve", adminController.approveJob);
router.patch("/jobs/:id/reject", adminController.rejectJob);
router.patch("/jobs/:id/suspend", adminController.suspendJob);

// Catch unmatched admin routes
router.use((req, res) => {
  console.log(`[ADMIN ROUTER 404] No route matched for ${req.method} ${req.path}`);
  res.status(404).json({ 
    message: "Admin route not found",
    path: req.path,
    method: req.method
  });
});

console.log("=== ADMIN ROUTES LOADED ===");

module.exports = router;