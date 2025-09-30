import React, { useState } from 'react';
import '../styles/Sidebar.css';

const Sidebar = ({ onCategorySelect, selectedCategory }) => {
  const categories = [
    { id: 'all', name: 'All Projects', icon: 'fas fa-folder' },
    { id: 'fullstack', name: 'Full Stack', icon: 'fas fa-layer-group' },
    { id: 'java', name: 'Java Projects', icon: 'fab fa-java' },
    { id: 'portfolios', name: 'Portfolios', icon: 'fas fa-briefcase' },
    { id: 'ml', name: 'Machine Learning', icon: 'fas fa-brain' },
    { id: 'cybersecurity', name: 'Cyber Security', icon: 'fas fa-shield-alt' },
    { id: 'custom', name: 'Custom Projects', icon: 'fas fa-star' }
  ];

  const handleCategoryClick = (categoryId) => {
    onCategorySelect(categoryId === 'all' ? '' : categoryId);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>
          <i className="fas fa-filter"></i>
          Filters
        </h2>
        <button className="close-sidebar">
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="sidebar-section">
        <h3 className="section-title">
          <i className="fas fa-tags"></i>
          Projects
        </h3>
        <ul className="filter-options">
          {categories.map(category => (
            <li key={category.id}>
              <div 
                className={`filter-option ${selectedCategory === category.id ? 'active' : ''} ${category.id === 'custom' ? 'custom-project' : ''}`}
                onClick={() => handleCategoryClick(category.id)}
              >
                <i className={category.icon}></i>
                <span>{category.name}</span>
                {category.id === 'custom' && <div className="custom-badge">New</div>}
              </div>
            </li>
          ))}
        </ul>
      </div>

     
    </div>
  );
};

export default Sidebar;