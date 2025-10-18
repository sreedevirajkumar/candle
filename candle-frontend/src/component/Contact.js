import React, { useState } from "react";
import "./Contact.css";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you for contacting us! We’ll get back to you soon 🕯️");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="contact-container">
      <div className="contact-content">
        <h1 className="contact-title">Contact Us ✉️</h1>
        <p className="contact-text">
          Have questions or feedback? We’d love to hear from you!  
          Fill out the form below or reach us through our store details.
        </p>

        <div className="contact-grid">
          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="mb-4">
              <label className="contact-label">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="contact-input"
              />
            </div>

            <div className="mb-4">
              <label className="contact-label">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="contact-input"
              />
            </div>

            <div className="mb-4">
              <label className="contact-label">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows="4"
                required
                className="contact-textarea"
              />
            </div>

            <button type="submit" className="contact-button">
              Send Message
            </button>
          </form>

          {/* Store Info */}
          <div className="contact-info">
            <h2 className="store-title">Our Store</h2>
            <p className="store-text">📍 Peelamedu, Coimbatore</p>
            <p className="store-text">📞 +91 77088 76765</p>
            <p className="store-text">📧 shop.glintcandle.com</p>

            <h3 className="store-title">Working Hours</h3>
            <p className="store-text">Mon - Sat: 10:00 AM - 8:00 PM</p>
            <p className="store-text">Sunday: Closed</p>
          </div>
        </div>
      </div>
    </div>
  );
}