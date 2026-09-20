const express = require("express");
const multer = require("multer");

const { predictDisease } = require("../services/aiService");

const router = express.Router();

// Store uploaded image temporarily in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// POST /api/ai/predict
router.post(
  "/predict",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Image file is required.",
        });
      }

      const result = await predictDisease(
        req.file.buffer,
        req.file.originalname
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error(
        "[AI] Disease prediction failed:",
        error.message
      );

      return res.status(500).json({
        success: false,
        message: "AI disease prediction failed.",
      });
    }
  }
);

module.exports = router;