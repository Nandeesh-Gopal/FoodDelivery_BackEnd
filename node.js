const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");  // ✅ added

dotenv.config();

const app = express();
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());        // ✅ added

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/hotels", require("./src/routes/hotels"));
app.use("/api/orders", require("./src/routes/order"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
