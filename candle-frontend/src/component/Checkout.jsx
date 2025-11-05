import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Checkout.css";

const Checkout = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    paymentMode: "",
    email: "",
    paymentReference: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [shippingCharge, setShippingCharge] = useState(0);
  const [userLocation, setUserLocation] = useState("");
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3000";

  useEffect(() => {
    const loadCartData = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/cart/items`);
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          throw new Error(`Expected JSON, got: ${contentType}`);
        }
        const data = await response.json();
        if (response.ok) {
          setCartItems(data.cartItems);
          const total = data.cartItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );
          setTotalAmount(total);
        }
      } catch (error) {
        console.error("Error loading cart:", error);
        toast.error("Failed to load cart items. Please try again.");
      }
    };
    loadCartData();
  }, [API_BASE]);

  const calculateShipping = (location) => {
    const shippingRates = {
      delhi: 50,
      mumbai: 60,
      bangalore: 70,
      chennai: 80,
      kolkata: 90,
      hyderabad: 75,
      pune: 65,
      ahmedabad: 85,
      jaipur: 95,
      lucknow: 100,
      default: 120,
    };
    const city = (location || "").toLowerCase();
    return shippingRates[city] || shippingRates.default;
  };

  useEffect(() => {
    const detectLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
              );
              const data = await response.json();
              const city = data.city || data.locality || "Other";
              setUserLocation(city);
              setShippingCharge(calculateShipping(city));
            } catch (e) {
              setUserLocation("Other");
              setShippingCharge(calculateShipping("default"));
            }
          },
          () => {
            setUserLocation("Other");
            setShippingCharge(calculateShipping("default"));
          }
        );
      } else {
        setUserLocation("Other");
        setShippingCharge(calculateShipping("default"));
      }
    };
    detectLocation();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    const name = (formData.name || "").trim();
    const email = (formData.email || "").trim();
    const phone = (formData.phone || "").trim();
    const address = (formData.address || "").trim();
    if (!name) {
      newErrors.name = "Name is required";
    } else if (name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (!/^[a-zA-Z .'-]{2,}$/.test(name)) {
      newErrors.name = "Use only letters and spaces in the name";
    }
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }
    if (!phone) {
      newErrors.phone = "Phone number is required";
    } else {
      const digits = phone.replace(/\D/g, "");
      if (digits.length !== 10) {
        newErrors.phone = "Enter a valid 10-digit phone number";
      }
    }
    if (!address) {
      newErrors.address = "Address is required";
    } else if (address.length < 10) {
      newErrors.address = "Address must be at least 10 characters";
    }
    if (!formData.paymentMode) newErrors.paymentMode = "Select a payment mode";
    if (formData.paymentMode === "gpay" || formData.paymentMode === "debit") {
      const ref = (formData.paymentReference || "").trim();
      if (!ref) {
        newErrors.paymentReference = "Payment reference/transaction ID is required";
      } else if (ref.length < 8) {
        newErrors.paymentReference = "Payment reference must be at least 8 characters";
      }
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      try {
        setLoading(true);
        // Prepare order data with cart items
        const orderData = {
          ...formData,
          cartItems: cartItems,
          totalAmount: totalAmount,
          orderDate: new Date().toISOString(),
          paymentVerified: paymentVerified,
        };
        await axios.post(`${API_BASE}/api/order`, orderData);
        await fetch(`${API_BASE}/api/cart/clear`, {
          method: "DELETE",
        });
        setLoading(false);
        toast.success(
          "✅ Order placed successfully! Email confirmation sent.",
          {
            position: "top-center",
            autoClose: 3000,
          }
        );
        setTimeout(() => {
          navigate("/thank-you");
        }, 1500);
      } catch (error) {
        setLoading(false);
        toast.error("❌ Failed to place order. Please try again.", {
          position: "top-center",
          autoClose: 3000,
        });
        console.error("Order error:", error);
      }
    } else {
      toast.error("❌ Please fill all required fields and confirm payment.", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  const handlePaymentModeChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, paymentMode: value }));
    setShowQRCode(false);
    setPaymentVerified(false);
  };

  const handleGPayClick = () => {
    setShowQRCode(true);
  };

  const verifyPayment = async () => {
    if (!formData.paymentReference.trim()) {
      toast.error("❌ Please enter payment reference number", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/api/payment/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentReference: formData.paymentReference,
          amount: totalAmount + shippingCharge,
          paymentMode: formData.paymentMode,
        }),
      });
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(`Expected JSON, got: ${contentType}`);
      }
      const data = await response.json();
      if (response.ok && data.verified) {
        setPaymentVerified(true);
        toast.success("✅ Payment verified successfully!", {
          position: "top-center",
          autoClose: 3000,
        });
      } else {
        setPaymentVerified(false);
        toast.error(
          "❌ Payment verification failed. Please check your reference number.",
          {
            position: "top-center",
            autoClose: 3000,
          }
        );
      }
    } catch (error) {
      setPaymentVerified(false);
      toast.error("❌ Payment verification error. Please try again.", {
        position: "top-center",
        autoClose: 3000,
      });
      console.error("Payment verification error:", error);
    }
  };

  const generateUPIURL = () => {
    const upiId = "sreedevirajkumar03@oksbi";
    const merchantName = "Glint Candles";
    const transactionNote = `Order Payment - ${formData.name || "Customer"}`;
    const finalTotal = Number(totalAmount + shippingCharge || 0).toFixed(2);
    const tr = `GLINT-${Date.now()}`;
    const params = new URLSearchParams({
      pa: upiId,
      pn: merchantName,
      am: `${finalTotal}`,
      tn: transactionNote,
      tr,
      cu: "INR",
    });
    return `upi://pay?${params.toString()}`;
  };

  const openUPIApp = () => {
    const upiUrl = generateUPIURL();
    const ua = navigator.userAgent || "";
    const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);
    if (!isMobile) {
      setShowQRCode(true);
      toast.info("Couldn't open UPI app. Showing QR instead.", {
        position: "top-center",
        autoClose: 2500,
      });
      return;
    }
    const start = Date.now();
    window.location.href = upiUrl;
    if (/Android/i.test(ua)) {
      const intentParams = upiUrl.replace("upi://", "");
      const intentUrl = `intent://${intentParams}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`;
      setTimeout(() => {
        if (Date.now() - start < 1400) {
          window.location.href = intentUrl;
        }
      }, 800);
    }
    setTimeout(() => {
      if (Date.now() - start < 2000) {
        setShowQRCode(true);
        toast.info("Couldn't open UPI app. Showing QR instead.", {
          position: "top-center",
          autoClose: 2500,
        });
      }
    }, 1700);
  };
  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      {/* Order Summary */}
      <div className="order-summary">
        <h3>Order Summary</h3>
        {cartItems.map((item) => (
          <div key={item.productId} className="order-item">
            <span>
              {item.productName} x {item.quantity}
            </span>
            <span>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
          </div>
        ))}
        <div className="order-item">
          <span>
            Shipping{userLocation ? ` (${userLocation})` : ""}
            <button
              type="button"
              onClick={() => setShowLocationSelector(!showLocationSelector)}
              style={{
                marginLeft: 8,
                background: "none",
                border: "none",
                color: "#d4af37",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              Change
            </button>
          </span>
          <span>₹{shippingCharge.toLocaleString("en-IN")}</span>
        </div>
        {showLocationSelector && (
          <div className="order-item" style={{ display: "block" }}>
            <select
              value={userLocation}
              onChange={(e) => {
                const city = e.target.value;
                setUserLocation(city);
                setShippingCharge(calculateShipping(city));
                setShowLocationSelector(false);
              }}
              style={{
                width: "100%",
                padding: "0.6rem",
                borderRadius: 6,
                border: "1px solid #ddd",
              }}
            >
              <option value="">Select your city</option>
              <option value="delhi">Delhi - ₹50</option>
              <option value="mumbai">Mumbai - ₹60</option>
              <option value="bangalore">Bangalore - ₹70</option>
              <option value="chennai">Chennai - ₹80</option>
              <option value="kolkata">Kolkata - ₹90</option>
              <option value="hyderabad">Hyderabad - ₹75</option>
              <option value="pune">Pune - ₹65</option>
              <option value="ahmedabad">Ahmedabad - ₹85</option>
              <option value="jaipur">Jaipur - ₹95</option>
              <option value="lucknow">Lucknow - ₹100</option>
              <option value="default">Other Cities - ₹120</option>
            </select>
          </div>
        )}
        <div className="order-total">
          <strong>
            Total: ₹{(totalAmount + shippingCharge).toLocaleString("en-IN")}
          </strong>
        </div>
      </div>
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
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
          {errors.address && <p className="error">{errors.address}</p>}
        </div>
        <div>
          <label>Payment Mode:</label>
          <select
            name="paymentMode"
            value={formData.paymentMode}
            onChange={handlePaymentModeChange}
          >
            <option value="">--Select--</option>
            <option value="gpay">GPay</option>
            {/* <option value="debit">Debit Card</option> */}
            <option value="cod">Cash on Delivery</option>
          </select>
          {errors.paymentMode && <p className="error">{errors.paymentMode}</p>}
          {/* GPay QR Code Section */}
          {formData.paymentMode === "gpay" && (
            <div className="gpay-section">
              <p>Pay using Google Pay:</p>
              <button
                type="button"
                onClick={handleGPayClick}
                className="gpay-btn"
              >
                Show QR Code
              </button>
              {showQRCode && (
                <div className="qr-code-section">
                  <div className="qr-code">
                    <QRCodeCanvas
                      value={generateUPIURL()}
                      size={200}
                      level="M"
                      includeMargin={true}
                    />
                  </div>
                  <div className="payment-details">
                    <p>
                      <strong>Amount: ₹{(totalAmount + shippingCharge).toLocaleString("en-IN")}</strong>
                    </p>
                    <p>UPI ID: sreedevirajkumar03@oksbi</p>
                    <p>Merchant: glint Candles</p>
                  </div>
                  <p className="qr-instructions">
                    Scan this QR code with your Google Pay, PhonePe, or any UPI
                    app to complete the payment
                  </p>
                  <div className="payment-options">
                    <p>Or pay directly:</p>
                    <button
                      type="button"
                      onClick={openUPIApp}
                      className="upi-pay-btn"
                    >
                      Open UPI App
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Payment Reference Input */}
          {(formData.paymentMode === "gpay" ||
            formData.paymentMode === "debit") && (
            <div className="payment-reference-section">
              <label>Payment Reference/Transaction ID:</label>
              <div className="payment-reference-input">
                <input
                  name="paymentReference"
                  value={formData.paymentReference}
                  onChange={handleChange}
                  placeholder="Enter transaction ID or reference number"
                  className="reference-input"
                />
                <button
                  type="button"
                  onClick={verifyPayment}
                  className="verify-btn"
                  disabled={!formData.paymentReference.trim()}
                >
                  Verify Payment
                </button>
              </div>
              {errors.paymentReference && (
                <p className="error">{errors.paymentReference}</p>
              )}
              {paymentVerified && (
                <div className="payment-verified">
                  <span className="verified-icon">✅</span>
                  <span className="verified-text">
                    Payment Verified Successfully!
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={
            loading || (formData.paymentMode !== "cod" && !paymentVerified)
          }
          className={
            paymentVerified || formData.paymentMode === "cod"
              ? "submit-btn-enabled"
              : "submit-btn-disabled"
          }
        >
          {loading ? "Placing Order..." : "Place Order"}
        </button>
      </form>
      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default Checkout;



