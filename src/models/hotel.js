const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  _id: String,
  itemname: String,
  description: String,
  price: Number,
  image: String
});

const hotelSchema = new mongoose.Schema({
  _id: String,
  name: String,
  image: String,
  menu: [menuSchema]
}, { _id: false });

module.exports = mongoose.model("Hotel", hotelSchema);
