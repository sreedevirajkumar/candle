require("dotenv").config();
const mongoose = require("mongoose");

const uri = process.env.MONGO_URI;

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");
    mongoose.connection.close(); // optional: close after test
  })
  .catch((err) => {
    console.error("❌ Connection failed:", err.message);
  });