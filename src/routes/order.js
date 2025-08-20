const router = require("express").Router();
const Order = require("../models/Order");
const verifyToken = require("../middleware/auth");

// Place a new order
router.post("/place-order", verifyToken, async (req, res) => {
  try {
    const { items, total, location, phoneNo, payment } = req.body;

    if (!items || !total || !location || !phoneNo || !payment) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newOrder = new Order({
      userId: req.user.id,
      items,
      total,
      location,
      phoneNo,
      payment
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({ message: "Order placed successfully", order: savedOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all orders for logged-in user
router.get("/my-orders", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
