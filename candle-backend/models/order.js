const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: Number },
    productName: { type: String },
    price: { type: Number },
    quantity: { type: Number },
    flavor: { type: String },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema({
  orderId: { type: String },
  name: { type: String },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  paymentMode: { type: String },
  paymentReference: { type: String },
  paymentVerified: { type: Boolean, default: false },
  cartItems: { type: [cartItemSchema], default: [] },
  totalAmount: { type: Number, default: 0 },
  orderDate: { type: Date, default: Date.now },
  courierName: { type: String },
  trackingId: { type: String },
  trackingEmailSentAt: { type: Date },
});

module.exports = mongoose.model('Order', orderSchema);