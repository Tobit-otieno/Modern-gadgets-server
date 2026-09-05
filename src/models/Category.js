const mongoose = require("mongoose");

const subcategorySchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    // Thumbnail used in the storefront's hover dropdown menus
    image: { type: String, trim: true },
  },
  { _id: true }
);

const categorySchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    headline: { type: String, trim: true },
    description: { type: String, trim: true },
    image: { type: String, trim: true },
    // "support" is not a shoppable/product category on the storefront
    isShoppable: { type: Boolean, default: true },
    // Controls display order in the header/dropdowns (dashboard drag-to-reorder)
    order: { type: Number, default: 0 },
    seo: {
      metaTitle: { type: String, trim: true },
      metaDescription: { type: String, trim: true },
    },
    subcategories: { type: [subcategorySchema], default: [] },
  },
  { timestamps: true }
);

categorySchema.index({ order: 1 });

module.exports = mongoose.model("Category", categorySchema);
