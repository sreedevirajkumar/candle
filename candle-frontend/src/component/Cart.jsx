import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";
import productsData from "./productsData";

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Build quick lookup maps from shared productsData
  const productById = useMemo(() => {
    const map = {};
    productsData.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, []);

  const productByName = useMemo(() => {
    const map = {};
    productsData.forEach((p) => {
      map[p.name] = p;
    });
    return map;
  }, []);

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3000";

  // Load cart items from API
  useEffect(() => {
    const loadCartItems = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/cart/items`);
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          throw new Error(`Expected JSON, got: ${contentType}`);
        }
        const data = await response.json();
        if (response.ok) {
          const enhanced = (data.cartItems || []).map((item) => {
            const fallback =
              productById[item.productId] || productByName[item.productName] || {};
            return {
              ...item,
              image: item.image || fallback.image || "/images/rose.jpg",
              flavor: item.flavor || fallback.flavor,
              price: item.price ?? fallback.price ?? 0,
            };
          });
          setCartItems(enhanced);
        } else {
          setError("Failed to load cart items");
        }
      } catch (error) {
        setError("Error loading cart items: " + error.message);
      } finally {
        setLoading(false);
      }
    };
    loadCartItems();
  }, [productById, productByName, API_BASE]);

  const handleRemove = async (productId) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/cart/remove/${Number(productId)}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();
      if (response.ok) {
        setCartItems(data.cartItems);
        console.log("✅ Item removed:", data.message);
      } else {
        console.error("❌ Failed to remove item:", data.message);
      }
    } catch (error) {
      console.error("❌ Error removing item:", error);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 0) return;
    try {
      const response = await fetch(`${API_BASE}/api/cart/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: Number(productId),
          quantity: newQuantity,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setCartItems(data.cartItems);
        console.log("✅ Quantity updated:", data.message);
      } else {
        console.error("❌ Failed to update quantity:", data.message);
      }
    } catch (error) {
      console.error("❌ Error updating quantity:", error);
    }
  };

  const handleClearCart = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/cart/clear`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (response.ok) {
        setCartItems([]);
        console.log("✅ Cart cleared:", data.message);
      } else {
        console.error("❌ Failed to clear cart:", data.message);
      }
    } catch (error) {
      console.error("❌ Error clearing cart:", error);
    }
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="cart-header">
            <h1 className="cart-title">Your Cart</h1>
          </div>
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading your beautiful candles...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="cart-header">
            <h1 className="cart-title">Your Cart</h1>
          </div>
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <p className="error-message">{error}</p>
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1 className="cart-title">Your Cart</h1>
          <p className="cart-subtitle">
            {cartItems.length > 0
              ? `${totalItems} ${
                  totalItems === 1 ? "item" : "items"
                } in your cart`
              : "Your cart is empty"}
          </p>
        </div>
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <img
              src="/images/cart-empty.png"
              alt="Empty Cart"
              className="empty-cart-logo empty-cart-anim"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <p>Discover our beautiful collection of handcrafted candles</p>
            <button
              onClick={() => navigate("/")}
              className="btn btn-primary continue-shopping-btn"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cartItems.map((item, index) => (
                <div
                  key={item.productId}
                  className="cart-item fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="item-image">
                    <img 
                      src={item.image || "/images/rose.jpg"} 
                      alt={item.productName}
                      className="cart-item-image"
                      onError={(e) => {
                        e.target.src = "/images/rose.jpg";
                      }}
                    />
                  </div>
                  <div className="item-details">
                    <h3 className="item-name">{item.productName}</h3>
                    <p className="item-flavor">{item.flavor}</p>
                    <div className="item-price">
                      <span className="price-label">Price:</span>
                      <span className="price-value">
                        ₹{item.price.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                  <div className="quantity-section">
                    <div className="quantity-controls">
                      <button
                        className="quantity-btn"
                        onClick={() =>
                          handleUpdateQuantity(
                            item.productId,
                            item.quantity - 1
                          )
                        }
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button
                        className="quantity-btn"
                        onClick={() =>
                          handleUpdateQuantity(
                            item.productId,
                            item.quantity + 1
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                    <div className="item-total">
                      <span className="total-label">Total:</span>
                      <span className="total-value">
                        ₹{(item.quantity * item.price).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(item.productId)}
                    className="remove-btn"
                    title="Remove item"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="cart-summary">
              <div className="summary-card">
                <h3 className="summary-title">Order Summary</h3>
                <div className="summary-details">
                  <div className="summary-row">
                    <span>Items ({totalItems})</span>
                    <span>₹{totalPrice.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="summary-divider"></div>
                  <div className="summary-row total-row">
                    <span>Total</span>
                    <span className="total-price">
                      ₹{totalPrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
                <div className="cart-actions">
                  <button
                    onClick={handleClearCart}
                    className="btn btn-secondary clear-cart-btn"
                  >
                    Clear Cart
                  </button>
                  <button
                    className="btn btn-primary checkout-btn"
                    onClick={() => navigate("/checkout")}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
