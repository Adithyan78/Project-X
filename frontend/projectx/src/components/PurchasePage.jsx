import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import '../styles/PurchasePage.css';

const PurchasePage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState('');

  const descriptionRef = useRef(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/projects/${id}`);
        setProject(res.data);
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const toggleDescription = () => {
    const willShow = !showDescription;
    setShowDescription(willShow);
    setTimeout(() => {
      if (willShow && descriptionRef.current) {
        descriptionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const closeDescription = () => setShowDescription(false);

  const startPurchase = () => setShowForm(true);

  // Step 1: Submit Name + Email, then send OTP
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!userName || !userEmail) {
      alert("Please enter your name and email");
      return;
    }

    try {
      await axios.post("http://localhost:5000/otp/send", { email: userEmail });
      setShowForm(false);
      setShowOtpForm(true);
    } catch (err) {
      console.error("OTP send error:", err);
      alert("Failed to send OTP. Try again.");
    }
  };

  // Step 2: Verify OTP, then open Razorpay
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      alert("Please enter the OTP");
      return;
    }

    try {
      await axios.post("http://localhost:5000/otp/verify", {
        email: userEmail,
        otp,
      });
      setShowOtpForm(false);
      openRazorpay();
    } catch (err) {
      console.error("OTP verification error:", err);
      alert(err.response?.data?.error || "Invalid OTP");
    }
  };

  const openRazorpay = async () => {
    setPurchasing(true);
    try {
      const orderRes = await axios.post("http://localhost:5000/create-order", {
        amount: project.price * 100,
        currency: "INR",
      });

      const { id: orderId, currency, amount } = orderRes.data;

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY,
        amount,
        currency,
        name: project.name,
        description: "Purchase project",
        order_id: orderId,
        handler: async function (response) {
          try {
            const purchaseRes = await axios.post("http://localhost:5000/purchase", {
              name: userName,
              email: userEmail,
              projectId: project.id,
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });

            alert(
              "✅ Payment successful! Download link sent to your email: " 
               
            );
          } catch (err) {
            console.error("Purchase error:", err);
            alert("Payment succeeded but something went wrong: " + err.response?.data?.error);
          }
        },
        prefill: { name: userName, email: userEmail },
        theme: { color: "#4a6cf7" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Order creation error:", err);
      alert("Failed to create order: " + err.response?.data?.error);
    } finally {
      setPurchasing(false);
    }
  };

  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading project details...</p>
      </div>
    );

  if (!project)
    return (
      <div className="error-container">
        <h2>Project Not Found</h2>
        <p>The project you're looking for doesn't exist or has been removed.</p>
      </div>
    );

  return (
    <div className="purchase-page">
      <Navbar />
      <div className="purchase-container">
        <div className="purchase-content">
          {/* Image Section */}
          <div className="image-section">
            <div className="main-image">
              <img
                src={project.thumbnailUrl}
                alt={project.name}
                className="project-image"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/600x400/1a1a1a/4a6cf7?text=Project+Image";
                }}
              />
            </div>
          </div>

          {/* Product Details Section */}
          <div className="details-section">
            <div className="breadcrumb">
              <span>Projects</span>
              <span className="divider">/</span>
              <span>{project.category || "Development"}</span>
              <span className="divider">/</span>
              <span className="current">{project.name}</span>
            </div>

            <h1 className="project-title">{project.name}</h1>

            <div className="project-meta">
              <span className={`project-type ${project.type?.toLowerCase()}`}>
                {project.type}
              </span>
              <div className="rating">
                <span className="stars">★★★★★</span>
                <span className="rating-text">(4.8/5.0)</span>
              </div>
            </div>

            <div className="description-preview">
              <p>{project.description.substring(0, 100)}...</p>
              <button className="view-description-btn" onClick={toggleDescription}>
                {showDescription ? "Hide Description" : "Click to View Full Description"}
                <span className="arrow-icon">{showDescription ? "↑" : "↓"}</span>
              </button>
            </div>

            <div className="pricing-section">
              <div className="price-container">
                <span className="price-label">One-time Payment</span>
                <h2 className="project-price">₹{project.price}</h2>
                <span className="price-note">No hidden fees</span>
              </div>

              <div className="purchase-actions">
                <button
                  className={`purchase-button ${purchasing ? "purchasing" : ""}`}
                  onClick={startPurchase}
                  disabled={purchasing}
                >
                  {purchasing ? (
                    <>
                      <span className="button-spinner"></span>
                      Processing...
                    </>
                  ) : (
                    "Purchase Now"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Name + Email Popup Form */}
        {showForm && (
          <div className="popup-overlay">
            <div className="popup-form">
              <h2>Complete Your Purchase</h2>
              <p>Enter your details to proceed</p>
              <form onSubmit={handleFormSubmit}>
                <div className="form-group">
                  <label htmlFor="userName">Full Name</label>
                  <input
                    id="userName"
                    type="text"
                    className="form-input"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your full name"
                    autoFocus
                  />
                  <span className="input-icon">👤</span>
                </div>
                <div className="form-group">
                  <label htmlFor="userEmail">Email Address</label>
                  <input
                    id="userEmail"
                    type="email"
                    className="form-input"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="Enter your email address"
                  />
                  <span className="input-icon">✉️</span>
                </div>
                <div className="popup-actions">
                  <button type="submit" className="submit-btn">
                    Continue
                    <span className="arrow-icon">→</span>
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                </div>
                <div className="form-footer">
                  Your information is secure and will only be used for this transaction
                </div>
              </form>
            </div>
          </div>
        )}

        {/* OTP Popup Form */}
        {showOtpForm && (
          <div className="popup-overlay">
            <div className="popup-form">
              <h2>Verify OTP</h2>
              <p>Enter the OTP sent to {userEmail}</p>
              <form onSubmit={handleOtpSubmit}>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-input"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    autoFocus
                  />
                </div>
                <div className="popup-actions">
                  <button type="submit" className="submit-btn">
                    Verify OTP
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowOtpForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Description Section */}
        <div ref={descriptionRef}>
          {showDescription && (
            <div className="additional-info">
              <div className="info-header">
                <h2>Project Description</h2>
                <button className="close-description" onClick={closeDescription}>
                  ×
                </button>
              </div>
              <div className="description-content">
                <p>{project.description}</p>
                <div className="description-details">
                  <h3>What's Included</h3>
                  <div className="included-items">
                    <div className="included-item">
                      <span className="item-icon">📁</span> Source Files
                    </div>
                    <div className="included-item">
                      <span className="item-icon">🛠️</span> Setup Guide
                    </div>
                    <div className="included-item">
                      <span className="item-icon">📚</span> PPTs
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchasePage;
