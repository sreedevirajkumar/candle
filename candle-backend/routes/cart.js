const express = require("express");
const router = express.Router();

// In-memory cart storage (you can replace this with MongoDB later)
let cartItems = [];
let cartCount = 0;

// Add item to cart
router.post("/add", (req, res) => {
  const { productId, quantity, productName, price, flavor } = req.body;

  if (!productId || !quantity || quantity <= 0) {
    return res.status(400).json({
      message: "❌ Invalid product ID or quantity",
    });
  }

  // Check if item already exists in cart
  const existingItemIndex = cartItems.findIndex(
    (item) => item.productId === productId
  );

  if (existingItemIndex !== -1) {
    // Update existing item quantity
    cartItems[existingItemIndex].quantity += quantity;
  } else {
    // Add new item to cart
    cartItems.push({
      productId,
      quantity,
      productName: productName || `Product ${productId}`,
      price: price || 0,
      flavor: flavor || "Unknown",
      addedAt: new Date(),
    });
  }

  // Update total cart count
  cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  res.status(200).json({
    message: "✅ Item added to cart successfully",
    cartCount: cartCount,
    cartItems: cartItems,
  });
});

// Get cart items
router.get("/items", (req, res) => {
  res.status(200).json({
    cartItems: cartItems,
    cartCount: cartCount,
    totalItems: cartItems.length,
  });
});

// Update item quantity in cart
router.put("/update", (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || quantity < 0) {
    return res.status(400).json({
      message: "❌ Invalid product ID or quantity",
    });
  }

  const itemIndex = cartItems.findIndex((item) => item.productId === productId);

  if (itemIndex === -1) {
    return res.status(404).json({
      message: "❌ Item not found in cart",
    });
  }

  if (quantity === 0) {
    // Remove item from cart
    cartItems.splice(itemIndex, 1);
  } else {
    // Update quantity
    cartItems[itemIndex].quantity = quantity;
  }

  // Update total cart count
  cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  res.status(200).json({
    message: "✅ Cart updated successfully",
    cartCount: cartCount,
    cartItems: cartItems,
  });
});

// Remove item from cart
router.delete("/remove/:productId", (req, res) => {
  const { productId } = req.params;

  const itemIndex = cartItems.findIndex(
    (item) => item.productId === parseInt(productId)
  );

  if (itemIndex === -1) {
    return res.status(404).json({
      message: "❌ Item not found in cart",
    });
  }

  cartItems.splice(itemIndex, 1);

  // Update total cart count
  cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  res.status(200).json({
    message: "✅ Item removed from cart successfully",
    cartCount: cartCount,
    cartItems: cartItems,
  });
});

// Clear entire cart
router.delete("/clear", (req, res) => {
  cartItems = [];
  cartCount = 0;

  res.status(200).json({
    message: "✅ Cart cleared successfully",
    cartCount: 0,
    cartItems: [],
  });
});

// Get cart count only
router.get("/count", (req, res) => {
  res.status(200).json({
    cartCount: cartCount,
  });
});

module.exports = router;
