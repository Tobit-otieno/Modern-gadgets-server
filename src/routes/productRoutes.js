const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductBySlug,
  getRelatedProducts,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getBrands,
  addReview,
} = require("../controllers/productController");

// TODO: once auth is added, protect the write routes below with an
// admin-only middleware (e.g. router.post("/", protect, admin, createProduct)).

router.route("/").get(getProducts).post(createProduct);

// Specific, fixed-path routes must come before the "/:slug" catch-all below.
router.get("/featured", getFeaturedProducts);
router.get("/brands", getBrands);

router.route("/id/:id").put(updateProduct).delete(deleteProduct);

router.get("/:slug", getProductBySlug);
router.get("/:slug/related", getRelatedProducts);
router.post("/:slug/reviews", addReview);

module.exports = router;
