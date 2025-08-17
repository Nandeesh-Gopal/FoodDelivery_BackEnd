const mongo = require("mongoose");
const express = require("express");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();

const app = express();

// 🔐 Session
app.use(session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// 🌍 CORS
app.use(cors({
    origin: "http://localhost:3000", // React frontend
    credentials: true
}));
app.use(express.json());

// 🔗 MongoDB connection
mongo.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.log("❌ DB Error:", err));

// Routers
const hotelsRouter = require("./src/routes/hotels");  // ⬅️ route file
app.use("/api/hotels", hotelsRouter);

// 🛠 User Schema
const schema = new mongo.Schema({
    name: String,
    email: {
        type: String,
        unique: false
    },
    password: String
});

// 🛒 Order Schema
const schema2 = new mongo.Schema({
    userId: {
        type: mongo.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    userEmail: String,
    location: String,
    phoneNo: String,
    payment: String,
    items: [{
        name: String,
        quantity: Number,
        price: Number,
        total: Number
    }],
    totalAmount: Number,
    orderDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        default: 'pending'
    }
});

const Order_details = mongo.model('order_details', schema2);
const User = mongo.model('user', schema);

// 🔐 Middleware
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    return res.status(401).json({ message: "Please log in" });
}

// ================== AUTH ROUTES ==================

// Signup
app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }
        const temp = new User({ name, email, password });
        await temp.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error registering user" });
    }
});

// Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    req.session.userId = user._id;
    req.session.email = user.email;
    console.log("🔑 Session:", req.session);
    return res.status(200).json({ message: "Login success" });
});

// Logout
app.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: "Logout failed" });
        }
        res.json({ message: "Logged out successfully" });
    });
});

// Session check
app.get("/check-session", (req, res) => {
    if (req.session && req.session.userId) {
        return res.status(200).json({ active: true });
    } else {
        return res.status(200).json({ active: false });
    }
});

// Auth check
app.get("/checkAuth", isAuthenticated, (req, res) => {
    if (req.session && req.session.userId) {
        return res.status(200).json({ loggedIn: true });
    } else {
        return res.status(200).json({ loggedIn: false });
    }
});

// ================== ORDER ROUTES ==================

// Place order
app.post("/place-order", isAuthenticated, async (req, res) => {
    try {
        const { location, phoneNo, payment, items, total } = req.body;

        if (!location || !phoneNo || !payment || !items || items.length === 0) {
            return res.status(400).json({ message: "All fields required and cart must not be empty" });
        }

        const newOrder = new Order_details({
            userId: req.session.userId,
            userEmail: req.session.email,
            location,
            phoneNo,
            payment,
            items,
            totalAmount: total
        });

        await newOrder.save();
        console.log(`✅ Order placed for user: ${req.session.email}`);

        res.status(201).json({
            message: "Order placed successfully",
            orderId: newOrder._id
        });

    } catch (error) {
        console.error("❌ Error placing order:", error);
        res.status(500).json({ message: "Error placing order. Please try again." });
    }
});

// Get user orders
app.get("/orders", isAuthenticated, async (req, res) => {
    try {
        const orders = await Order_details.find({ userId: req.session.userId });
        res.status(200).json({ orders });
    } catch (error) {
        console.error("❌ Error fetching orders:", error);
        res.status(500).json({ message: "Error fetching orders" });
    }
});

// ================== SERVER START ==================
app.listen(5000, () => console.log("🚀 Server running on port 5000"));
