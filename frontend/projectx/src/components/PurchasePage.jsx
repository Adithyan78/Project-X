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

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

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
        descriptionRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  const closeDescription = () => {
    setShowDescription(false);
  };

  const handlePurchase = async () => {
    if (!userName || !userEmail) {
      alert("Please enter your name and email before purchasing.");
      return;
    }

    setPurchasing(true);

    try {
      // Create order on backend
      const orderRes = await axios.post("http://localhost:5000/create-order", {
        amount: project.price * 100, // amount in paise
        currency: "INR",
      });

      const { id: orderId, currency, amount } = orderRes.data;

      // Open Razorpay checkout
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

            alert("Payment successful! Download link: " + purchaseRes.data.link);
          } catch (err) {
            console.error("Purchase error:", err);
            alert("Payment succeeded but something went wrong: " + err.response?.data?.error);
          }
        },
        prefill: {
          name: userName,
          email: userEmail,
        },
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

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading project details...</p>
    </div>
  );

  if (!project) return (
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
          {/* Image Gallery Section */}
          <div className="image-section">
            <div className="main-image">
              <img 
                src={project.thumbnailUrl} 
                alt={project.name} 
                className="project-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x400/1a1a1a/4a6cf7?text=Project+Image';
                }}
              />
            </div>
          </div>

          {/* Product Details Section */}
          <div className="details-section">
            <div className="breadcrumb">
              <span>Projects</span>
              <span className="divider">/</span>
              <span>{project.category || 'Development'}</span>
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
                {showDescription ? 'Hide Description' : 'Click to View Full Description'}
                <span className="arrow-icon">{showDescription ? '↑' : '↓'}</span>
              </button>
            </div>

            {/* User details inputs */}
            <div className="user-details">
              <label>
                Name:
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                />
              </label>
              <label>
                Email:
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </label>
            </div>

            <div className="pricing-section">
              <div className="price-container">
                <span className="price-label">One-time Payment</span>
                <h2 className="project-price">₹{project.price}</h2>
                <span className="price-note">No hidden fees</span>
              </div>

              <div className="purchase-actions">
                <button 
                  className={`purchase-button ${purchasing ? 'purchasing' : ''}`}
                  onClick={handlePurchase}
                  disabled={purchasing}
                >
                  {purchasing ? (
                    <>
                      <span className="button-spinner"></span>
                      Processing...
                    </>
                  ) : (
                    'Purchase Now'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information Section - Description Only */}
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
                      <span className="item-icon">📁</span>
                      <span>Source Files</span>
                    </div>
                    <div className="included-item">
                      <span className="item-icon">🛠️</span>
                      <span>Setup Guide</span>
                    </div>
                    <div className="included-item">
                      <span className="item-icon">📚</span>
                      <span>PPTs</span>
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
