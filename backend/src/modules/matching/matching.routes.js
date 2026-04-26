const express = require("express");
const router = express.Router();

const matchingController = require("./matching.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");

// Public routes (read-only)
router.get("/", matchingController.getAllMatching);
router.get("/:id", matchingController.getMatchingById);

// Admin routes (full CRUD)
router.use(authMiddleware);
router.use(roleMiddleware("ADMIN"));

router.post("/", matchingController.createMatching);
router.put("/:id", matchingController.updateMatching);
router.delete("/:id", matchingController.deleteMatching);

module.exports = router;