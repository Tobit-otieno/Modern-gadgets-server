const express = require("express");
const router = express.Router();
const {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  addSubcategory,
  updateSubcategory,
  deleteSubcategory,
  reorderSubcategories,
} = require("../controllers/categoryController");

// TODO: once auth is added, protect the write routes below with an
// admin-only middleware (e.g. router.post("/", protect, admin, createCategory)).

router.route("/").get(getCategories).post(createCategory);

// Public storefront looks categories up by slug (e.g. /api/categories/audio)
router.get("/:slug", getCategoryBySlug);

// Admin dashboard mutates by Mongo _id
router.route("/id/:id").put(updateCategory).delete(deleteCategory);

router.post("/id/:id/subcategories", addSubcategory);
router.route("/id/:id/subcategories/:subId").put(updateSubcategory).delete(deleteSubcategory);
router.put("/id/:id/subcategories/reorder", reorderSubcategories);
module.exports = router;
