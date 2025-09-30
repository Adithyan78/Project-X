import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
  const [visibleCards, setVisibleCards] = useState([false, false, false]);

  const navigate = useNavigate();
  const goToProjects = () => {
    navigate("/projects");
  }

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Show cards when user scrolls past a certain point
      if (scrollPosition > windowHeight * 0.3) {
        setVisibleCards([true, false, false]);
      }
      if (scrollPosition > windowHeight * 0.4) {
        setVisibleCards([true, true, false]);
      }
      if (scrollPosition > windowHeight * 0.5) {
        setVisibleCards([true, true, true]);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="home-container">
      <Navbar />
      <header className="hero-section" id="home">
        <div className="hero-content-centered">
          <div className="hero-text">
            <h1>Quality Projects For Your Academic Success</h1>
            <p>
              Browse my collection of well-documented, ready-to-use academic projects 
              across various domains to accelerate your learning and achievement.
            </p>
          </div>
          <div className="hero-buttons">
            <button className="hero-btn primary-btn" onClick={goToProjects}>View Projects</button>
            <button className="hero-btn secondary-btn">Contact Us</button>
          </div>
          
          <div className="scroll-indicator-centered">
            <span>Scroll down to explore</span>
            <div className="mouse">
              <div className="wheel"></div>
            </div>
          </div>
        </div>
        
        <div className="hero-background">
          <div className="bg-shape bg-shape-1"></div>
          <div className="bg-shape bg-shape-2"></div>
          <div className="bg-shape bg-shape-3"></div>
        </div>
      </header>

      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose Our Projects?</h2>
            <p>Designed to help students excel in their academic journey</p>
          </div>
          <div className="features-container">
            <div className={`feature-card ${visibleCards[0] ? 'visible' : ''}`}>
              <div className="card-icon">🚀</div>
              <h3>Ready to Implement</h3>
              <p>Fully functional projects with clean code and clear documentation</p>
              <div className="card-hover-content">
                <ul>
                  <li>Complete source code</li>
                  <li>Step-by-step instructions</li>
                  <li>Easy to customize</li>
                </ul>
              </div>
            </div>
            
            <div className={`feature-card ${visibleCards[1] ? 'visible' : ''}`}>
              <div className="card-icon">💡</div>
              <h3>Innovative Solutions</h3>
              <p>Creative approaches to common academic project requirements</p>
              <div className="card-hover-content">
                <ul>
                  <li>Unique project ideas</li>
                  <li>Modern technologies</li>
                  <li>Creative problem-solving</li>
                </ul>
              </div>
            </div>
            
            <div className={`feature-card ${visibleCards[2] ? 'visible' : ''}`}>
              <div className="card-icon">📞</div>
              <h3>Ongoing Support</h3>
              <p>Get help and guidance even after purchasing the project</p>
              <div className="card-hover-content">
                <ul>
                  <li>Quick response time</li>
                  <li>Clarification of concepts</li>
                  <li>Troubleshooting help</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="project-showcase">
        <div className="container">
          <div className="section-header">
            <h2>Featured Project Categories</h2>
            <p>Explore projects across different domains and technologies</p>
          </div>
          <div className="category-cards">
            <div className="category-card">
              <div className="category-header">
                <div className="category-icon">🤖</div>
                <h3>AI & Machine Learning</h3>
              </div>
              <p>Intelligent systems, predictive models, and data analysis projects</p>
              <button className="category-btn">View Projects</button>
            </div>
            
            <div className="category-card">
              <div className="category-header">
                <div className="category-icon">🌐</div>
                <h3>Web Development</h3>
              </div>
              <p>Responsive websites and web applications</p>
              <button className="category-btn">View Projects</button>
            </div>
            
            <div className="category-card">
              <div className="category-header">
                <div className="category-icon">📱</div>
                <h3>Mobile Applications</h3>
              </div>
              <p>iOS and Android apps with modern UI/UX and functionality</p>
              <button className="category-btn">View Projects</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;