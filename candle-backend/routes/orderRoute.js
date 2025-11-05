const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const { sendOrderConfirmation, sendAdminNotification, sendEmail } = require('../EmailService');

function generateOrderId() {
  return `ORD-${Date.now()}`;
}

router.post('/', async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      address,
      paymentMode,
      paymentReference,
      paymentVerified,
      cartItems = [],
      totalAmount = 0,
      orderDate,
    } = req.body;

    if (!name || !phone || !email || !address || !paymentMode) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const orderId = generateOrderId();

    const newOrder = new Order({
      orderId,
      name,
      phone,
      email,
      address,
      paymentMode,
      paymentReference,
      paymentVerified: Boolean(paymentVerified),
      cartItems,
      totalAmount,
      orderDate: orderDate ? new Date(orderDate) : new Date(),
    });

    await newOrder.save().catch(() => {});

    const orderData = {
      name,
      email,
      phone,
      address,
      orderId,
      cartItems,
      totalAmount,
      paymentVerified: Boolean(paymentVerified),
      paymentReference,
    };

    // Fire-and-forget emails; do not block response
    sendOrderConfirmation(orderData).catch(() => {});
    sendAdminNotification(orderData).catch(() => {});

    return res.status(200).json({
      message: 'Order received and emails scheduled',
      orderId,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// List all orders (newest first)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ orderDate: -1 }).lean();
    res.status(200).json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
});

// Save tracking and send tracking email
router.post('/:orderId/tracking', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { courierName, trackingId } = req.body;

    if (!courierName || !trackingId) {
      return res.status(400).json({ message: 'courierName and trackingId are required' });
    }

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.courierName = courierName;
    order.trackingId = trackingId;
    order.trackingEmailSentAt = new Date();
    await order.save();

    const trackingUrl = `https://www.google.com/search?q=${encodeURIComponent(courierName + ' ' + trackingId)}`;
    const subject = `🚚 Your order ${order.orderId} has shipped`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color:#333;">Good news, ${order.name}!</h2>
        <p>Your order <strong>${order.orderId}</strong> is on its way.</p>
        <p><strong>Courier:</strong> ${courierName}</p>
        <p><strong>Tracking ID:</strong> ${trackingId}</p>
        <p>You can track your shipment here:
          <a href="${trackingUrl}" target="_blank" rel="noopener noreferrer">Track Package</a>
        </p>
        <hr />
        <p style="color:#666; font-size:13px;">If the link doesn’t work, copy and paste this ID on ${courierName} website.</p>
      </div>
    `;

    await sendEmail(order.email, subject, html);

    res.status(200).json({ message: 'Tracking saved and email sent' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send tracking email', error: err.message });
  }
});

module.exports = router;