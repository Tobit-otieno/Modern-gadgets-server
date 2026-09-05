const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    author: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true },
    comment: { type: String, required: true, trim: true },
    // New customer-submitted reviews land as "pending" for the dashboard's
    // moderation queue; seeded/original reviews are inserted as "approved".
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    // Public store reply shown under the review on the product page.
    storeReply: { type: String, trim: true },
  },
  { timestamps: true }
);

// Recalculates the product's denormalized rating/reviewCount from its
// approved reviews. Called after any save/status change/delete.
reviewSchema.statics.recalculateProductRating = async function (productId) {
  const Product = mongoose.model("Product");
  const stats = await this.aggregate([
    { $match: { product: productId, status: "approved" } },
    { $group: { _id: "$product", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count,
    });
  } else {
    await Product.findByIdAndUpdate(productId, { rating: 0, reviewCount: 0 });
  }
};

reviewSchema.post("save", function () {
  this.constructor.recalculateProductRating(this.product);
});

reviewSchema.post("findOneAndUpdate", async function (doc) {
  if (doc) await doc.constructor.recalculateProductRating(doc.product);
});

reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) await doc.constructor.recalculateProductRating(doc.product);
});

module.exports = mongoose.model("Review", reviewSchema);
