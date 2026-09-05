const Review = require("../models/Review");
const asyncHandler = require("../middleware/asyncHandler");
const ApiError = require("../middleware/ApiError");

// @desc    Get all reviews across the site — supports ?status=pending&rating=5
// @route   GET /api/reviews
// @access  Private/Admin (dashboard moderation queue)
const getReviews = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.rating) filter.rating = Number(req.query.rating);
  if (req.query.product) filter.product = req.query.product;

  const reviews = await Review.find(filter).populate("product", "name slug images").sort("-createdAt");
  res.json({ success: true, count: reviews.length, data: reviews });
});

// @desc    Approve, reject, or reply to a review
// @route   PATCH /api/reviews/:id
// @access  Private/Admin
const updateReview = asyncHandler(async (req, res) => {
  const allowedUpdates = {};
  if (req.body.status) allowedUpdates.status = req.body.status;
  if (req.body.storeReply !== undefined) allowedUpdates.storeReply = req.body.storeReply;

  const review = await Review.findByIdAndUpdate(req.params.id, allowedUpdates, {
    new: true,
    runValidators: true,
  });
  if (!review) throw new ApiError(404, "Review not found");

  res.json({ success: true, data: review });
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) throw new ApiError(404, "Review not found");
  res.json({ success: true, data: {} });
});

module.exports = { getReviews, updateReview, deleteReview };
