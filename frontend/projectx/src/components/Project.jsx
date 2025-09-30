import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom'; // ✅ navigation
import '../styles/Project.css';

const Project = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get('http://localhost:5000/projects'); 
        setProjects(res.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    fetchProjects();
  }, []);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const filteredProjects = selectedCategory
    ? projects.filter(project => project.type?.includes(selectedCategory))
    : projects;

  return (
    <div className="projects-page">
      <Navbar />
      
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>
      
      <div className="projects-layout">
        <div className="projects-content">
          <div className="content-header">
            <button className="sidebar-toggle" onClick={toggleSidebar}>
              <i className="fas fa-filter"></i> Filters
            </button>
            <h1>
              {selectedCategory ? `Projects - ${selectedCategory}` : 'All Projects'}
              {selectedCategory && (
                <button 
                  className="clear-filter"
                  onClick={() => setSelectedCategory('')}
                >
                  Clear filter
                </button>
              )}
            </h1>
          </div>
          
          <div className="projects-grid">
            {filteredProjects.length > 0 ? (
              filteredProjects.map(project => (
                <div 
                  key={project.id} 
                  className="project-card"
                  onClick={() => navigate(`/purchase/${project.id}`)} // ✅ navigate on click
                  style={{ cursor: "pointer" }}
                >
                  <img 
                    src={project.thumbnailUrl} 
                    alt={project.name} 
                    className="project-image"
                  />
                </div>
              ))
            ) : (
              <div className="no-projects">
                <i className="fas fa-folder-open"></i>
                <h3>No projects found</h3>
                <p>Try selecting a different category or clearing your filters</p>
              </div>
            )}
          </div>
        </div>

        <div className={`sidebar-container ${isSidebarOpen ? 'mobile-open' : ''}`}>
          <Sidebar 
            onCategorySelect={handleCategorySelect} 
            selectedCategory={selectedCategory}
          />
        </div>
      </div>
    </div>
  );
};

export default Project;
