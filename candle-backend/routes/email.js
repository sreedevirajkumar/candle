const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
require("dotenv").config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// Configure transporter (using your Gmail App Password)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,  // your Gmail ID
    pass: process.env.EMAIL_PASS,  // your App Password
  },
});

// 📦 Send order confirmation email
router.post("/send-order-email", async (req, res) => {
  try {
    const { customerEmail, customerName, orderItems, totalAmount } = req.body;

    if (!customerEmail || !orderItems || !totalAmount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Format order details
    const orderList = orderItems
      .map(
        (item) => `
        <li>
          ${item.name} — ${item.quantity} × ₹${item.price} = ₹${item.quantity * item.price}
        </li>`
      )
      .join("");

    // Email to customer
    const customerMail = {
      from: `"Candle Store" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: "🕯️ Your Candle Store Order Confirmation",
      html: `
        <h2>Hi ${customerName || "Customer"},</h2>
        <p>Thank you for your order! Here are your order details:</p>
        <ul>${orderList}</ul>
        <h3>Total Amount: ₹${totalAmount}</h3>
        <p>We’ll notify you once your candles are shipped.</p>
        <p>– Candle Store Team</p>
      `,
    };

    // Email to admin
    const adminMail = {
      from: `"Candle Store Orders" <${process.env.EMAIL_USER}>`,
      to: ADMIN_EMAIL,
      subject: "📦 New Order Received!",
      html: `
        <h2>New Order Received</h2>
        <p><strong>Customer:</strong> ${customerName || "N/A"} (${customerEmail})</p>
        <ul>${orderList}</ul>
        <h3>Total: ₹${totalAmount}</h3>
      `,
    };

    // Send both emails
    await transporter.sendMail(customerMail);
    await transporter.sendMail(adminMail);

    res.status(200).json({ message: "Emails sent successfully!" });
  } catch (err) {
    console.error("❌ Email sending failed:", err.message);
    res.status(500).json({ message: "Error sending email", error: err.message });
  }
});

module.exports = router;

