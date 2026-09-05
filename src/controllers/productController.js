const slugify = require("slugify");
const Product = require("../models/Product");
const Review = require("../models/Review");
const APIFeatures = require("../utils/APIFeatures");
const asyncHandler = require("../middleware/asyncHandler");
const ApiError = require("../middleware/ApiError");

// @desc    Get products — supports ?category=&subcategory=&brand=&minPrice=&maxPrice=
//          &tags=&inStock=&search=&sort=&page=&limit=
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  // Public storefront requests should only ever see live products.
  const baseFilter = req.query.includeAll === "true" ? {} : { status: "active" };

  const features = new APIFeatures(Product.find(baseFilter), req.query).filter().search().sort();
  await features.paginate();

  const products = await features.query;

  res.json({
    success: true,
    count: products.length,
    pagination: features.pagination,
    data: products,
  });
});

// @desc    Get a single product by slug
// @route   GET /api/products/:slug
// @access  Public
const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) throw new ApiError(404, "Product not found");

  const reviews = await Review.find({ product: product._id, status: "approved" }).sort("-createdAt");

  res.json({ success: true, data: { ...product.toObject(), reviews } });
});

// @desc    Get related products from the same category, excluding the current product
// @route   GET /api/products/:slug/related
// @access  Public
const getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) throw new ApiError(404, "Product not found");

  const limit = Number(req.query.limit) || 4;
  const related = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
    status: "active",
  })
    .limit(limit)
    .sort("-rating");

  res.json({ success: true, data: related });
});

// @desc    Get featured products (for the homepage hero / Hot & New section)
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 8;
  const products = await Product.find({ featured: true, status: "active" }).limit(limit);
  res.json({ success: true, count: products.length, data: products });
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (!body.slug && body.name) body.slug = slugify(body.name, { lower: true });

  const product = await Product.create(body);
  res.status(201).json({ success: true, data: product });
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  Object.assign(product, req.body);
  await product.save(); // triggers the inStock pre-save sync
  res.json({ success: true, data: product });
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  await product.deleteOne();
  await Review.deleteMany({ product: product._id });

  res.json({ success: true, data: {} });
});

// @desc    List of distinct brands, for the storefront/dashboard brand filter
// @route   GET /api/products/brands
// @access  Public
const getBrands = asyncHandler(async (req, res) => {
  const brands = await Product.distinct("brand", { status: "active" });
  res.json({ success: true, data: brands.sort() });
});

// @desc    Submit a new review for a product (goes to the dashboard's moderation queue)
// @route   POST /api/products/:slug/reviews
// @access  Public
const addReview = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) throw new ApiError(404, "Product not found");

  const { author, email, rating, title, comment } = req.body;
  if (!author || !rating || !comment) {
    throw new ApiError(400, "author, rating and comment are required");
  }

  const review = await Review.create({
    product: product._id,
    author,
    email,
    rating,
    title,
    comment,
    status: "pending",
  });

  res.status(201).json({
    success: true,
    message: "Thanks for your review — it will appear once approved.",
    data: review,
  });
});

module.exports = {
  getProducts,
  getProductBySlug,
  getRelatedProducts,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getBrands,
  addReview,
};
