import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./component/Navbar.jsx";
import ProductList from "./component/Productlist.jsx";
import Cart from "./component/Cart.jsx";
import Checkout from "./component/Checkout.jsx";
import ThankYou from "./component/Thankyou.js";
import About from "./component/About.jsx";
import Contact from "./component/Contact.jsx";

const App = () => {
  const [quantities, setQuantities] = useState({});
  const [cartCount, setCartCount] = useState(0);

  return (
    <BrowserRouter>
      <div style={{ padding: 0, margin: 0 }}>
        <Navbar cartCount={cartCount} />
      </div>
      <Routes>
        <Route
          path="/"
          element={
            <ProductList
              quantities={quantities}
              setQuantities={setQuantities}
              cartCount={cartCount}
              setCartCount={setCartCount}
            />
          }
        />
        <Route path="/cart" element={<Cart />} />
        <Route
          path="/checkout"
          element={
            <Checkout quantities={quantities} setQuantities={setQuantities} />
          }
        />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
