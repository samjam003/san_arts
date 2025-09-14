const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
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
} = require("../controllers/adminController");
const { upload, uploadMedia } = require("../config/cloudinary");

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

// Route for adding a post with image and optional video
router.post(
  "/addPost",
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
  uploadMedia.fields([
    { name: "img_url", maxCount: 1 },
    { name: "sub_images", maxCount: 10 },
  ]),
  updateImage
);

router.get("/images", getAllImages);
router.delete("/deleteImage/:id", deleteImage);
router.put(
  "/updateImage/:id",
  uploadMedia.fields([
    { name: "main_image", maxCount: 1 }, // Optional - only if updating main image
    { name: "sub_images", maxCount: 5 }, // Optional - sub images
    { name: "video", maxCount: 1 }, // Optional - video
  ]),
  updateImage
);
// MAIN-CATEGORY
router.post("/addMainCategory", addMainCategory);
router.put("/updateMainCategory/:id", updateMainCategory);
router.delete("/deleteMainCategory/:id", deleteMainCategory);
//SUB-CATEGORY
router.post("/addSubcategory", upload.single("image"), addSubcategory);
router.get("/subcategories", getAllSubcategories);
router.put(
  "/updateSubcategory/:id",
  upload.single("background_img"),
  updateSubcategory
);
router.delete("/deleteSubcategory/:id", deleteSubcategory);
//FILTERS
router.post("/addFilter", addFilter);
router.put("/updateFilter/:id", updateFilter);
router.delete("/deleteFilter/:id", deleteFilter);
router.get("/filters", getAllFilters);
router.get("/filters/:subcategoryId", getFiltersBySubcategory);
//DASHBOARD
router.get("/dashboard/stats", getDashboardStats);

module.exports = router;
