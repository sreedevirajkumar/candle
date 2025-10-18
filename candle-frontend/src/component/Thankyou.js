import React from 'react';
import './ThankYou.css'; 
import { Link } from 'react-router-dom';

const ThankYou = () => {
  return (
    <div className="thankyou-container">
      <h2>🎉 Thank You for Your Order!</h2>
      <p>Your candles will be delivered soon. 🕯️</p>
      <Link to="/" className="back-home-button">Continue Shopping</Link>
    </div>
  );
};

export default ThankYou;