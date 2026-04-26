const express = require("express");
const multer = require("multer");
const { parseCV } = require("./ai.controller");

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post("/parse-cv", upload.single("cv"), parseCV);

module.exports = router;