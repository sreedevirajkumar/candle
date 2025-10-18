const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    console.log("⚠️  Server will continue running without database connection");
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

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
