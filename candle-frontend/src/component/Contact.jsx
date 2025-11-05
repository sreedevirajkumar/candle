import React, { useState } from "react";
import "./Contact.css";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const adminPhone = "917708876765"; // India number without +

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = `New inquiry from Glint website:\n\nName: ${form.name}\nEmail: ${form.email}\nMessage: ${form.message}`;

    // Try native WhatsApp deep link first (mobile), fallback to wa.me for browsers
    const waDeepLink = `whatsapp://send?phone=${adminPhone}&text=${encodeURIComponent(text)}`;
    const waWebLink = `https://wa.me/${adminPhone}?text=${encodeURIComponent(text)}`;

    let opened = false;
    try {
      window.location.href = waDeepLink;
      opened = true;
      // Fallback to web after a short delay if deep link not handled
      setTimeout(() => {
        if (opened) return;
        window.open(waWebLink, "_blank");
      }, 800);
    } catch (_) {
      window.open(waWebLink, "_blank");
    }

    alert("Thank you! We opened WhatsApp to send your message to our admin.");
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

            <details className="policy-accordion" style={{ marginTop: 16 }}>
              <summary>Shipping Policy & Returns</summary>
              <div className="policy-body">
                <p><strong>Shipping:</strong> Orders ship in 1-2 business days. ETA 2-7 business days based on your city.</p>
                <p><strong>Returns:</strong> 7-day return window for unused items in original packaging.</p>
                <p><strong>Damages:</strong> Share an unboxing photo within 48 hours for a free replacement.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}



