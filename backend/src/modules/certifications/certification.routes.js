const express = require("express");
const router = express.Router();

const certificationController = require("./certification.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");

// Public routes (read-only for candidates)
router.get("/", certificationController.getAllCertifications);
router.get("/:id", certificationController.getCertificationById);

// Admin routes (full CRUD)
router.use(authMiddleware);
router.use(roleMiddleware("ADMIN"));

router.post("/", certificationController.createCertification);
router.put("/:id", certificationController.updateCertification);
router.delete("/:id", certificationController.deleteCertification);

module.exports = router;