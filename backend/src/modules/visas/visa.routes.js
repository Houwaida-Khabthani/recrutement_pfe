const express = require("express");
const router = express.Router();
const visaController = require("./visa.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");
const { documentUploadSchema, visaStatusUpdateSchema, documentStatusUpdateSchema } = require("./visa.validation");
const multer = require("multer");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/visa/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'visa-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'), false);
    }
  }
});

// Candidate routes
router.get("/status", authMiddleware, roleMiddleware("CANDIDAT"), visaController.getMyVisaRequests);
router.get("/history", authMiddleware, roleMiddleware("CANDIDAT"), visaController.getMyVisaRequests);
router.post("/upload", authMiddleware, roleMiddleware("CANDIDAT"), upload.single('document'), validate(documentUploadSchema), visaController.uploadDocument);
router.get("/documents", authMiddleware, roleMiddleware("CANDIDAT"), visaController.getUserDocuments);
router.delete("/documents/:id", authMiddleware, roleMiddleware("CANDIDAT"), visaController.deleteDocument);

// Admin routes
router.get("/admin/all", authMiddleware, roleMiddleware("ADMIN"), visaController.getAllVisaRequestsAdmin);
router.patch("/admin/:id/status", authMiddleware, roleMiddleware("ADMIN"), validate(visaStatusUpdateSchema), visaController.updateVisaStatusAdmin);
router.patch("/documents/:id/status", authMiddleware, roleMiddleware("ADMIN"), validate(documentStatusUpdateSchema), visaController.updateDocumentStatus);

module.exports = router;