const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  addMainCategory,
  addImage,
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
const { upload } = require("../config/cloudinary");

// router.post("/addImage", upload.single("image"), addImage);
router.post(
  "/addImage",
  upload.fields([
    { name: "main_image", maxCount: 1 },
    { name: "sub_images", maxCount: 10 },
  ]),
  addImage
);

router.post("/addMainCategory", addMainCategory);
router.post("/addSubcategory", upload.single("image"), addSubcategory);
router.post("/addFilter", addFilter);
router.put("/updateMainCategory/:id", updateMainCategory);
router.delete("/deleteMainCategory/:id", deleteMainCategory);
router.put("/updateSubcategory/:id", upload.single("image"), updateSubcategory);
router.delete("/deleteSubcategory/:id", deleteSubcategory);
router.get("/subcategories", getAllSubcategories);
router.put("/updateFilter/:id", updateFilter);
router.delete("/deleteFilter/:id", deleteFilter);
router.get("/filters", getAllFilters);
router.get("/filters/:subcategoryId", getFiltersBySubcategory);
router.get("/images", getAllImages);
router.put("/updateImage/:id", upload.single("image"), updateImage);
router.delete("/deleteImage/:id", deleteImage);
router.get("/dashboard/stats", getDashboardStats);

module.exports = router;
