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
function getPublicIdFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split('/');
    const versionIndex = parts.findIndex(part => /^v\d+$/.test(part));
    const publicIdParts = parts.slice(versionIndex + 1); // after version
    const filename = publicIdParts.pop();
    const filenameWithoutExt = filename.split('.')[0];
    publicIdParts.push(filenameWithoutExt);
    return publicIdParts.join('/');
  } catch (err) {
    console.error("Invalid Cloudinary URL:", url);
    return null;
  }
}

module.exports = { upload, getPublicIdFromUrl };
