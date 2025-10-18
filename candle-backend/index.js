const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB connection error:", err));

const productRoutes = require('./routes/product');
const emailRoutes = require('./routes/email');          
const orderRoutes = require('./routes/orderRoute');    
app.use('/api/products', productRoutes);
app.use('/api', emailRoutes);
app.use('/api/order', orderRoutes);

app.get('/', (req, res) => {
  res.send('🕯️ Candle Store API Running');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});