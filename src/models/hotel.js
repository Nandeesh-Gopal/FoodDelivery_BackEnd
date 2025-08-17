const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  _id: String,   // 👈 add this so menu IDs also stay fixed
  itemname: String,
  description: String,
  price: Number,
  image: String
});

const hotelSchema = new mongoose.Schema({
  _id: String,   // 👈 force hotel ID to be String
  name: String,
  image: String,
  menu: [menuSchema]
}, { _id: false }); // 👈 prevents Mongoose from adding its own _id

module.exports = mongoose.model("Hotel", hotelSchema);
