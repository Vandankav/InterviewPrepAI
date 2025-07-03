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
const {
  registerUser,
  loginUser,
  getUserProfile,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const multer = require("multer");
const streamifier = require("streamifier");

const router = express.Router();

// Cloudinary config here itself (no separate utils/cloudinary.js)
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use multer memory storage for buffer upload to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Auth Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);

// Upload Image Route
router.post("/upload-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "user_profiles" }, // optional folder
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({ message: "Cloudinary upload failed" });
        } else {
          return res.status(200).json({ imageUrl: result.secure_url });
        }
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error uploading image" });
  }
});

module.exports = router;
