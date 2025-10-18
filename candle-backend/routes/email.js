const express = require('express');
const sendEmail = require('./sendEmail');
const router = express.Router();

router.post('/order', async (req, res) => {
  const { name, email, phone, address, paymentMode } = req.body;

  if (!name || !email || !phone || !address || !paymentMode) {
    return res.status(400).json({ message: '❌ Missing required fields' });
  }

  const html = `
    <h2>New Order from ${name}</h2>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Address:</strong> ${address}</p>
    <p><strong>Payment Mode:</strong> ${paymentMode}</p>
  `;

  try {
    await sendEmail([process.env.ADMIN_EMAIL, email], "🕯️ New Candle Order", html);
    res.status(200).json({ message: "✅ Order email sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "❌ Failed to send email" });
  }
});

module.exports = router;