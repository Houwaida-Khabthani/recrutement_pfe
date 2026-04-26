const express = require("express");
const router = express.Router();

const fileController = require("./file.controller");
const authMiddleware = require("../../middlewares/auth.middleware");

// Public routes (read-only)
router.get("/", fileController.getAllFiles);
router.get("/:id", fileController.getFileById);

// Authenticated routes (full CRUD)
router.use(authMiddleware);

router.post("/", fileController.createFile);
router.put("/:id", fileController.updateFile);
router.delete("/:id", fileController.deleteFile);

module.exports = router;