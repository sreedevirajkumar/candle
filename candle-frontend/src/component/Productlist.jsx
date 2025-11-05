import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./Product.css";
import Slideshow from "./Slideshow";
import Homeabout from "./Homeabout";
import Homecontact from "./Homecontact";
import productsData from "./productsData";

const ProductList = ({
  quantities,
  setQuantities,
  cartCount,
  setCartCount,
}) => {
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3000";
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    const loadCartCount = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/cart/count`);
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          throw new Error(`Expected JSON, got: ${contentType}`);
        }
        const data = await response.json();
        if (response.ok) {
          setCartCount(data.cartCount);
        }
      } catch (error) {
        console.error("❌ Error loading cart count:", error);
      }
    };
    loadCartCount();
  }, [setCartCount, API_BASE]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setQuickViewProduct(null);
      }
    };
    if (quickViewProduct) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [quickViewProduct]);

  const handleIncrement = (id) => {
    setQuantities((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleDecrement = (id) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max((prev[id] || 0) - 1, 0),
    }));
  };

  const handleAddToCart = async (id) => {
    const selectedQuantity = quantities[id] || 0;
    if (selectedQuantity <= 0) return;
    try {
      const itemsRes = await fetch(`${API_BASE}/api/cart/items`);
      const itemsCT = itemsRes.headers.get("content-type") || "";
      if (!itemsCT.includes("application/json")) {
        throw new Error(`Expected JSON, got: ${itemsCT}`);
      }
      const itemsJson = await itemsRes.json();
      const currentItems = itemsRes.ok ? itemsJson.cartItems || [] : [];
      const existing = currentItems.find((it) => it.productId === id);
      const product = productsData.find((p) => p.id === id);
      if (!product) {
        toast.error("Product not found.");
        return;
      }
      let ok = false;
      let newItems = currentItems;
      if (existing) {
        // Set exact quantity using update endpoint
        const updateRes = await fetch(`${API_BASE}/api/cart/update`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: Number(id), quantity: selectedQuantity }),
        });
        const updateCT = updateRes.headers.get("content-type") || "";
        if (!updateCT.includes("application/json")) {
          throw new Error(`Expected JSON, got: ${updateCT}`);
        }
        const updateJson = await updateRes.json();
        ok = updateRes.ok;
        if (ok) newItems = updateJson.cartItems || [];
        if (!ok) {
          console.error("❌ Failed to update quantity:", updateJson.message);
          toast.error(updateJson.message || "Failed to update quantity.");
        }
      } else {
        // Add new line item
        const addRes = await fetch(`${API_BASE}/api/cart/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: Number(id),
            quantity: selectedQuantity,
            productName: product.name,
            price: product.price,
            flavor: product.flavor,
            image: product.image,
          }),
        });
        const addCT = addRes.headers.get("content-type") || "";
        if (!addCT.includes("application/json")) {
          throw new Error(`Expected JSON, got: ${addCT}`);
        }
        const addJson = await addRes.json();
        ok = addRes.ok;
        if (ok) {
          // After add, fetch items to compute count reliably
          const afterRes = await fetch(`${API_BASE}/api/cart/items`);
          const afterCT = afterRes.headers.get("content-type") || "";
          if (!afterCT.includes("application/json")) {
            throw new Error(`Expected JSON, got: ${afterCT}`);
          }
          const afterJson = await afterRes.json();
          if (afterRes.ok) newItems = afterJson.cartItems || [];
        } else {
          console.error("❌ Failed to add to cart:", addJson.message);
          toast.error(addJson.message || "Failed to add to cart.");
        }
      }
      if (ok) {
        const totalCount = newItems.reduce((sum, it) => sum + (it.quantity || 0), 0);
        setCartCount(totalCount);
        console.log("✅ Cart updated. Items:", totalCount);
        toast.success("Added to cart.");
      }
    } catch (error) {
      console.error("❌ Error adding/updating cart:", error);
      toast.error("Error adding to cart. Please try again.");
    }
  };

  return (
    <div className="product-page">
      {/* Slideshow with overlayed hero content */}
      <Slideshow
        title="Extraordinary candles made by master perfumers"
        subtitle="Discover the everyday magic in and around us"
        ctaPrimaryText="Shop Bestsellers"
        ctaPrimaryOnClick={() => {
          const el = document.querySelector(".products-section");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
        ctaSecondaryText="Contact Us"
        ctaSecondaryOnClick={() => navigate("/contact")}
      />
      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon">🚚</div>
              <div className="feature-text">
                <h4>Fast Delivery</h4>
                <p>Carefully packed and shipped quickly</p>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">🕯️</div>
              <div className="feature-text">
                <h4>Handcrafted</h4>
                <p>Small-batch candles poured with care</p>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">🌿</div>
              <div className="feature-text">
                <h4>Natural Wax</h4>
                <p>Clean burn, rich fragrance profiles</p>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">🔒</div>
              <div className="feature-text">
                <h4>Secure Payments</h4>
                <p>UPI and cards with safe checkout</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Promo Banner */}
      <section className="promo-banner">
        <div className="container promo-inner">
          <div className="promo-copy">
            <h3>Light up your evenings</h3>
            <p>Explore limited seasonal blends crafted by master perfumers</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              const el = document.querySelector(".products-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Explore Collection
          </button>
        </div>
      </section>
      {/* Products Section */}
      <section className="products-section">
        <div className="container">
          <div className="section-header text-center mb-4">
            <h2 className="section-title">Our Bestsellers</h2>
            <p className="section-subtitle">
              Handcrafted candles that transform your space
            </p>
          </div>
          <div className="products-grid">
            {productsData.map((product, index) => (
              <div
                key={product.id}
                className="product-card fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="product-image-container">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-image"
                  />
                  <div className="product-overlay">
                    <button
                      className="btn btn-primary quick-view-btn"
                      onClick={() => setQuickViewProduct(product)}
                    >
                      Quick View
                    </button>
                  </div>
                </div>
                <div className="product-content">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-flavor">{product.flavor}</p>
                  <p className="product-description">{product.description}</p>
                  <div className="product-price">
                    <span className="price-currency">₹</span>
                    <span className="price-amount">
                      {product.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="quantity-controls">
                    <button
                      className="quantity-btn"
                      onClick={() => handleDecrement(product.id)}
                      disabled={!quantities[product.id]}
                    >
                      −
                    </button>
                    <span className="quantity-display">
                      {quantities[product.id] || 0}
                    </span>
                    <button
                      className="quantity-btn"
                      onClick={() => handleIncrement(product.id)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    className={`add-to-cart-btn ${
                      quantities[product.id] ? "active" : ""
                    }`}
                    disabled={!quantities[product.id]}
                  >
                    {quantities[product.id] ? "Add to Cart" : "Select Quantity"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Homeabout />
      <Homecontact />
      {/* Shipping Policy */}
      <section className="policy-section">
        <div className="container">
          <h3 className="policy-title">Shipping & Returns</h3>
          <div className="policy-content">
            <p><strong>Shipping:</strong> Orders are processed in 1-2 business days. Delivery within 2-7 business days based on city.</p>
            <p><strong>Returns:</strong> Eligible within 7 days for unused items in original packaging. Contact support for assistance.</p>
            <p><strong>Damages:</strong> If your candle arrives damaged, share an unboxing photo within 48 hours for a free replacement.</p>
          </div>
        </div>
      </section>
      {quickViewProduct && (
        <div
          className="quickview-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setQuickViewProduct(null);
          }}
        >
          <div className="quickview-modal" role="dialog" aria-modal="true">
            <button
              className="quickview-close"
              aria-label="Close"
              onClick={() => setQuickViewProduct(null)}
            >
              ×
            </button>
            <div className="quickview-body">
              <div className="quickview-image-wrap">
                <img
                  src={quickViewProduct.image}
                  alt={quickViewProduct.name}
                />
              </div>
              <div className="quickview-content">
                <h3 className="quickview-name">{quickViewProduct.name}</h3>
                <p className="quickview-flavor">{quickViewProduct.flavor}</p>
                <p className="quickview-description">{quickViewProduct.description}</p>
                <div className="quickview-price">
                  <span className="price-currency">₹</span>
                  <span className="price-amount">
                    {quickViewProduct.price.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="quantity-controls">
                  <button
                    className="quantity-btn"
                    onClick={() => handleDecrement(quickViewProduct.id)}
                    disabled={!quantities[quickViewProduct.id]}
                  >
                    −
                  </button>
                  <span className="quantity-display">
                    {quantities[quickViewProduct.id] || 0}
                  </span>
                  <button
                    className="quantity-btn"
                    onClick={() => handleIncrement(quickViewProduct.id)}
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => handleAddToCart(quickViewProduct.id)}
                  className={`add-to-cart-btn ${
                    quantities[quickViewProduct.id] ? "active" : ""
                  }`}
                  disabled={!quantities[quickViewProduct.id]}
                >
                  {quantities[quickViewProduct.id] ? "Add to Cart" : "Select Quantity"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
