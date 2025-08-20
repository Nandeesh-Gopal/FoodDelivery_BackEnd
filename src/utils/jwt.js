const jwt = require("jsonwebtoken");

const secret = process.env.JWT_SECRET || "mysecretkey"; // keep this in .env

function generateToken(user) {
    return jwt.sign(
        { id: user._id, email: user.email },
        secret,
        { expiresIn: "1h" }
    );
}

function verifyToken(token) {
    return jwt.verify(token, secret);
}

module.exports = { generateToken, verifyToken };
