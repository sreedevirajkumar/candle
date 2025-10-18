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
  const [showQRCode, setShowQRCode] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const navigate = useNavigate();

  // Load cart items and calculate total
  useEffect(() => {
    const loadCartData = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/cart/items");
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
      }
    };
    loadCartData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.paymentMode) newErrors.paymentMode = "Select a payment mode";
    if (!formData.email.trim()) newErrors.email = "Email is required";

    // Payment reference validation based on payment mode
    if (formData.paymentMode === "gpay" || formData.paymentMode === "debit") {
      if (!formData.paymentReference.trim()) {
        newErrors.paymentReference =
          "Payment reference/transaction ID is required";
      } else if (formData.paymentReference.trim().length < 8) {
        newErrors.paymentReference =
          "Payment reference must be at least 8 characters";
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

        // Send order to backend
        const response = await axios.post(
          "http://localhost:3000/api/order",
          orderData
        );

        // Clear cart after successful order
        await fetch("http://localhost:3000/api/cart/clear", {
          method: "DELETE",
        });

        setLoading(false);

        // Show success toast
        toast.success(
          "✅ Order placed successfully! Email confirmation sent.",
          {
            position: "top-center",
            autoClose: 3000,
          }
        );

        // Navigate after a short delay
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
      // Show validation error toast
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

  // Verify payment reference
  const verifyPayment = async () => {
    if (!formData.paymentReference.trim()) {
      toast.error("❌ Please enter payment reference number", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    try {
      // Simulate payment verification API call
      const response = await fetch("http://localhost:3000/api/payment/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentReference: formData.paymentReference,
          amount: totalAmount,
          paymentMode: formData.paymentMode,
        }),
      });

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

  // Generate UPI payment URL
  const generateUPIURL = () => {
    const upiId = "sreedevirajkumar03@oksbi";
    const merchantName = "sreedevi rajkumar";
    const transactionNote = `Order Payment - ${formData.name}`;
    const amount = totalAmount;

    // UPI URL format: upi://pay?pa=UPI_ID&pn=MERCHANT_NAME&tn=TRANSACTION_NOTE&am=AMOUNT&cu=INR
    return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
      merchantName
    )}&tn=${encodeURIComponent(transactionNote)}&am=1&cu=INR`;
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
            <span>${item.price * item.quantity}</span>
          </div>
        ))}
        <div className="order-total">
          <strong>Total: ${totalAmount}</strong>
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
            <option value="debit">Debit Card</option>
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
                      <strong>Amount: ${totalAmount}</strong>
                    </p>
                    <p>UPI ID: sreedevirajkumar03@oksbi</p>
                    <p>Merchant: Luxe Candles</p>
                  </div>
                  <p className="qr-instructions">
                    Scan this QR code with your Google Pay, PhonePe, or any UPI
                    app to complete the payment
                  </p>
                  <div className="payment-options">
                    <p>Or pay directly:</p>
                    <button
                      type="button"
                      onClick={() => window.open(generateUPIURL(), "_blank")}
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
