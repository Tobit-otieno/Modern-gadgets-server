const mongoose = require("mongoose");

const colorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    hex: { type: String, trim: true },
    image: { type: String, trim: true },
  },
  { _id: false }
);

const specSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    // Store category/subcategory as slugs so they map straight onto Category.slug
    // and Category.subcategories[].slug without needing populate on the storefront.
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    images: { type: [String], default: [] },
    colors: { type: [colorSchema], default: [] },
    shortDescription: { type: String, trim: true },
    description: { type: String, trim: true },
    specs: { type: [specSchema], default: [] },

    // Inventory
    stockQuantity: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    inStock: { type: Boolean, default: true },

    // Denormalized rating fields, kept in sync by the Review model
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },

    // "hot" | "new" | "sale" style tags used across the storefront
    tags: { type: [String], default: [] },
    // Surfaces the product in the hero/Hot & New sections from the dashboard
    featured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "draft", "archived"],
      default: "active",
    },
    sku: { type: String, required: true, unique: true, trim: true, uppercase: true },

    seo: {
      metaTitle: { type: String, trim: true },
      metaDescription: { type: String, trim: true },
    },
  },
  { timestamps: true }
);

// Keep inStock in sync with stockQuantity whenever a document is saved directly.
productSchema.pre("save", function (next) {
  this.inStock = this.stockQuantity > 0;
  next();
});

// Text index for the storefront/dashboard search bars.
productSchema.index(
  { name: "text", brand: "text", shortDescription: "text", description: "text" },
  { weights: { name: 5, brand: 3, shortDescription: 2, description: 1 } }
);
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ tags: 1 });

module.exports = mongoose.model("Product", productSchema);
