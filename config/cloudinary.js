// // Required dependencies
// const cloudinary = require("cloudinary").v2;
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const multer = require("multer");
// require("dotenv").config();

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Configure Cloudinary storage for Multer
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "sanarts/images",
//     allowed_formats: ["jpg", "jpeg", "png", "gif"],
//   },
// });

// // Initialize Multer with Cloudinary storage
// const upload = multer({ storage: storage });

// // Helper function to extract public_id from Cloudinary URL
// function getPublicIdFromUrl(url) {
//   try {
//     const urlObj = new URL(url);
//     const parts = urlObj.pathname.split('/');
//     const versionIndex = parts.findIndex(part => /^v\d+$/.test(part));
//     const publicIdParts = parts.slice(versionIndex + 1); // after version
//     const filename = publicIdParts.pop();
//     const filenameWithoutExt = filename.split('.')[0];
//     publicIdParts.push(filenameWithoutExt);
//     return publicIdParts.join('/');
//   } catch (err) {
//     console.error("Invalid Cloudinary URL:", url);
//     return null;
//   }
// }

// module.exports = { upload, getPublicIdFromUrl, cloudinary };

//new

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

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "sanarts/images",
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
  },
});
const upload = multer({ storage: storage });

// Configure Cloudinary storage for Images
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "sanarts/images",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
  },
});

// Configure Cloudinary storage for Videos
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "sanarts/videos",
    allowed_formats: ["mp4", "mov", "avi", "mkv", "webm", "flv"],
    resource_type: "video",
  },
});

// Initialize Multer with different storage configurations
const uploadImage = multer({
  storage: imageStorage,
  // limits: {
  //   fileSize: 10 * 1024 * 1024, // 10MB limit for images
  // },
});

const uploadVideo = multer({
  storage: videoStorage,
  // limits: {
  //   fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  // },
});

// Combined upload middleware for handling both images and videos
const uploadMedia = multer({
  storage: multer.memoryStorage(), // Use memory storage for custom handling
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const imageFormats = ["jpg", "jpeg", "png", "gif", "webp"];
    const videoFormats = ["mp4", "mov", "avi", "mkv", "webm", "flv"];
    const fileExt = file.originalname.split(".").pop().toLowerCase();

    if (file.fieldname.includes("image") && imageFormats.includes(fileExt)) {
      cb(null, true);
    } else if (
      file.fieldname.includes("video") &&
      videoFormats.includes(fileExt)
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file format for ${file.fieldname}. Allowed formats: ${
            file.fieldname.includes("image")
              ? imageFormats.join(", ")
              : videoFormats.join(", ")
          }`
        )
      );
    }
  },
});

// Helper function to upload file to Cloudinary with custom folder
const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: options.resource_type || "image",
        allowed_formats: options.allowed_formats,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(buffer);
  });
};

// Helper function to extract public_id from Cloudinary URL
function getPublicIdFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split("/");
    const versionIndex = parts.findIndex((part) => /^v\d+$/.test(part));
    const publicIdParts = parts.slice(versionIndex + 1); // after version
    const filename = publicIdParts.pop();
    const filenameWithoutExt = filename.split(".")[0];
    publicIdParts.push(filenameWithoutExt);
    return publicIdParts.join("/");
  } catch (err) {
    console.error("Invalid Cloudinary URL:", url);
    return null;
  }
}

module.exports = {
  upload,
  uploadImage,
  uploadVideo,
  uploadMedia,
  uploadToCloudinary,
  getPublicIdFromUrl,
  cloudinary,
};
