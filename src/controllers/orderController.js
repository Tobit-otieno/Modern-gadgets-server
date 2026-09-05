const Order = require("../models/Order");
const Product = require("../models/Product");
const asyncHandler = require("../middleware/asyncHandler");
const ApiError = require("../middleware/ApiError");

const generateOrderNumber = () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${datePart}-${randomPart}`;
};

// @desc    Place an order from the storefront checkout
// @route   POST /api/orders
// @access  Public
const createOrder = asyncHandler(async (req, res) => {
  const {
    customer,
    items,
    deliveryFee = 0,
    paymentMethod,
    deliveryMethod = "delivery",
    customerNotes,
  } = req.body;

  if (!customer || !items || items.length === 0) {
    throw new ApiError(400, "customer details and at least one item are required");
  }

  if (deliveryMethod === "delivery" && (!customer.address || !customer.city)) {
    throw new ApiError(400, "address and city are required for delivery orders");
  }

  // Re-price every item from the database rather than trusting the client,
  // and confirm stock is actually available before the order is accepted.
  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) throw new ApiError(404, `Product ${item.product} not found`);
    if (product.stockQuantity < item.quantity) {
      throw new ApiError(400, `${product.name} does not have enough stock`);
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      slug: product.slug,
      image: product.images?.[0],
      color: item.color,
      price: product.price,
      quantity: item.quantity,
    });
    subtotal += product.price * item.quantity;
  }

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    customer,
    deliveryMethod,
    items: orderItems,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    paymentMethod,
    customerNotes,
  });

  // Decrement stock now that the order is confirmed.
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stockQuantity: -item.quantity } });
  }

  res.status(201).json({ success: true, data: order });
});

// @desc    List orders — supports ?status=pending
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.email) filter["customer.email"] = req.query.email;

  const orders = await Order.find(filter).sort("-createdAt");
  res.json({ success: true, count: orders.length, data: orders });
});

// @desc    Get a single order
// @route   GET /api/orders/:id
// @access  Private/Admin (or the customer who placed it, once auth is added)
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");
  res.json({ success: true, data: order });
});

// @desc    Update order status / payment status / internal notes
// @route   PATCH /api/orders/:id
// @access  Private/Admin
const updateOrder = asyncHandler(async (req, res) => {
  const allowedUpdates = {};
  if (req.body.status) allowedUpdates.status = req.body.status;
  if (req.body.paymentStatus) allowedUpdates.paymentStatus = req.body.paymentStatus;
  if (req.body.internalNotes !== undefined) allowedUpdates.internalNotes = req.body.internalNotes;

  const order = await Order.findByIdAndUpdate(req.params.id, allowedUpdates, {
    new: true,
    runValidators: true,
  });
  if (!order) throw new ApiError(404, "Order not found");

  res.json({ success: true, data: order });
});

module.exports = { createOrder, getOrders, getOrder, updateOrder };