const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");  

dotenv.config();

const app = express();
app.use(cors({
  origin: "http://localhost:3000", // frontend URL
  credentials: true                // allow cookies
}));
app.use(express.json());
app.use(cookieParser());

// MongoDB Atlas Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Routes
app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/hotels", require("./src/routes/hotels"));
app.use("/api/orders", require("./src/routes/order")); // ✅ clean

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
