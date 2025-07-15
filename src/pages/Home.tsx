import React from 'react';
import reactLogo from '../assets/react.svg';
import viteLogo from '/vite.svg';
import { Link } from 'react-router-dom';
import './Home.scss';
import profileImage from '../../public/images/profile_pic.jpg';
import gif1 from '../../public/images/gif/chicken.gif';
import gif2 from '../../public/images/gif/panda.gif';
import gif3 from '../../public/images/gif/poo.gif';
import gif4 from '../../public/images/gif/unicorn.gif';

const Home: React.FC = () => {
  const gifs = [
    { id: 1, src: gif1, title: 'Chicken' },
    { id: 2, src: gif2, title: 'panda' },
    { id: 3, src: gif3, title: 'poo' },
    { id: 4, src: gif4, title: 'unicorn' },
  ];

  return (
    <div className="home-container">
      {/* Welcome Section */}
      <div className="welcome-section">
        <img src={viteLogo} className="logo" alt="Vite logo" />
        <img src={reactLogo} className="logo react" alt="React logo" />
        <h1>Welcome to Rishabh Dashboard</h1>
        <p>Manage your website efficiently with React + Vite tools.</p>
        
        {/* GIF Gallery Section */}
        <div className="gif-gallery-section">
          <div className="gif-grid">
            {gifs.map((gif) => (
              <div key={gif.id} className="gif-card">
                <div className="gif-container">
                  <img 
                    src={gif.src} 
                    alt={gif.title} 
                    className="gif-item"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      
        <div className="action-buttons">
          <Link to="/info" className="info-page-button">
            <i className="fas fa-chart-line"></i> Checkout Info to know more
          </Link>
          <Link to="/" className="profile-page-button">
            <i className="fas fa-user"></i> View My Profile below
          </Link>
        </div>
      </div>

      {/* Enhanced Profile Section */}
      <div className="profile-section">
        <h2>My Profile</h2>
        <div className="profile-card">
          <div className="profile-header">
            <div className="avatar-container">
              <img src={profileImage} alt="Profile" className="profile-image" />
              <div className="profile-info">
                <h3>Rishabh Kumar Gupta</h3>
                <p className="title">Software Developer - Frontend</p>
                <p className="bio">Creating beautiful and functional user interfaces with React and TypeScript.</p>
              </div>
            </div>
          </div>
          
          <div className="social-links">
            <a href="https://github.com/rajrishabhkr" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-github"></i> GitHub
            </a>
            <a href="https://linkedin.com/in/rajrishabhkr" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-linkedin"></i> LinkedIn
            </a>
            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-twitter"></i> Twitter
            </a>
            <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-instagram"></i> Instagram
            </a>
          </div>
          
          <div className="profile-details">
            <div className="detail-item">
              <span className="label">Email:</span>
              <span className="value">rajrishabhkr@gmail.com</span>
            </div>
            <div className="detail-item">
              <span className="label">Location:</span>
              <span className="value">Patna, India</span>
            </div>
            <div className="detail-item">
              <span className="label">Skills:</span>
              <span className="value">React, Vue, JavaScript, TypeScript, Java, Node.js</span>
            </div>
            <div className="detail-item">
              <span className="label">Experience:</span>
              <span className="value">3+ years in web development.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;