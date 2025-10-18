import React, { useEffect } from "react";
import "./Product.css";
import Slideshow from "./Slideshow";
import Homeabout from "./Homeabout";
import Homecontact from "./Homecontact";

const productsData = [
  {
    id: 1,
    name: "Sacred Sanctuary",
    price: 1860,
    flavor: "Burnt Oak & Sage",
    image: "/images/rose.jpg",
    description: "A grounding blend of earthy oak and cleansing sage",
  },
  {
    id: 2,
    name: "Prairie Lavender",
    price: 2330,
    flavor: "Lavender & Patchouli",
    image: "/images/lavender.jpg",
    description: "Calming lavender meets deep, mysterious patchouli",
  },
  {
    id: 3,
    name: "Love Potion",
    price: 2330,
    flavor: "Rose & Apple Blossom",
    image: "/images/vanilla.jpg",
    description: "Romantic rose petals dance with sweet apple blossoms",
  },
  {
    id: 4,
    name: "Silent Whisper",
    price: 1115,
    flavor: "White Tea & Ginger",
    image: "/images/mint.jpg",
    description: "Delicate white tea with a warming ginger embrace",
  },
  {
    id: 5,
    name: "Goodnight Kiss",
    price: 1115,
    flavor: "Lavender & Eucalyptus",
    image: "/images/citrus.jpg",
    description: "Soothing lavender paired with refreshing eucalyptus",
  },
  {
    id: 6,
    name: "Noir",
    price: 2800,
    flavor: "Bergamot, Black Tea & Vetiver",
    image: "/images/ocean.jpg",
    description: "Sophisticated blend of citrus, tea, and earthy vetiver",
  },
  {
    id: 7,
    name: "Enchanted Forest",
    price: 2330,
    flavor: "Cypress & Pine",
    image: "/images/jasmine.jpg",
    description: "Deep forest scents of cypress and pine needles",
  },
  {
    id: 8,
    name: "Soul Mate",
    price: 1115,
    flavor: "Jasmine, Myrrh & Vetiver",
    image: "/images/sandalwood.jpg",
    description: "Exotic jasmine meets ancient myrrh and earthy vetiver",
  },
];

const ProductList = ({
  quantities,
  setQuantities,
  cartCount,
  setCartCount,
}) => {
  // Load initial cart count when component mounts
  useEffect(() => {
    const loadCartCount = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/cart/count");
        const data = await response.json();
        if (response.ok) {
          setCartCount(data.cartCount);
        }
      } catch (error) {
        console.error("❌ Error loading cart count:", error);
      }
    };

    loadCartCount();
  }, [setCartCount]);

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
    const qty = quantities[id] || 0;
    if (qty > 0) {
      try {
        const product = productsData.find((p) => p.id === id);
        const response = await fetch("http://localhost:3000/api/cart/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: id,
            quantity: qty,
            productName: product.name,
            price: product.price,
            flavor: product.flavor,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          setCartCount(data.cartCount);
          // Reset quantity for this product after adding to cart
          setQuantities((prev) => ({ ...prev, [id]: 0 }));
          console.log("✅ Added to cart:", data.message);
        } else {
          console.error("❌ Failed to add to cart:", data.message);
        }
      } catch (error) {
        console.error("❌ Error adding to cart:", error);
      }
    }
  };

  return (
    <div className="product-page">
      <Slideshow />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content text-center">
            <h1 className="hero-title fade-in-up">
              Extraordinary candles made by master perfumers
            </h1>
            <p className="hero-subtitle fade-in-up">
              Discover the everyday magic in and around us
            </p>
          </div>
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
                    <button className="btn btn-primary quick-view-btn">
                      Quick View
                    </button>
                  </div>
                </div>

                <div className="product-content">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-flavor">{product.flavor}</p>
                  <p className="product-description">{product.description}</p>

                  <div className="product-price">
                    <span className="price-currency">$</span>
                    <span className="price-amount">
                      {product.price.toLocaleString()}
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

          <div className="text-center mt-4">
            <button className="btn btn-outline">View All Products</button>
          </div>
        </div>
      </section>

      <Homeabout />
      <Homecontact />
    </div>
  );
};

export default ProductList;
