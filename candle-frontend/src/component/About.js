import React from "react";
import "./About.css";

export default function About() {
  return (
    <div className="about-container">
      <div className="about-content">
        <h1 className="about-title">About Our Candle Store 🕯️</h1>
        
        <p className="about-text">
          Welcome to <span>GlintCandle</span>, your cozy destination for handcrafted candles made with love and care. 
          Every candle is poured using premium soy wax, natural fragrances, and eco-friendly materials to bring warmth, 
          relaxation, and positive vibes to your space.
        </p>

        <p className="about-text">
          Our mission is to create candles that don’t just light up your home, but also your heart. 
          From floral to fruity, spicy to sweet, our collection offers a variety of fragrances 
          for every mood and occasion.
        </p>

        <p className="about-text">
          Whether it’s a gift for your loved ones or a treat for yourself, our candles are crafted to make every moment special. 
          Thank you for being part of our journey and letting us add a little glow to your life.
        </p>

        <div className="features-grid">
          <div className="feature-card">
            <h2 className="feature-title">🌱 Eco-Friendly</h2>
            <p className="feature-text">
              Made with soy wax and cotton wicks, our candles are sustainable and safe for the environment.
            </p>
          </div>
          <div className="feature-card">
            <h2 className="feature-title">💝 Handcrafted</h2>
            <p className="feature-text">
              Every candle is handmade with love to ensure the best quality and attention to detail.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}