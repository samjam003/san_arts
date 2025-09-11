const express = require("express");
const router = express.Router();
const {
  getAllMainCategories,
  getAllSubCategories,
  getFiltersBySubCategory,
  getImagesBySubcategory,
  getFilteredImages,
  getArtworkById,
  toggleLike,
} = require("../controllers/galleryController");

//routes

router.get("/", (req, res) => {
  res.status(200).json({ message: "Gallery API is working!" })
});
router.get("/getAllMainCategories", getAllMainCategories);
router.get("/:categoryId/getAllSubCategories", getAllSubCategories);
router.get("/:subCategoryId/getFilters", getFiltersBySubCategory);
router.get("/:subCategoryId/getImages", getImagesBySubcategory);
router.post("/filter", getFilteredImages);
router.get("/artwork/:artworkId", getArtworkById);
router.post("/artwork/:artworkID/like", toggleLike);

module.exports = router;
