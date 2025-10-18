const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  address: String,
  paymentMode: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);