const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");
const Hotel = require("../models/hotel");

router.post("/add", async (req, res) => {
  try {
    const { name, location } = req.body;
    if (!name || !location) {
      return res.status(400).json({ message: "Name and location are required" });
    }

    const newHotel = new Hotel({ name, location });
    await newHotel.save();

    res.json({ message: "Hotel added successfully!", hotel: newHotel });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding hotel" });
  }
});

router.get("/", async (req, res) => {
  try {
    const hotels = await Hotel.find();
    res.json(hotels);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching hotels" });
  }
});
router.get("/:hotelid/menu", async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.hotelid);

    if (!hotel) {
      return res.status(404).json({ error: "Hotel not found" });
    }

    res.json(hotel.menu);
  } catch (err) {
    res.status(500).json({ error: "Error fetching menu" });
  }
});


module.exports = router;
