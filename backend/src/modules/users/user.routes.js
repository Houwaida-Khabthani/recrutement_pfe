const express = require("express");
const router = express.Router();

const userController = require("./user.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const upload = require("../../middlewares/upload.middleware");
const validate = require("../../middlewares/validate.middleware");
const { updateProfileSchema } = require("./user.validation");

router.get("/me", authMiddleware, userController.getMyProfile);

router.put(
  "/me",
  authMiddleware,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "cv", maxCount: 1 },
    { name: "portfolio", maxCount: 1 },
    { name: "avatar", maxCount: 1 }
  ]),
  validate(updateProfileSchema),
  userController.updateMyProfile
);

router.get("/stats", authMiddleware, userController.getMyStats);

module.exports = router;