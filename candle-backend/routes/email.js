const express = require("express");
const { sendOrderConfirmation, sendAdminNotification } = require("../EmailJS");
const router = express.Router();

router.post("/order", async (req, res) => {
  const {
    name,
    email,
    phone,
    address,
    paymentMode,
    cartItems,
    totalAmount,
    orderDate,
    paymentVerified,
    paymentReference,
  } = req.body;

  if (!name || !email || !phone || !address || !paymentMode) {
    return res.status(400).json({ message: "❌ Missing required fields" });
  }

  // Generate order ID
  const orderId = `ORD-${Date.now()}`;

  // Create cart items HTML
  let cartItemsHtml = "";
  if (cartItems && cartItems.length > 0) {
    cartItemsHtml = `
      <h3>Order Items:</h3>
      <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f5f5f5;">
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Product</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Flavor</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Quantity</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Price</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${cartItems
            .map(
              (item) => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${
                item.productName
              }</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${
                item.flavor
              }</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${
                item.quantity
              }</td>
              <td style="border: 1px solid #ddd; padding: 8px;">₹${
                item.price
              }</td>
              <td style="border: 1px solid #ddd; padding: 8px;">₹${
                item.price * item.quantity
              }</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      <p><strong>Total Amount: ₹${totalAmount || 0}</strong></p>
    `;
  }

  // Customer Email Template
  const customerEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">🕯️ Order Confirmation - ${orderId}</h2>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #555;">Dear ${name},</h3>
        <p>Thank you for your order! We have received your payment and your order is being processed.</p>
        
        <h3 style="color: #555;">Order Details</h3>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Order Date:</strong> ${
          orderDate
            ? new Date(orderDate).toLocaleString()
            : new Date().toLocaleString()
        }</p>
        <p><strong>Payment Mode:</strong> ${paymentMode}</p>
        <p><strong>Payment Status:</strong> ${
          paymentVerified ? "✅ Verified" : "❌ Not Verified"
        }</p>
        ${
          paymentReference
            ? `<p><strong>Payment Reference:</strong> ${paymentReference}</p>`
            : ""
        }
      </div>
      
      ${cartItemsHtml}
      
      <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #2d5a2d;"><strong>✅ Order confirmed!</strong></p>
        <p style="margin: 5px 0 0 0; color: #2d5a2d;">We'll process your order and send you updates soon.</p>
      </div>
      
      <div style="background-color: #f0f8ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4 style="color: #0066cc;">Contact Information</h4>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Delivery Address:</strong> ${address}</p>
      </div>
    </div>
  `;

  // Admin Email Template
  const adminEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">🕯️ New Order Received - ${orderId}</h2>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #555;">Customer Information</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Address:</strong> ${address}</p>
        <p><strong>Payment Mode:</strong> ${paymentMode}</p>
        <p><strong>Payment Status:</strong> ${
          paymentVerified ? "✅ Verified" : "❌ Not Verified"
        }</p>
        ${
          paymentReference
            ? `<p><strong>Payment Reference:</strong> ${paymentReference}</p>`
            : ""
        }
        <p><strong>Order Date:</strong> ${
          orderDate
            ? new Date(orderDate).toLocaleString()
            : new Date().toLocaleString()
        }</p>
      </div>
      
      ${cartItemsHtml}
      
      <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #856404;"><strong>⚠️ Action Required</strong></p>
        <p style="margin: 5px 0 0 0; color: #856404;">Please process this order and update the customer.</p>
      </div>
    </div>
  `;

  // Email service is always available (uses fallback logging)
  console.log("📧 Using EmailJS fallback service - Order received and logged");

  try {
    // Prepare order data for email service
    const orderData = {
      name,
      email,
      phone,
      address,
      orderId,
      cartItems,
      totalAmount,
      paymentVerified,
      paymentReference,
    };

    // Send email to customer
    await sendOrderConfirmation(orderData);

    // Send email to admin
    await sendAdminNotification(orderData);

    res.status(200).json({
      message: "✅ Order emails sent successfully",
      orderId: orderId,
    });
  } catch (error) {
    console.error("Email error:", error.message);
    res.status(200).json({
      message: "✅ Order received successfully (email failed to send)",
      orderId: orderId,
    });
  }
});

// Test email endpoint
router.post("/test", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "❌ Email address is required" });
  }

  // EmailJS fallback service is always available

  try {
    // Test with sample order data
    const testOrderData = {
      name: "Test Customer",
      email: email,
      phone: "9876543210",
      address: "Test Address, Test City",
      orderId: `TEST-${Date.now()}`,
      cartItems: [
        {
          productName: "Test Candle",
          flavor: "Vanilla",
          quantity: 1,
          price: 150,
        },
      ],
      totalAmount: 150,
      paymentVerified: true,
      paymentReference: "TEST123456789",
    };

    await sendOrderConfirmation(testOrderData);

    res.status(200).json({
      message: "✅ Test email sent successfully",
      sentTo: email,
    });
  } catch (error) {
    console.error("Test email error:", error.message);
    res.status(500).json({
      message: "❌ Failed to send test email",
      error: error.message,
    });
  }
});

module.exports = router;
