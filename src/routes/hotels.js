const express = require("express");
const router = express.Router();
const Hotel = require("../models/hotel");

router.get("/", async (req, res) => {
  try {
    const hotels = await Hotel.find();
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id/menu", async (req, res) => {
  try {
    const hotelDoc = await Hotel.findOne({ _id: req.params.id }, "menu");
    if (!hotelDoc) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    res.json(hotelDoc.menu);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
