const express = require("express");
const router = express.Router();
const visaController = require("./visa.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");
const { visaRequestSchema, visaStatusUpdateSchema } = require("./visa.validation");

// Candidate routes
router.get("/status", authMiddleware, roleMiddleware("CANDIDAT"), visaController.getMyVisaRequests);
router.get("/history", authMiddleware, roleMiddleware("CANDIDAT"), visaController.getMyVisaRequests);
router.post("/upload", authMiddleware, roleMiddleware("CANDIDAT"), validate(visaRequestSchema), visaController.requestVisa);

// Admin routes
router.get("/admin/all", authMiddleware, roleMiddleware("ADMIN"), visaController.getAllVisaRequestsAdmin);
router.patch("/admin/:id/status", authMiddleware, roleMiddleware("ADMIN"), validate(visaStatusUpdateSchema), visaController.updateVisaStatusAdmin);

module.exports = router;