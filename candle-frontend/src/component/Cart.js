import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

const productsData = [
  { id: 1, name: 'Rose Candle', price: 200, flavor: 'Rose' },
  { id: 2, name: 'Lavender Light', price: 180, flavor: 'Lavender' },
  { id: 3, name: 'Vanilla Bliss', price: 220, flavor: 'Vanilla' },
  { id: 4, name: 'Mint Fresh', price: 150, flavor: 'Mint' },
  { id: 5, name: 'Citrus Zest', price: 210, flavor: 'Citrus' },
  { id: 6, name: 'Ocean Breeze', price: 190, flavor: 'Ocean' },
  { id: 7, name: 'Jasmine Glow', price: 230, flavor: 'Jasmine' },
  { id: 8, name: 'Sandalwood Dream', price: 250, flavor: 'Sandalwood' },
];

const Cart = ({ quantities, setQuantities }) => {
  const navigate = useNavigate();

  const handleRemove = (id) => {
    setQuantities((prev) => {
      const newQuantities = { ...prev };
      delete newQuantities[id];
      return newQuantities;
    });
  };

  const cartItems = productsData.filter(product => quantities[product.id]);

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * quantities[item.id],
    0
  );

  return (
    <div className="cart-page">
      <h2>Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>No items in cart.</p>
      ) : (
        <>
          {cartItems.map(product => (
            <div key={product.id} className="cart-item">
              <h3>{product.name}</h3>
              <p>Quantity: {quantities[product.id]}</p>
              <p>Total: ₹{quantities[product.id] * product.price}</p>
              <button onClick={() => handleRemove(product.id)}>Remove</button>
            </div>
          ))}

          <div className="cart-summary">
            <h3>Price Summary</h3>
            <p>Total Items: {Object.values(quantities).reduce((a, b) => a + b, 0)}</p>
            <p><strong>Total Cost: ₹{totalPrice}</strong></p>
            <button className="checkout-btn" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;