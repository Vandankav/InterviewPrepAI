// const express = require("express");
// const {
//   registerUser,
//   loginUser,
//   getUserProfile,
// } = require("../controllers/authController");
// const { protect } = require("../middlewares/authMiddleware");
// const upload = require("../middlewares/uploadMiddleware");

// const router = express.Router();

// // Auth Routes
// router.post("/register", registerUser); // Register User
// router.post("/login", loginUser); // Login User
// router.get("/profile", protect, getUserProfile); // Get User Profile

// router.post("/upload-image", upload.single("image"), (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ message: "No file uploaded" });
//   }
//   const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
//     req.file.filename
//   }`;
//   res.status(200).json({ imageUrl });
// });

// module.exports = router;

const express = require("express");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const streamifier = require("streamifier");
const {
  registerUser,
  loginUser,
  getUserProfile,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Basic multer setup for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Cloudinary config (optional here if already loaded via .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);

// Image upload using Cloudinary
router.post("/upload-image", upload.single("image"), async (req, res) => {
  try {
    console.log("Uploaded file:", req.file); // Add this to debug
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const streamUpload = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "user_profiles" },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              console.error("Cloudinary Upload Error:", error); // <-- log this!
              reject(error);
            }
          }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
      });
    };

    const result = await streamUpload(req.file.buffer);
    res.status(200).json({ imageUrl: result.secure_url });
  } catch (error) {
    console.error("Upload Failed:", error); // <- This was missing context
    res.status(500).json({ message: "Image upload failed" });
  }
});

module.exports = router;
