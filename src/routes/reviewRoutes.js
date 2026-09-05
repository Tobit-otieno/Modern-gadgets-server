const express = require("express");
const router = express.Router();
const { getReviews, updateReview, deleteReview } = require("../controllers/reviewController");

// TODO: protect all of these with admin-only auth once login is wired up.
// Customers submit reviews via POST /api/products/:slug/reviews instead.

router.get("/", getReviews);
router.route("/:id").patch(updateReview).delete(deleteReview);

module.exports = router;
