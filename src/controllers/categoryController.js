const slugify = require("slugify");
const Category = require("../models/Category");
const Product = require("../models/Product");
const asyncHandler = require("../middleware/asyncHandler");
const ApiError = require("../middleware/ApiError");

// @desc    Get all categories (with subcategories), ordered for the header/dropdowns
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.shoppable === "true") filter.isShoppable = true;

  const categories = await Category.find(filter).sort("order name");
  res.json({ success: true, count: categories.length, data: categories });
});

// @desc    Get a single category by slug, with its subcategories
// @route   GET /api/categories/:slug
// @access  Public
const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) throw new ApiError(404, "Category not found");
  res.json({ success: true, data: category });
});

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (!body.slug && body.name) body.slug = slugify(body.name, { lower: true });

  const category = await Category.create(body);
  res.status(201).json({ success: true, data: category });
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) throw new ApiError(404, "Category not found");
  res.json({ success: true, data: category });
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");

  const productCount = await Product.countDocuments({ category: category.slug });
  if (productCount > 0) {
    throw new ApiError(
      400,
      `Cannot delete category "${category.name}" — ${productCount} product(s) still reference it. Reassign or delete them first.`
    );
  }

  await category.deleteOne();
  res.json({ success: true, data: {} });
});

// @desc    Add a subcategory to a category
// @route   POST /api/categories/:id/subcategories
// @access  Private/Admin
const addSubcategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");

  const sub = { ...req.body };
  if (!sub.slug && sub.name) sub.slug = slugify(sub.name, { lower: true });

  category.subcategories.push(sub);
  await category.save();
  res.status(201).json({ success: true, data: category });
});

// @desc    Update a subcategory
// @route   PUT /api/categories/:id/subcategories/:subId
// @access  Private/Admin
const updateSubcategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");

  const sub = category.subcategories.id(req.params.subId);
  if (!sub) throw new ApiError(404, "Subcategory not found");

  Object.assign(sub, req.body);
  await category.save();
  res.json({ success: true, data: category });
});

// @desc    Delete a subcategory
// @route   DELETE /api/categories/:id/subcategories/:subId
// @access  Private/Admin
const deleteSubcategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");

  category.subcategories.pull(req.params.subId);
  await category.save();
  res.json({ success: true, data: category });
});

module.exports = {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  addSubcategory,
  updateSubcategory,
  deleteSubcategory,
};
