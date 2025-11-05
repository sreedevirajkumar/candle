require("dotenv").config();
const { sendOrderConfirmation, sendAdminNotification } = require("./EmailService");

async function testOutlookEmail() {
  console.log("🧪 Testing Outlook Email Configuration...\n");
  
  // Check environment variables
  console.log("📋 Environment Check:");
  console.log(`EMAIL_PROVIDER: ${process.env.EMAIL_PROVIDER || "❌ Not set"}`);
  console.log(`EMAIL_USER: ${process.env.EMAIL_USER || "❌ Not set"}`);
  console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? "✅ Set" : "❌ Not set"}`);
  console.log(`ADMIN_EMAIL: ${process.env.ADMIN_EMAIL || "❌ Not set"}\n`);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("❌ Please set EMAIL_USER and EMAIL_PASS in your .env file");
    return;
  }

  // Test data
  const testOrderData = {
    name: "Test Customer",
    email: "test@example.com",
    phone: "9876543210",
    address: "123 Test Street, Test City, 12345",
    orderId: `TEST-${Date.now()}`,
    cartItems: [
      {
        productName: "Vanilla Candle",
        flavor: "Vanilla",
        quantity: 2,
        price: 150,
      },
      {
        productName: "Lavender Candle", 
        flavor: "Lavender",
        quantity: 1,
        price: 200,
      }
    ],
    totalAmount: 500,
    paymentVerified: true,
    paymentReference: "TEST123456789",
  };

  try {
    console.log("📧 Sending test customer email...");
    const customerResult = await sendOrderConfirmation(testOrderData);
    console.log(`✅ Customer email: ${customerResult.message}\n`);

    console.log("📧 Sending test admin notification...");
    const adminResult = await sendAdminNotification(testOrderData);
    console.log(`✅ Admin email: ${adminResult.message}\n`);

    console.log("🎉 Outlook email test completed successfully!");
    console.log("📝 Check your email inboxes for the test emails");
    
  } catch (error) {
    console.error("❌ Email test failed:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Check your Outlook credentials in .env file");
    console.log("2. Make sure you're using an App Password (not regular password)");
    console.log("3. Verify 2FA is enabled on your Outlook account");
    console.log("4. Check if 'Less secure app access' is enabled");
  }
}

// Run the test
testOutlookEmail();
