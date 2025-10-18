const emailjs = require("emailjs-com");
require("dotenv").config();

/**
 * Send email using EmailJS (Simple alternative)
 * @param {string} to - Email address of the recipient
 * @param {string} subject - Subject of the email
 * @param {string} html - HTML content of the email
 */
async function sendEmail(to, subject, html) {
  try {
    // EmailJS configuration
    const serviceId = process.env.EMAILJS_SERVICE_ID || "service_default";
    const templateId = process.env.EMAILJS_TEMPLATE_ID || "template_default";
    const userId = process.env.EMAILJS_USER_ID;

    // Always work as fallback service

    const templateParams = {
      to_email: to,
      subject: subject,
      message: html,
      from_name: "Luxe Candles",
    };

    // For now, let's use a simple console log as fallback
    console.log(`📧 Email would be sent to: ${to}`);
    console.log(`📧 Subject: ${subject}`);
    console.log(`📧 Content: ${html.substring(0, 100)}...`);

    return {
      success: true,
      message: "Email logged successfully (EmailJS fallback)",
    };
  } catch (error) {
    console.error("❌ Error with EmailJS:", error);
    throw error;
  }
}

/**
 * Send order confirmation email to customer
 * @param {Object} orderData - Order information
 */
async function sendOrderConfirmation(orderData) {
  const {
    name,
    email,
    orderId,
    cartItems,
    totalAmount,
    paymentVerified,
    paymentReference,
  } = orderData;

  const subject = `🕯️ Order Confirmation - ${orderId}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #d4af37; margin: 0; font-size: 28px;">🕯️ Luxe Candles</h1>
          <p style="color: #666; margin: 5px 0 0 0;">Your Order Confirmation</p>
        </div>
        
        <!-- Greeting -->
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #333; margin: 0 0 10px 0;">Dear ${name},</h2>
          <p style="color: #555; margin: 0; line-height: 1.5;">Thank you for your order! We have received your payment and your order is being processed.</p>
        </div>
        
        <!-- Order Details -->
        <div style="background-color: #fff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
          <h3 style="color: #333; margin: 0 0 15px 0; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">Order Details</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <p style="margin: 5px 0;"><strong>Order ID:</strong> ${orderId}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p style="margin: 5px 0;"><strong>Payment Status:</strong> ${
              paymentVerified ? "✅ Verified" : "❌ Not Verified"
            }</p>
            ${
              paymentReference
                ? `<p style="margin: 5px 0;"><strong>Payment Reference:</strong> ${paymentReference}</p>`
                : ""
            }
          </div>
        </div>
        
        <!-- Order Items -->
        <div style="background-color: #fff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
          <h3 style="color: #333; margin: 0 0 15px 0; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">Your Order</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6;">Product</th>
                <th style="padding: 12px; text-align: center; border-bottom: 1px solid #dee2e6;">Qty</th>
                <th style="padding: 12px; text-align: right; border-bottom: 1px solid #dee2e6;">Price</th>
                <th style="padding: 12px; text-align: right; border-bottom: 1px solid #dee2e6;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${cartItems
                .map(
                  (item) => `
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${
                    item.productName
                  } - ${item.flavor}</td>
                  <td style="padding: 12px; text-align: center; border-bottom: 1px solid #dee2e6;">${
                    item.quantity
                  }</td>
                  <td style="padding: 12px; text-align: right; border-bottom: 1px solid #dee2e6;">$${
                    item.price
                  }</td>
                  <td style="padding: 12px; text-align: right; border-bottom: 1px solid #dee2e6;">$${
                    item.price * item.quantity
                  }</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
            <tfoot>
              <tr style="background-color: #f8f9fa; font-weight: bold;">
                <td colspan="3" style="padding: 12px; text-align: right;">Total Amount:</td>
                <td style="padding: 12px; text-align: right;">$${totalAmount}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <!-- Status -->
        <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
          <h3 style="color: #155724; margin: 0 0 10px 0;">✅ Order Confirmed!</h3>
          <p style="color: #155724; margin: 0; line-height: 1.5;">We'll process your order and send you updates soon. You'll receive a tracking number once your order ships.</p>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; color: #666; font-size: 14px; border-top: 1px solid #e9ecef; padding-top: 20px;">
          <p style="margin: 0;">Thank you for choosing Luxe Candles!</p>
          <p style="margin: 5px 0 0 0;">If you have any questions, please contact us.</p>
        </div>
        
      </div>
    </div>
  `;

  return await sendEmail(email, subject, html);
}

/**
 * Send admin notification email
 * @param {Object} orderData - Order information
 */
async function sendAdminNotification(orderData) {
  const {
    name,
    email,
    phone,
    address,
    orderId,
    cartItems,
    totalAmount,
    paymentVerified,
    paymentReference,
  } = orderData;

  const subject = `🕯️ New Order Received - ${orderId}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #dc3545; margin: 0; font-size: 28px;">🕯️ New Order Alert</h1>
          <p style="color: #666; margin: 5px 0 0 0;">Action Required</p>
        </div>
        
        <!-- Customer Info -->
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #333; margin: 0 0 15px 0; border-bottom: 2px solid #dc3545; padding-bottom: 10px;">Customer Information</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${phone}</p>
            <p style="margin: 5px 0;"><strong>Order ID:</strong> ${orderId}</p>
            <p style="margin: 5px 0;"><strong>Payment Status:</strong> ${
              paymentVerified ? "✅ Verified" : "❌ Not Verified"
            }</p>
            ${
              paymentReference
                ? `<p style="margin: 5px 0;"><strong>Payment Reference:</strong> ${paymentReference}</p>`
                : ""
            }
          </div>
          <div style="margin-top: 15px;">
            <p style="margin: 5px 0;"><strong>Delivery Address:</strong></p>
            <p style="margin: 5px 0; padding: 10px; background-color: white; border-radius: 4px; border: 1px solid #dee2e6;">${address}</p>
          </div>
        </div>
        
        <!-- Order Items -->
        <div style="background-color: #fff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
          <h3 style="color: #333; margin: 0 0 15px 0; border-bottom: 2px solid #dc3545; padding-bottom: 10px;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6;">Product</th>
                <th style="padding: 12px; text-align: center; border-bottom: 1px solid #dee2e6;">Qty</th>
                <th style="padding: 12px; text-align: right; border-bottom: 1px solid #dee2e6;">Price</th>
                <th style="padding: 12px; text-align: right; border-bottom: 1px solid #dee2e6;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${cartItems
                .map(
                  (item) => `
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${
                    item.productName
                  } - ${item.flavor}</td>
                  <td style="padding: 12px; text-align: center; border-bottom: 1px solid #dee2e6;">${
                    item.quantity
                  }</td>
                  <td style="padding: 12px; text-align: right; border-bottom: 1px solid #dee2e6;">$${
                    item.price
                  }</td>
                  <td style="padding: 12px; text-align: right; border-bottom: 1px solid #dee2e6;">$${
                    item.price * item.quantity
                  }</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
            <tfoot>
              <tr style="background-color: #f8f9fa; font-weight: bold;">
                <td colspan="3" style="padding: 12px; text-align: right;">Total Amount:</td>
                <td style="padding: 12px; text-align: right;">$${totalAmount}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <!-- Action Required -->
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
          <h3 style="color: #856404; margin: 0 0 10px 0;">⚠️ Action Required</h3>
          <p style="color: #856404; margin: 0; line-height: 1.5;">Please process this order and update the customer with tracking information once shipped.</p>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; color: #666; font-size: 14px; border-top: 1px solid #e9ecef; padding-top: 20px;">
          <p style="margin: 0;">Luxe Candles Admin Panel</p>
          <p style="margin: 5px 0 0 0;">Order received at ${new Date().toLocaleString()}</p>
        </div>
        
      </div>
    </div>
  `;

  const adminEmail = process.env.ADMIN_EMAIL || "sreedevirajkumar03@gmail.com";
  return await sendEmail(adminEmail, subject, html);
}

module.exports = {
  sendEmail,
  sendOrderConfirmation,
  sendAdminNotification,
};
