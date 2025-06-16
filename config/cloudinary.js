// const cloudinary = require("cloudinary").v2;
// require("dotenv").config();

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// module.exports = cloudinary;

// Required dependencies
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
require("dotenv").config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "sanarts/images",
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
  },
});

// Initialize Multer with Cloudinary storage
const upload = multer({ storage: storage });

// Helper function to extract public_id from Cloudinary URL
const getPublicIdFromUrl = (url) => {
  try {
    // Example URL: https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/folder/image_name.jpg
    const urlParts = url.split("/");
    const uploadIndex = urlParts.findIndex((part) => part === "upload");

    if (uploadIndex === -1) return null;

    // Get everything after 'upload/v{version}/' or 'upload/'
    let pathAfterUpload = urlParts.slice(uploadIndex + 1).join("/");

    // Remove version if present (starts with 'v' followed by numbers)
    if (pathAfterUpload.match(/^v\d+\//)) {
      pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, "");
    }

    // Remove file extension
    const publicId = pathAfterUpload.replace(/\.[^/.]+$/, "");

    return publicId;
  } catch (error) {
    console.error("Error extracting public_id from URL:", error);
    return null;
  }
};

module.exports = { upload, getPublicIdFromUrl, cloudinary };
