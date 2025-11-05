require("dotenv").config();

// Import dependencies
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Normalize and validate Mongo URI to avoid hidden characters causing DNS issues
const rawMongoUri = process.env.MONGO_URI || "";
const normalizedMongoUri = rawMongoUri
  .replace(/[\u200B-\u200D\uFEFF]/g, "") // zero-width chars
  .replace(/[\r\n\t]/g, "") // whitespace control chars
  .trim();

if (!normalizedMongoUri) {
  console.error("❌ MONGO_URI is missing. Please set it in .env");
}

console.log("🔍 Mongo URI (normalized):", normalizedMongoUri);

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug: Show if any suspicious leading/trailing characters exist
if (rawMongoUri !== normalizedMongoUri) {
  console.warn("⚠️ Detected and removed hidden/special characters from MONGO_URI");
}


mongoose
  .connect(normalizedMongoUri)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    console.log("⚠️ Server will continue running without database connection");
  });


const productRoutes = require("./routes/product");
const emailRoutes = require("./routes/email");
const orderRoutes = require("./routes/orderRoute");
const cartRoutes = require("./routes/cart");
const paymentRoutes = require("./routes/payment");


app.use("/api/products", productRoutes);
app.use("/api", emailRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payment", paymentRoutes);


app.get("/", (req, res) => {
  res.send("🕯️ Candle Store API Running");
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});