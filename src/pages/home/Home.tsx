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
import { useToast } from '../../components/layout/ToastContext';

const TooltipWrapper: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="tooltip-container" title={title}>
    {children}
  </div>
);

const Home: React.FC = () => {
  const { showToast } = useToast();
  const gifs = [
    { id: 1, src: gif1, title: 'Chicken' },
    { id: 2, src: gif2, title: 'Panda' },
    { id: 3, src: gif3, title: 'Poo' },
    { id: 4, src: gif4, title: 'Unicorn' },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying] = useState(true);
  const [selectedLogo, setSelectedLogo] = useState<{ src: string; title: string } | null>(null);
  const [socialDropdownOpen, setSocialDropdownOpen] = useState(false);

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

  const openLogoModal = (src: string, title: string) => {
    setSelectedLogo({ src, title });
    showToast(`Enlarged ${title} Logo`, 'info');
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
              onClick={() => openLogoModal(viteLogo, 'Vite Build Tool')}
            />
          </TooltipWrapper>

          <TooltipWrapper title="Click to enlarge Rishabh Tech Logo">
            <img
              src={wolfLogo}
              className="logo rishabh-brand-logo centerpiece-logo clickable-logo"
              alt="Rishabh Tech logo"
              onClick={() => openLogoModal(wolfLogo, 'Rishabh Tech Brand')}
            />
          </TooltipWrapper>

          <TooltipWrapper title="Click to enlarge React Logo">
            <img
              src={reactLogo}
              className="logo react clickable-logo"
              alt="React logo"
              onClick={() => openLogoModal(reactLogo, 'React Framework')}
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
          <Link to="/info" className="info-page-button" onClick={() => showToast('Opening Info page', 'info')}>
            <i className="fas fa-chart-line"></i> Checkout Info to know more
          </Link>
          <a href="#profile" className="profile-page-button">
            <i className="fas fa-user"></i> View My Profile below
          </a>
        </div>

        {/* All Sidebar Menu Shortcuts Section */}
        <div className="shortcuts-section">
          <h2 className="shortcuts-title">
            <i className="fas fa-th-large"></i> Quick Sidebar Navigation
          </h2>
          <p className="shortcuts-subtitle">Instant shortcuts to all pages, tools, mini games, & school directories</p>
          
          <div className="shortcuts-categories">
            <div className="shortcut-group">
              <h3><i className="fas fa-school"></i> School Info Directory</h3>
              <div className="shortcut-grid">
                <Link to="/students" className="shortcut-card" onClick={() => showToast('Opening Students Directory', 'info')}>
                  <div className="shortcut-icon students-icon"><i className="fas fa-user-graduate"></i></div>
                  <div className="shortcut-text">
                    <span className="shortcut-label">Students</span>
                    <span className="shortcut-desc">Grade & Scholar Info</span>
                  </div>
                </Link>
                <Link to="/teachers" className="shortcut-card" onClick={() => showToast('Opening Teachers Directory', 'info')}>
                  <div className="shortcut-icon teachers-icon"><i className="fas fa-chalkboard-teacher"></i></div>
                  <div className="shortcut-text">
                    <span className="shortcut-label">Teachers</span>
                    <span className="shortcut-desc">Faculty & Subjects</span>
                  </div>
                </Link>
                <Link to="/attendance" className="shortcut-card" onClick={() => showToast('Opening Attendance Tracker', 'info')}>
                  <div className="shortcut-icon attendance-icon"><i className="fas fa-calendar-check"></i></div>
                  <div className="shortcut-text">
                    <span className="shortcut-label">Attendance</span>
                    <span className="shortcut-desc">Daily Presence Status</span>
                  </div>
                </Link>
              </div>
            </div>

            <div className="shortcut-group">
              <h3><i className="fas fa-chart-line"></i> Tools & Stocks</h3>
              <div className="shortcut-grid">
                <Link to="/ipolist" className="shortcut-card" onClick={() => showToast('Opening IPO Watchlist', 'info')}>
                  <div className="shortcut-icon ipo-icon"><i className="fas fa-coins"></i></div>
                  <div className="shortcut-text">
                    <span className="shortcut-label">IPO List</span>
                    <span className="shortcut-desc">Market Listings & Sizes</span>
                  </div>
                </Link>
                <Link to="/calculator" className="shortcut-card" onClick={() => showToast('Opening Smart Calculator', 'info')}>
                  <div className="shortcut-icon calc-icon"><i className="fas fa-calculator"></i></div>
                  <div className="shortcut-text">
                    <span className="shortcut-label">Calculator</span>
                    <span className="shortcut-desc">Financial Math Engine</span>
                  </div>
                </Link>
                <Link to="/counter" className="shortcut-card" onClick={() => showToast('Opening Digital Counter', 'info')}>
                  <div className="shortcut-icon counter-icon"><i className="fas fa-plus-circle"></i></div>
                  <div className="shortcut-text">
                    <span className="shortcut-label">Digital Counter</span>
                    <span className="shortcut-desc">Step Tally & Reset</span>
                  </div>
                </Link>
                <Link to="/stopwatch" className="shortcut-card" onClick={() => showToast('Opening Precision Stopwatch', 'info')}>
                  <div className="shortcut-icon watch-icon"><i className="fas fa-stopwatch"></i></div>
                  <div className="shortcut-text">
                    <span className="shortcut-label">Stopwatch</span>
                    <span className="shortcut-desc">Lap Timer & Splits</span>
                  </div>
                </Link>
              </div>
            </div>

            <div className="shortcut-group">
              <h3><i className="fas fa-gamepad"></i> Mini Games Suite</h3>
              <div className="shortcut-grid">
                <Link to="/tictactoe" className="shortcut-card" onClick={() => showToast('Launching Tic Tac Toe', 'info')}>
                  <div className="shortcut-icon game-icon"><i className="fas fa-gamepad"></i></div>
                  <div className="shortcut-text">
                    <span className="shortcut-label">Tic Tac Toe</span>
                    <span className="shortcut-desc">Classic 2-Player Match</span>
                  </div>
                </Link>
                <Link to="/3dcube" className="shortcut-card" onClick={() => showToast('Launching 3D Cube', 'info')}>
                  <div className="shortcut-icon cube-icon"><i className="fas fa-cube"></i></div>
                  <div className="shortcut-text">
                    <span className="shortcut-label">3D Cube</span>
                    <span className="shortcut-desc">WebGL Interactive Mesh</span>
                  </div>
                </Link>
                <Link to="/rubiks-cube" className="shortcut-card" onClick={() => showToast('Launching Rubiks Cube', 'info')}>
                  <div className="shortcut-icon rubik-icon"><i className="fas fa-border-all"></i></div>
                  <div className="shortcut-text">
                    <span className="shortcut-label">Rubik's Cube</span>
                    <span className="shortcut-desc">3x3 Magic Face Rotations</span>
                  </div>
                </Link>
                <Link to="/snake" className="shortcut-card" onClick={() => showToast('Launching Snake Game', 'info')}>
                  <div className="shortcut-icon snake-icon"><i className="fas fa-dragon"></i></div>
                  <div className="shortcut-text">
                    <span className="shortcut-label">Snake Game</span>
                    <span className="shortcut-desc">Golden Food & Wrap Mode</span>
                  </div>
                </Link>
                <Link to="/memory-match" className="shortcut-card" onClick={() => showToast('Launching Memory Match', 'info')}>
                  <div className="shortcut-icon memory-icon"><i className="fas fa-brain"></i></div>
                  <div className="shortcut-text">
                    <span className="shortcut-label">Memory Match</span>
                    <span className="shortcut-desc">Pairs & Star Rating</span>
                  </div>
                </Link>
                <Link to="/color-rush" className="shortcut-card" onClick={() => showToast('Launching Color Rush', 'info')}>
                  <div className="shortcut-icon color-icon"><i className="fas fa-palette"></i></div>
                  <div className="shortcut-text">
                    <span className="shortcut-label">Color Rush</span>
                    <span className="shortcut-desc">Streak Combo Blitz</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Profile Section */}
      <div className="profile-section" id="profile">
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
          
          {/* Desktop Social Links */}
          <div className="social-links desktop-only">
            <a href="https://github.com/rajrishabhkr" target="_blank" rel="noopener noreferrer" onClick={() => showToast('Opening GitHub profile', 'info')}>
              <i className="fab fa-github"></i> GitHub
            </a>
            <a href="https://linkedin.com/in/rajrishabhkr" target="_blank" rel="noopener noreferrer" onClick={() => showToast('Opening LinkedIn profile', 'info')}>
              <i className="fab fa-linkedin"></i> LinkedIn
            </a>
            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" onClick={() => showToast('Opening Twitter profile', 'info')}>
              <i className="fab fa-twitter"></i> Twitter
            </a>
            <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" onClick={() => showToast('Opening Instagram profile', 'info')}>
              <i className="fab fa-instagram"></i> Instagram
            </a>
          </div>

          {/* Mobile Social Links Custom Dropdown */}
          <div className="social-dropdown-wrapper mobile-only">
            <button
              className="social-dropdown-btn"
              onClick={() => setSocialDropdownOpen(!socialDropdownOpen)}
            >
              <i className="fas fa-share-alt"></i> Connect via Social Media
              <i className={`fas fa-chevron-${socialDropdownOpen ? 'up' : 'down'}`}></i>
            </button>

            {socialDropdownOpen && (
              <div className="social-dropdown-menu">
                <a
                  href="https://github.com/rajrishabhkr"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    showToast('Opening GitHub profile', 'info');
                    setSocialDropdownOpen(false);
                  }}
                >
                  <i className="fab fa-github"></i> GitHub
                </a>
                <a
                  href="https://linkedin.com/in/rajrishabhkr"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    showToast('Opening LinkedIn profile', 'info');
                    setSocialDropdownOpen(false);
                  }}
                >
                  <i className="fab fa-linkedin"></i> LinkedIn
                </a>
                <a
                  href="https://twitter.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    showToast('Opening Twitter profile', 'info');
                    setSocialDropdownOpen(false);
                  }}
                >
                  <i className="fab fa-twitter"></i> Twitter
                </a>
                <a
                  href="https://instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    showToast('Opening Instagram profile', 'info');
                    setSocialDropdownOpen(false);
                  }}
                >
                  <i className="fab fa-instagram"></i> Instagram
                </a>
              </div>
            )}
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