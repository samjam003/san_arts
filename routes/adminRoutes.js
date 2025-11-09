const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const requireAuth = require("../middleware/authMiddleware");

const {
  addMainCategory,
  addPost,
  addSubcategory,
  addFilter,
  updateMainCategory,
  deleteMainCategory,
  updateSubcategory,
  deleteSubcategory,
  getAllSubcategories,
  updateFilter,
  deleteFilter,
  getAllFilters,
  getFiltersBySubcategory,
  getAllImages,
  updateImage,
  deleteImage,
  getDashboardStats,
  updateImagePinStatus,
} = require("../controllers/adminController");
const { upload, uploadMedia } = require("../config/cloudinary");

const { login } = require("../controllers/auth/login");

// router.post("/addImage", upload.single("image"), addImage);
//IMAGES
// router.post(
//   "/addImage",
//   upload.fields([
//     { name: "main_image", maxCount: 1 },
//     { name: "sub_images", maxCount: 10 },
//   ]),
//   addImage
// );

//auth routes
router.post("/login", login);

// Route for adding a post with image and optional video
router.post(
  "/addPost",
  requireAuth,
  uploadMedia.fields([
    { name: "main_image", maxCount: 1 }, // Required
    { name: "sub_images", maxCount: 5 }, // Optional, max 5 sub images
    { name: "video", maxCount: 1 }, // Optional
  ]),
  addPost
);

// router.put("/updateImage/:id", upload.single("image"), updateImage);
router.put(
  "/updateImage/:id",
  requireAuth,
  uploadMedia.fields([
    { name: "img_url", maxCount: 1 },
    { name: "sub_images", maxCount: 10 },
  ]),
  updateImage
);

router.get("/images", requireAuth, getAllImages);
router.delete("/deleteImage/:id", requireAuth, deleteImage);
router.put(
  "/updateImage/:id",
  requireAuth,
  uploadMedia.fields([
    { name: "main_image", maxCount: 1 }, // Optional - only if updating main image
    { name: "sub_images", maxCount: 10 }, // Optional - sub images
    { name: "video", maxCount: 1 }, // Optional - video
  ]),
  updateImage
);
// MAIN-CATEGORY
router.post("/addMainCategory", requireAuth, addMainCategory);
router.put("/updateMainCategory/:id", requireAuth, updateMainCategory);
router.delete("/deleteMainCategory/:id", requireAuth, deleteMainCategory);
//SUB-CATEGORY
router.post(
  "/addSubcategory",
  requireAuth,
  upload.single("image"),
  addSubcategory
);
router.get("/subcategories", requireAuth, getAllSubcategories);
router.put(
  "/updateSubcategory/:id",
  requireAuth,
  upload.fields([
    { name: "background_img", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  updateSubcategory
);
router.delete("/deleteSubcategory/:id", requireAuth, deleteSubcategory);
//FILTERS
router.post("/addFilter", requireAuth, addFilter);
router.put("/updateFilter/:id", requireAuth, updateFilter);
router.delete("/deleteFilter/:id", requireAuth, deleteFilter);
router.get("/filters", requireAuth, getAllFilters);
router.get("/filters/:subcategoryId", requireAuth, getFiltersBySubcategory);
//DASHBOARD
router.get("/dashboard/stats", requireAuth, getDashboardStats);

// Pin / Unpin image
router.put("/images/:id/pin", requireAuth, updateImagePinStatus);

module.exports = router;
