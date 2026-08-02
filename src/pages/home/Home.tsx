import React, { useState, useEffect } from 'react';
import reactLogo from '../../assets/react.svg';
import wolfLogo from '../../../public/images/logo/wolf.png';
import viteLogo from '/vite.svg';
import { Link } from 'react-router-dom';
import './Home.scss';
import profileImage from '../../../public/images/profile_pic.jpg';
import gif1 from '../../../public/images/gif/chicken.gif';
import gif2 from '../../../public/images/gif/panda.gif';
import gif3 from '../../../public/images/gif/poo.gif';
import gif4 from '../../../public/images/gif/unicorn.gif';

const TooltipWrapper: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="tooltip-container" title={title}>
    {children}
  </div>
);

const Home: React.FC = () => {
  const gifs = [
    { id: 1, src: gif1, title: 'Chicken' },
    { id: 2, src: gif2, title: 'Panda' },
    { id: 3, src: gif3, title: 'Poo' },
    { id: 4, src: gif4, title: 'Unicorn' },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying] = useState(true);
  const [selectedLogo, setSelectedLogo] = useState<{ src: string; title: string } | null>(null);

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % gifs.length);
    }, 2000); // Change GIF every 2 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, gifs.length]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + gifs.length) % gifs.length);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % gifs.length);
  };

  const goToGif = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="home-container">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="logos-row">
          <TooltipWrapper title="Click to enlarge Vite Logo">
            <img
              src={viteLogo}
              className="logo vite-logo clickable-logo"
              alt="Vite logo"
              onClick={() => setSelectedLogo({ src: viteLogo, title: 'Vite Build Tool' })}
            />
          </TooltipWrapper>

          <TooltipWrapper title="Click to enlarge Rishabh Tech Logo">
            <img
              src={wolfLogo}
              className="logo rishabh-brand-logo centerpiece-logo clickable-logo"
              alt="Rishabh Tech logo"
              onClick={() => setSelectedLogo({ src: wolfLogo, title: 'Rishabh Tech Brand Logo' })}
            />
          </TooltipWrapper>

          <TooltipWrapper title="Click to enlarge React Logo">
            <img
              src={reactLogo}
              className="logo react clickable-logo"
              alt="React logo"
              onClick={() => setSelectedLogo({ src: reactLogo, title: 'React Framework' })}
            />
          </TooltipWrapper>
        </div>

        {selectedLogo && (
          <div className="modal-overlay" onClick={() => setSelectedLogo(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <img src={selectedLogo.src} alt={selectedLogo.title} />
              <h3>{selectedLogo.title}</h3>
              <button onClick={() => setSelectedLogo(null)}>Close</button>
            </div>
          </div>
        )}

        <h1>Welcome to Rishabh Tech</h1>
        <p>Manage your web ecosystem efficiently with modern tools & analytics.</p>
        
        {/* GIF Carousel Section */}
        <div className="gif-carousel-section">
          <div className="gif-carousel">
            <button className="carousel-button prev" onClick={goToPrevious}>
              &lt;
            </button>
            
            <div className="carousel-slide">
              <img 
                src={gifs[currentIndex].src} 
                alt={gifs[currentIndex].title} 
                className="gif-item"
              />
              <div className="carousel-caption">{gifs[currentIndex].title}</div>
            </div>
            
            <button className="carousel-button next" onClick={goToNext}>
              &gt;
            </button>
          </div>
          
          <div className="carousel-indicators">
            {gifs.map((gif, index) => (
              <button
                key={gif.id}
                className={`indicator ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToGif(index)}
              />
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