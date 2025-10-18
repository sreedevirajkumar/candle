import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import './Checkout.css';

const Checkout = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    paymentMode: '',
    email: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.paymentMode) newErrors.paymentMode = "Select a payment mode";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      
      if (formData.paymentMode === "gpay") {
        const upiLink = `upi://pay?pa=yourupi@okicici&pn=GlitCandles&tn=OrderPayment&am=100&cu=INR`;
        window.location.href = upiLink;
      }

      try {
        setLoading(true);
      
        await axios.post("http://localhost:3000/api/order", formData);

        setLoading(false);
        navigate("/thank-you"); 
      } catch (error) {
        setLoading(false);
        alert("❌ Failed to place order. Please try again.");
      }
    }
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>

      <form onSubmit={handleSubmit} className="checkout-form">
        <div>
          <label>Name:</label>
          <input name="name" value={formData.name} onChange={handleChange} />
          {errors.name && <p className="error">{errors.name}</p>}
        </div>

        <div>
          <label>Email:</label>
          <input name="email" value={formData.email} onChange={handleChange} />
          {errors.email && <p className="error">{errors.email}</p>}
        </div>

        <div>
          <label>Phone Number:</label>
          <input name="phone" value={formData.phone} onChange={handleChange} />
          {errors.phone && <p className="error">{errors.phone}</p>}
        </div>

        <div>
          <label>Address:</label>
          <textarea name="address" value={formData.address} onChange={handleChange} />
          {errors.address && <p className="error">{errors.address}</p>}
        </div>

        <div>
          <label>Payment Mode:</label>
          <select name="paymentMode" value={formData.paymentMode} onChange={handleChange}>
            <option value="">--Select--</option>
            <option value="gpay">GPay</option>
            <option value="debit">Debit Card</option>
            <option value="cod">Cash on Delivery</option>
          </select>
          {errors.paymentMode && <p className="error">{errors.paymentMode}</p>}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Placing Order..." : "Place Order"}
        </button>
      </form>
    </div>
  );
};

export default Checkout;