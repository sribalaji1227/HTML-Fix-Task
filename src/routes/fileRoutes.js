const express = require("express");
const multer = require("multer");
const { processUploadedFile } = require("../controllers/fileController");

const router = express.Router();

// Multer configuration for file upload
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/zip") {
      return cb(new Error("Only ZIP files are allowed!"));
    }
    cb(null, true);
  },
});

router.post("/", upload.single("file"), processUploadedFile);

module.exports = router;
