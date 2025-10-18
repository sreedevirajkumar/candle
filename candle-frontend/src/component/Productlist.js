import React from 'react';
import './Product.css';
import Slideshow from './Slideshow';
import Homeabout from './Homeabout';
import Homecontact from './Homecontact';

const productsData = [
  { id: 1, name: 'Rose Candle', price: 200, flavor: 'Rose', image: '/images/rose.jpg' },
  { id: 2, name: 'Lavender Light', price: 180, flavor: 'Lavender', image: '/images/lavender.jpg' },
  { id: 3, name: 'Vanilla Bliss', price: 220, flavor: 'Vanilla', image: '/images/vanilla.jpg' },
  { id: 4, name: 'Mint Fresh', price: 150, flavor: 'Mint', image: '/images/mint.jpg' },
  { id: 5, name: 'Citrus Zest', price: 210, flavor: 'Citrus', image: '/images/citrus.jpg' },
  { id: 6, name: 'Ocean Breeze', price: 190, flavor: 'Ocean', image: '/images/ocean.jpg' },
  { id: 7, name: 'Jasmine Glow', price: 230, flavor: 'Jasmine', image: '/images/jasmine.jpg' },
  { id: 8, name: 'Sandalwood Dream', price: 250, flavor: 'Sandalwood', image: '/images/sandalwood.jpg' },
];

const ProductList = ({ quantities, setQuantities, cartCount, setCartCount }) => {
  const handleIncrement = (id) => {
    setQuantities(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleDecrement = (id) => {
    setQuantities(prev => ({ ...prev, [id]: Math.max((prev[id] || 0) - 1, 0) }));
  };

  const handleAddToCart = (id) => {
    const qty = quantities[id] || 0;
    if (qty > 0) {
      setCartCount(cartCount + qty);
     
    }
  };

  return (
    <div>
      <Slideshow />
      <div className="product-list">
        {productsData.map(product => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} className="product-image" />
            <h3>{product.name}</h3>
            <p>Price: ₹{product.price}</p>
            <p>Flavor: {product.flavor}</p>

            <div className="quantity-controls">
              <button onClick={() => handleDecrement(product.id)}>-</button>
              <span>{quantities[product.id] || 0}</span>
              <button onClick={() => handleIncrement(product.id)}>+</button>
            </div>

            <button onClick={() => handleAddToCart(product.id)} className="add-btn">
              Add to Cart
            </button>
          </div>
        ))}
      </div>
      <Homeabout />
      <Homecontact />
    </div>
  );
};

export default ProductList;