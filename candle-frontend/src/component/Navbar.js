
import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css"; 

const Navbar = ({ cartCount = 0 }) => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">🕯️ Glint</div>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/contact">Contact</Link></li>
        <li>
          <Link to="/cart" className="cart-link">
            Cart 
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;