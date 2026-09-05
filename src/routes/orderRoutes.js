const express = require("express");
const router = express.Router();
const { createOrder, getOrders, getOrder, updateOrder } = require("../controllers/orderController");

// TODO: protect getOrders/getOrder/updateOrder with admin-only auth once login is wired up.

router.route("/").get(getOrders).post(createOrder);
router.route("/:id").get(getOrder).patch(updateOrder);

module.exports = router;
