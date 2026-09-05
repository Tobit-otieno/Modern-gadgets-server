const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    image: { type: String },
    color: { type: String },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      // Not required at the schema level — a pickup order has no delivery
      // address. createOrder in the controller enforces it when needed.
      address: { type: String, trim: true },
      city: { type: String, trim: true },
    },
    // Matches the storefront checkout's "Delivery" vs "Shop Pickup" choice.
    deliveryMethod: { type: String, enum: ["delivery", "pickup"], default: "delivery" },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentStatus: { type: String, enum: ["unpaid", "paid", "failed"], default: "unpaid" },
    paymentMethod: { type: String, default: "cash_on_delivery" },
    // Customer-facing note submitted at checkout (e.g. "leave with the guard").
    customerNotes: { type: String, trim: true },
    // Internal-only note field for the admin dashboard, never shown to the customer.
    internalNotes: { type: String, trim: true },
  },
  { timestamps: true }
);

orderSchema.index({ status: 1 });
orderSchema.index({ "customer.email": 1 });

module.exports = mongoose.model("Order", orderSchema);