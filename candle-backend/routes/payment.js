const express = require("express");
const router = express.Router();

// In-memory storage for payment references (in production, use a database)
const paymentReferences = new Map();
const pendingPayments = new Map(); // Track payments waiting for verification

// Generate a payment reference for testing
const generatePaymentReference = () => {
  return `PAY${Date.now().toString().slice(-8)}`;
};

// Generate a unique order ID for tracking
const generateOrderId = () => {
  return `ORD-${Date.now()}`;
};

// Pre-populate with some test payment references
paymentReferences.set("PAY12345678", {
  amount: 400,
  verified: true,
  timestamp: new Date().toISOString(),
});

paymentReferences.set("PAY87654321", {
  amount: 760,
  verified: true,
  timestamp: new Date().toISOString(),
});

// Add the real UPI transaction ID
paymentReferences.set("CICAgOiS6u7hEQ", {
  amount: 180,
  verified: false,
  timestamp: new Date().toISOString(),
});

// Payment webhook endpoint (for real payment gateways)
router.post("/webhook", (req, res) => {
  const {
    transactionId,
    amount,
    status,
    paymentMode,
    orderId,
    sessionId,
    timestamp,
  } = req.body;

  console.log("🔔 Payment webhook received:", {
    transactionId,
    amount,
    status,
    paymentMode,
    orderId,
    sessionId,
  });

  // Validate webhook data
  if (!transactionId || !amount || !status) {
    return res.status(400).json({
      success: false,
      message: "❌ Missing required webhook data",
    });
  }

  // Find the payment session
  let paymentSession = null;
  if (sessionId) {
    paymentSession = pendingPayments.get(sessionId);
  }

  // Add/update payment reference
  paymentReferences.set(transactionId, {
    amount: amount,
    verified: status === "success" || status === "completed",
    timestamp: timestamp || new Date().toISOString(),
    paymentMode: paymentMode || "unknown",
    orderId: orderId,
    sessionId: sessionId,
    webhookStatus: status,
    webhookReceivedAt: new Date().toISOString(),
  });

  // Update payment session if exists
  if (paymentSession) {
    paymentSession.paymentReference = transactionId;
    paymentSession.status =
      status === "success" || status === "completed" ? "completed" : "failed";
    paymentSession.webhookReceivedAt = new Date().toISOString();

    // Update pending payments
    pendingPayments.set(sessionId, paymentSession);
  }

  res.status(200).json({
    success: true,
    message: "✅ Webhook processed successfully",
    transactionId,
    status,
  });
});

// Check payment status by session ID
router.get("/status/:sessionId", (req, res) => {
  const { sessionId } = req.params;

  const paymentSession = pendingPayments.get(sessionId);

  if (!paymentSession) {
    return res.status(404).json({
      success: false,
      message: "❌ Payment session not found",
    });
  }

  // Check if session expired
  if (new Date() > new Date(paymentSession.expiresAt)) {
    paymentSession.status = "expired";
    pendingPayments.set(sessionId, paymentSession);
  }

  res.status(200).json({
    success: true,
    sessionData: {
      sessionId: paymentSession.sessionId,
      orderId: paymentSession.orderId,
      amount: paymentSession.amount,
      paymentMode: paymentSession.paymentMode,
      status: paymentSession.status,
      paymentReference: paymentSession.paymentReference,
      createdAt: paymentSession.createdAt,
      expiresAt: paymentSession.expiresAt,
      verificationAttempts: paymentSession.verificationAttempts,
    },
  });
});

// Create payment session (for tracking payments)
router.post("/create-session", (req, res) => {
  const { orderId, amount, paymentMode, customerInfo } = req.body;

  if (!orderId || !amount || !paymentMode) {
    return res.status(400).json({
      success: false,
      message: "❌ Order ID, amount, and payment mode are required",
    });
  }

  const sessionId = `SESSION-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  const paymentSession = {
    sessionId,
    orderId,
    amount,
    paymentMode,
    customerInfo: customerInfo || {},
    status: "pending", // pending, completed, failed, expired
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
    verificationAttempts: 0,
    paymentReference: null,
    webhookReceivedAt: null,
  };

  pendingPayments.set(sessionId, paymentSession);

  res.status(200).json({
    success: true,
    message: "✅ Payment session created",
    sessionData: {
      sessionId,
      orderId,
      amount,
      paymentMode,
      expiresAt: expiresAt.toISOString(),
    },
  });
});

// Enhanced verification with session tracking
router.post("/verify", (req, res) => {
  const { paymentReference, amount, paymentMode, sessionId } = req.body;

  if (!paymentReference || !amount) {
    return res.status(400).json({
      verified: false,
      message: "❌ Payment reference and amount are required",
    });
  }

  // Check if payment reference exists
  const paymentData = paymentReferences.get(paymentReference);

  if (!paymentData) {
    // Auto-add the payment reference if it looks like a real UPI transaction ID
    if (paymentReference.length >= 8 && !paymentReference.startsWith("PAY")) {
      paymentReferences.set(paymentReference, {
        amount: amount,
        verified: false,
        timestamp: new Date().toISOString(),
        paymentMode: paymentMode || "unknown",
        sessionId: sessionId,
        autoAdded: true,
        verificationAttempts: 1,
      });

      // Update session if provided
      if (sessionId) {
        const paymentSession = pendingPayments.get(sessionId);
        if (paymentSession) {
          paymentSession.paymentReference = paymentReference;
          paymentSession.verificationAttempts += 1;
          pendingPayments.set(sessionId, paymentSession);
        }
      }

      return res.status(200).json({
        verified: false,
        message:
          "⚠️ Payment reference added but not yet verified. Please contact admin to verify this payment.",
        paymentData: {
          reference: paymentReference,
          amount: amount,
          timestamp: new Date().toISOString(),
          autoAdded: true,
          sessionId: sessionId,
        },
      });
    }

    return res.status(404).json({
      verified: false,
      message: "❌ Payment reference not found",
    });
  }

  // Verify amount matches
  if (paymentData.amount !== amount) {
    return res.status(400).json({
      verified: false,
      message: `❌ Amount mismatch. Expected ₹${paymentData.amount}, got ₹${amount}`,
    });
  }

  // Check if already verified
  if (paymentData.verified) {
    return res.status(200).json({
      verified: true,
      message: "✅ Payment already verified",
      paymentData: {
        reference: paymentReference,
        amount: paymentData.amount,
        timestamp: paymentData.timestamp,
        sessionId: paymentData.sessionId,
      },
    });
  }

  // Mark as verified
  paymentData.verified = true;
  paymentData.verifiedAt = new Date().toISOString();
  paymentData.verificationAttempts =
    (paymentData.verificationAttempts || 0) + 1;

  // Update session if provided
  if (sessionId) {
    const paymentSession = pendingPayments.get(sessionId);
    if (paymentSession) {
      paymentSession.status = "completed";
      paymentSession.paymentReference = paymentReference;
      paymentSession.verificationAttempts += 1;
      pendingPayments.set(sessionId, paymentSession);
    }
  }

  res.status(200).json({
    verified: true,
    message: "✅ Payment verified successfully",
    paymentData: {
      reference: paymentReference,
      amount: paymentData.amount,
      timestamp: paymentData.timestamp,
      verifiedAt: paymentData.verifiedAt,
      sessionId: paymentData.sessionId,
    },
  });
});

// Generate test payment reference (for development)
router.post("/generate-test", (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    return res.status(400).json({
      message: "❌ Amount is required",
    });
  }

  const reference = generatePaymentReference();
  paymentReferences.set(reference, {
    amount: amount,
    verified: false,
    timestamp: new Date().toISOString(),
  });

  res.status(200).json({
    message: "✅ Test payment reference generated",
    paymentReference: reference,
    amount: amount,
    instructions: "Use this reference number to test payment verification",
  });
});

// Add payment reference manually (for real transactions)
router.post("/add-reference", (req, res) => {
  const { paymentReference, amount, paymentMode } = req.body;

  if (!paymentReference || !amount) {
    return res.status(400).json({
      success: false,
      message: "❌ Payment reference and amount are required",
    });
  }

  // Check if reference already exists
  if (paymentReferences.has(paymentReference)) {
    return res.status(400).json({
      success: false,
      message: "❌ Payment reference already exists",
    });
  }

  // Add new payment reference
  paymentReferences.set(paymentReference, {
    amount: amount,
    verified: false,
    timestamp: new Date().toISOString(),
    paymentMode: paymentMode || "unknown",
  });

  res.status(200).json({
    success: true,
    message: "✅ Payment reference added successfully",
    paymentData: {
      reference: paymentReference,
      amount: amount,
      timestamp: new Date().toISOString(),
    },
  });
});

// Admin endpoint to manually verify a payment
router.post("/admin/verify", (req, res) => {
  const { paymentReference } = req.body;

  if (!paymentReference) {
    return res.status(400).json({
      success: false,
      message: "❌ Payment reference is required",
    });
  }

  const paymentData = paymentReferences.get(paymentReference);

  if (!paymentData) {
    return res.status(404).json({
      success: false,
      message: "❌ Payment reference not found",
    });
  }

  // Mark as verified
  paymentData.verified = true;
  paymentData.verifiedAt = new Date().toISOString();
  paymentData.verifiedBy = "admin";

  res.status(200).json({
    success: true,
    message: "✅ Payment verified by admin",
    paymentData: {
      reference: paymentReference,
      amount: paymentData.amount,
      verified: true,
      verifiedAt: paymentData.verifiedAt,
    },
  });
});

// Get all payment sessions (for admin)
router.get("/sessions", (req, res) => {
  const sessions = Array.from(pendingPayments.entries()).map(
    ([sessionId, data]) => ({
      sessionId: data.sessionId,
      orderId: data.orderId,
      amount: data.amount,
      paymentMode: data.paymentMode,
      status: data.status,
      paymentReference: data.paymentReference,
      createdAt: data.createdAt,
      expiresAt: data.expiresAt,
      verificationAttempts: data.verificationAttempts,
      webhookReceivedAt: data.webhookReceivedAt,
    })
  );

  res.status(200).json({
    message: "✅ Payment sessions retrieved",
    sessions: sessions,
    totalSessions: sessions.length,
    activeSessions: sessions.filter((s) => s.status === "pending").length,
  });
});

// Clean up expired sessions
router.post("/cleanup", (req, res) => {
  const now = new Date();
  let cleanedCount = 0;

  for (const [sessionId, session] of pendingPayments.entries()) {
    if (new Date(session.expiresAt) < now && session.status === "pending") {
      session.status = "expired";
      pendingPayments.set(sessionId, session);
      cleanedCount++;
    }
  }

  res.status(200).json({
    success: true,
    message: `✅ Cleaned up ${cleanedCount} expired sessions`,
    cleanedCount,
  });
});

// Get all payment references (for admin)
router.get("/references", (req, res) => {
  const references = Array.from(paymentReferences.entries()).map(
    ([ref, data]) => ({
      reference: ref,
      amount: data.amount,
      verified: data.verified,
      timestamp: data.timestamp,
      verifiedAt: data.verifiedAt,
      sessionId: data.sessionId,
      webhookStatus: data.webhookStatus,
    })
  );

  res.status(200).json({
    message: "✅ Payment references retrieved",
    references: references,
    totalReferences: references.length,
    verifiedReferences: references.filter((r) => r.verified).length,
  });
});

module.exports = router;
