const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");

const authController = require("./auth.controller");
const validate = require("../../middlewares/validate.middleware");
const authMiddleware = require("../../middlewares/auth.middleware");
const {
  registerSchema,
  loginSchema,
} = require("./auth.validation");

// ✅ STORAGE CONFIG
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/logos/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// ✅ FIXED REGISTER (WITH FILE)
router.post("/register", authController.register);

router.post("/login", validate(loginSchema), authController.login);

router.get("/me", authMiddleware, authController.me);

router.post("/forgot-password", authController.forgotPassword);
router.put("/change-password", authMiddleware, authController.changePassword);

module.exports = router;