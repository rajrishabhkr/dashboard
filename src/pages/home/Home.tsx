import React, { useState, useEffect } from 'react';
import reactLogo from '../../assets/react.svg';
import { Link } from 'react-router-dom';
import './Home.scss';
import { useToast } from '../../components/layout/ToastContext';
import { getAssetUrl } from '../../utils/assetUrl';

const wolfLogo = getAssetUrl('images/logo/wolf.png');
const viteLogo = getAssetUrl('vite.svg');
const profileImage = getAssetUrl('images/profile_pic.jpg');
const gif1 = getAssetUrl('images/gif/chicken.gif');
const gif2 = getAssetUrl('images/gif/panda.gif');
const gif3 = getAssetUrl('images/gif/poo.gif');
const gif4 = getAssetUrl('images/gif/unicorn.gif');

const TooltipWrapper: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="tooltip-container" title={title}>
    {children}
  </div>
);

const Home: React.FC = () => {
  const { showToast } = useToast();
  const gifs = [
    { id: 1, src: gif1, title: 'Animated Chicken' },
    { id: 2, src: gif2, title: 'Playful Panda' },
    { id: 3, src: gif3, title: 'Witty Poo' },
    { id: 4, src: gif4, title: 'Magic Unicorn' },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedLogo, setSelectedLogo] = useState<{ src: string; title: string } | null>(null);

  // Auto-advance carousel
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % gifs.length);
    }, 2800);

    return () => clearInterval(interval);
  }, [isPlaying, gifs.length]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + gifs.length) % gifs.length);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % gifs.length);
  };

  const goToGif = (index: number) => {
    setCurrentIndex(index);
  };

  const toggleCarouselPlay = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    showToast(nextState ? 'Carousel autoplay resumed' : 'Carousel paused', 'info');
  };

  const openLogoModal = (src: string, title: string) => {
    setSelectedLogo({ src, title });
    showToast(`Viewing ${title}`, 'info');
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('rajrishabhkr@gmail.com');
    showToast('Email address copied to clipboard! 📋', 'success');
  };

  const handleDownloadApk = async () => {
    try {
      showToast('Starting Rishabh Tech APK download... 🚀', 'info');
      const baseUrl = import.meta.env.BASE_URL.endsWith('/')
        ? import.meta.env.BASE_URL
        : `${import.meta.env.BASE_URL}/`;
      const apkUrl = `${baseUrl}rishabh-tech.apk`;

      const response = await fetch(apkUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const apkBlob = new Blob([blob], { type: 'application/vnd.android.package-archive' });
      const blobUrl = window.URL.createObjectURL(apkBlob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'rishabh-tech.apk';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      showToast('Rishabh Tech APK downloaded! 📱', 'success');
    } catch (err) {
      console.error('APK download error:', err);
      const baseUrl = import.meta.env.BASE_URL.endsWith('/')
        ? import.meta.env.BASE_URL
        : `${import.meta.env.BASE_URL}/`;
      const link = document.createElement('a');
      link.href = `${baseUrl}rishabh-tech.apk`;
      link.download = 'rishabh-tech.apk';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Downloading APK... 🚀', 'success');
    }
  };

  return (
    <div className="home-container">
      {/* Welcome Hero Section */}
      <section className="welcome-section">
        <div className="logos-row">
          <TooltipWrapper title="Vite Next-Gen Bundler">
            <img
              src={viteLogo}
              className="logo vite-logo clickable-logo"
              alt="Vite logo"
              onClick={() => openLogoModal(viteLogo, 'Vite Build Engine')}
            />
          </TooltipWrapper>

          <TooltipWrapper title="Rishabh Tech Brand Centerpiece">
            <img
              src={wolfLogo}
              className="logo rishabh-brand-logo centerpiece-logo clickable-logo"
              alt="Rishabh Tech Wolf logo"
              onClick={() => openLogoModal(wolfLogo, 'Rishabh Tech Brand')}
            />
          </TooltipWrapper>

          <TooltipWrapper title="React 18 Component Architecture">
            <img
              src={reactLogo}
              className="logo react clickable-logo"
              alt="React logo"
              onClick={() => openLogoModal(reactLogo, 'React 18 Framework')}
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

        <div className="hero-text-wrap">
          <span className="hero-badge">
            <i className="fas fa-bolt"></i> High-Performance Web Ecosystem
          </span>
          <h1>Welcome to Rishabh Tech</h1>
          <p>
            An ultra-responsive ecosystem featuring high-performance databases, financial tools, 
            analytics dashboards, and interactive gaming experiences.
          </p>
        </div>

        {/* Modern GIF Showcase Carousel */}
        <div className="gif-carousel-section">
          <div className="carousel-card-wrapper">
            <div className="carousel-header">
              <div className="carousel-status">
                <span className={`status-dot ${isPlaying ? 'playing' : 'paused'}`}></span>
                <span>{isPlaying ? 'Live Showcase' : 'Showcase Paused'}</span>
              </div>
              <div className="carousel-controls-top">
                <button
                  type="button"
                  className="carousel-icon-btn"
                  onClick={toggleCarouselPlay}
                  title={isPlaying ? 'Pause Auto-Play' : 'Resume Auto-Play'}
                >
                  <i className={`fas fa-${isPlaying ? 'pause' : 'play'}`}></i>
                </button>
              </div>
            </div>

            <div className="gif-display-stage">
              <button 
                type="button" 
                className="stage-nav-btn prev-btn" 
                onClick={goToPrevious}
                aria-label="Previous GIF"
              >
                <i className="fas fa-chevron-left"></i>
              </button>

              <div className="gif-slide-content">
                <img
                  key={gifs[currentIndex].id}
                  src={gifs[currentIndex].src}
                  alt={gifs[currentIndex].title}
                  className="gif-image"
                />
                <div className="gif-caption-badge">
                  <span className="gif-counter">{currentIndex + 1} / {gifs.length}</span>
                  <span className="gif-title">{gifs[currentIndex].title}</span>
                </div>
              </div>

              <button 
                type="button" 
                className="stage-nav-btn next-btn" 
                onClick={goToNext}
                aria-label="Next GIF"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>

            <div className="carousel-indicators">
              {gifs.map((gif, index) => (
                <button
                  key={gif.id}
                  type="button"
                  className={`indicator-dot ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => goToGif(index)}
                  aria-label={`Jump to GIF ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Quick CTA Actions */}
        <div className="hero-cta-actions">
          <Link to="/info" className="cta-btn primary" onClick={() => showToast('Opening Analytics & Task Hub', 'info')}>
            <i className="fas fa-chart-pie"></i>
            <span>Analytics &amp; Tasks Hub</span>
          </Link>
          <a href="#profile" className="cta-btn secondary">
            <i className="fas fa-user-astronaut"></i>
            <span>Developer Profile</span>
          </a>
          <button type="button" onClick={handleDownloadApk} className="cta-btn apk">
            <i className="fab fa-android"></i>
            <span>Download Android APK</span>
          </button>
        </div>
      </section>

      {/* Quick Navigation Shortcuts Section */}
      <section className="shortcuts-section">
        <div className="shortcuts-header">
          <h2 className="shortcuts-title">
            <i className="fas fa-compass"></i> System Navigation Hub
          </h2>
          <p className="shortcuts-subtitle">
            Instant 1-click access to directories, financial tools, cloud database, and retro mini games
          </p>
        </div>

        <div className="shortcuts-categories">
          {/* Table Info Group */}
          <div className="shortcut-group">
            <h3><i className="fas fa-table-cells"></i> Table Info Directory</h3>
            <div className="shortcut-grid">
              <Link to="/students" className="shortcut-card" onClick={() => showToast('Opening Students Directory', 'info')}>
                <div className="shortcut-icon students-icon"><i className="fas fa-user-graduate"></i></div>
                <div className="shortcut-text">
                  <span className="shortcut-label">Students</span>
                  <span className="shortcut-desc">Class, Grade &amp; Scholar Info</span>
                </div>
              </Link>
              <Link to="/teachers" className="shortcut-card" onClick={() => showToast('Opening Teachers Directory', 'info')}>
                <div className="shortcut-icon teachers-icon"><i className="fas fa-chalkboard-user"></i></div>
                <div className="shortcut-text">
                  <span className="shortcut-label">Teachers</span>
                  <span className="shortcut-desc">Faculty &amp; Departments</span>
                </div>
              </Link>
              <Link to="/attendance" className="shortcut-card" onClick={() => showToast('Opening Attendance Tracker', 'info')}>
                <div className="shortcut-icon attendance-icon"><i className="fas fa-calendar-check"></i></div>
                <div className="shortcut-text">
                  <span className="shortcut-label">Attendance</span>
                  <span className="shortcut-desc">Daily Logs &amp; Status</span>
                </div>
              </Link>
              <Link to="/ipolist" className="shortcut-card" onClick={() => showToast('Opening IPO Watchlist', 'info')}>
                <div className="shortcut-icon ipo-icon"><i className="fas fa-coins"></i></div>
                <div className="shortcut-text">
                  <span className="shortcut-label">IPO List</span>
                  <span className="shortcut-desc">Market Listings &amp; Lot Sizes</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Tools Group */}
          <div className="shortcut-group">
            <h3><i className="fas fa-screwdriver-wrench"></i> Productivity Tools</h3>
            <div className="shortcut-grid">
              <Link to="/calculator" className="shortcut-card" onClick={() => showToast('Opening Smart Calculator', 'info')}>
                <div className="shortcut-icon calc-icon"><i className="fas fa-calculator"></i></div>
                <div className="shortcut-text">
                  <span className="shortcut-label">Calculator</span>
                  <span className="shortcut-desc">Financial Math Engine</span>
                </div>
              </Link>
              <Link to="/counter" className="shortcut-card" onClick={() => showToast('Opening Digital Counter', 'info')}>
                <div className="shortcut-icon counter-icon"><i className="fas fa-arrow-up-1-9"></i></div>
                <div className="shortcut-text">
                  <span className="shortcut-label">Digital Counter</span>
                  <span className="shortcut-desc">Tally, Step Size &amp; Reset</span>
                </div>
              </Link>
              <Link to="/stopwatch" className="shortcut-card" onClick={() => showToast('Opening Precision Stopwatch', 'info')}>
                <div className="shortcut-icon watch-icon"><i className="fas fa-stopwatch"></i></div>
                <div className="shortcut-text">
                  <span className="shortcut-label">Stopwatch</span>
                  <span className="shortcut-desc">Millisecond Splits &amp; Laps</span>
                </div>
              </Link>
              <Link to="/password-generator" className="shortcut-card" onClick={() => showToast('Opening Password Vault', 'info')}>
                <div className="shortcut-icon pass-icon"><i className="fas fa-key"></i></div>
                <div className="shortcut-text">
                  <span className="shortcut-label">Password Vault</span>
                  <span className="shortcut-desc">Entropy &amp; PIN Generator</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Mini Games Suite */}
          <div className="shortcut-group">
            <h3><i className="fas fa-gamepad"></i> Mini Games Suite</h3>
            <div className="shortcut-grid">
              <Link to="/tictactoe" className="shortcut-card" onClick={() => showToast('Launching Tic Tac Toe', 'info')}>
                <div className="shortcut-icon game-icon"><i className="fas fa-hashtag"></i></div>
                <div className="shortcut-text">
                  <span className="shortcut-label">Tic Tac Toe</span>
                  <span className="shortcut-desc">AI Engine &amp; 2-Player Match</span>
                </div>
              </Link>
              <Link to="/snake" className="shortcut-card" onClick={() => showToast('Launching Snake Game', 'info')}>
                <div className="shortcut-icon snake-icon"><i className="fas fa-worm"></i></div>
                <div className="shortcut-text">
                  <span className="shortcut-label">Snake Game</span>
                  <span className="shortcut-desc">Neon Food &amp; Wrap Mode</span>
                </div>
              </Link>
              <Link to="/memory-match" className="shortcut-card" onClick={() => showToast('Launching Memory Match', 'info')}>
                <div className="shortcut-icon memory-icon"><i className="fas fa-brain"></i></div>
                <div className="shortcut-text">
                  <span className="shortcut-label">Memory Match</span>
                  <span className="shortcut-desc">Card Pairs &amp; High Scores</span>
                </div>
              </Link>
              <Link to="/color-rush" className="shortcut-card" onClick={() => showToast('Launching Color Rush', 'info')}>
                <div className="shortcut-icon color-icon"><i className="fas fa-palette"></i></div>
                <div className="shortcut-text">
                  <span className="shortcut-label">Color Rush</span>
                  <span className="shortcut-desc">Pattern Streak Memory</span>
                </div>
              </Link>
              <Link to="/2048" className="shortcut-card" onClick={() => showToast('Launching Neon 2048', 'info')}>
                <div className="shortcut-icon num-icon"><i className="fas fa-cubes-stacked"></i></div>
                <div className="shortcut-text">
                  <span className="shortcut-label">Neon 2048</span>
                  <span className="shortcut-desc">Sliding Tile Math Puzzle</span>
                </div>
              </Link>
              <Link to="/brick-breaker" className="shortcut-card" onClick={() => showToast('Launching Brick Breaker', 'info')}>
                <div className="shortcut-icon break-icon"><i className="fas fa-burst"></i></div>
                <div className="shortcut-text">
                  <span className="shortcut-label">Brick Breaker</span>
                  <span className="shortcut-desc">Arcade Paddle &amp; Lasers</span>
                </div>
              </Link>
              <Link to="/3dcube" className="shortcut-card" onClick={() => showToast('Launching 3D Cube', 'info')}>
                <div className="shortcut-icon cube-icon"><i className="fas fa-cube"></i></div>
                <div className="shortcut-text">
                  <span className="shortcut-label">3D Cube</span>
                  <span className="shortcut-desc">Three.js Orbit Controls</span>
                </div>
              </Link>
              <Link to="/rubiks-cube" className="shortcut-card" onClick={() => showToast('Launching Rubiks Cube', 'info')}>
                <div className="shortcut-icon rubik-icon"><i className="fas fa-cubes"></i></div>
                <div className="shortcut-text">
                  <span className="shortcut-label">Rubik's Cube</span>
                  <span className="shortcut-desc">3x3 Face Rotations &amp; Solvers</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Database Group */}
          <div className="shortcut-group">
            <h3><i className="fas fa-server"></i> Cloud &amp; Local Storage</h3>
            <div className="shortcut-grid">
              <Link to="/database" className="shortcut-card" onClick={() => showToast('Opening Database Hub', 'info')}>
                <div className="shortcut-icon db-icon"><i className="fas fa-database"></i></div>
                <div className="shortcut-text">
                  <span className="shortcut-label">Database Hub</span>
                  <span className="shortcut-desc">Dexie IndexedDB &amp; Supabase Cloud</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Completely Revamped Developer Profile Section */}
      <section className="profile-section" id="profile">
        <div className="profile-header-title">
          <h2>
            <i className="fas fa-id-card-clip"></i> Developer Profile
          </h2>
          <p>Full-Stack Engineering &amp; Modern Web Architecture</p>
        </div>

        <div className="developer-profile-card">
          {/* Main Top Profile Summary */}
          <div className="profile-hero">
            <div className="profile-avatar-wrapper">
              <img src={profileImage} alt="Rishabh Kumar Gupta" className="profile-avatar" />
              <span className="online-beacon" title="Online & Available"></span>
            </div>

            <div className="profile-headline">
              <div className="name-row">
                <h3>Rishabh Kumar Gupta</h3>
                <span className="verified-badge" title="Verified Creator">
                  <i className="fas fa-check-circle"></i>
                </span>
              </div>
              <p className="role-tagline">
                <i className="fas fa-code"></i> Software Developer &bull; Frontend &amp; Full-Stack Architect
              </p>
              <p className="bio-summary">
                Passionate creator building performant web applications with React, TypeScript, 
                Vite, Supabase, and modern responsive design systems.
              </p>

              {/* Social and Action Pills */}
              <div className="social-pills-row">
                <a
                  href="https://github.com/rajrishabhkr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-pill github"
                  onClick={() => showToast('Opening GitHub profile', 'info')}
                >
                  <i className="fab fa-github"></i>
                  <span>GitHub</span>
                </a>
                <a
                  href="https://linkedin.com/in/rajrishabhkr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-pill linkedin"
                  onClick={() => showToast('Opening LinkedIn profile', 'info')}
                >
                  <i className="fab fa-linkedin"></i>
                  <span>LinkedIn</span>
                </a>
                <a
                  href="https://twitter.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-pill twitter"
                  onClick={() => showToast('Opening Twitter profile', 'info')}
                >
                  <i className="fab fa-twitter"></i>
                  <span>Twitter</span>
                </a>
                <a
                  href="https://instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-pill instagram"
                  onClick={() => showToast('Opening Instagram profile', 'info')}
                >
                  <i className="fab fa-instagram"></i>
                  <span>Instagram</span>
                </a>
                <button
                  type="button"
                  className="social-pill apk-pill"
                  onClick={handleDownloadApk}
                  title="Download Android APK"
                >
                  <i className="fab fa-android"></i>
                  <span>Get Android APK</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="profile-metrics-strip">
            <div className="metric-cell">
              <span className="metric-number">3+</span>
              <span className="metric-label">Years Experience</span>
            </div>
            <div className="metric-cell">
              <span className="metric-number">20+</span>
              <span className="metric-label">Projects &amp; Repos</span>
            </div>
            <div className="metric-cell">
              <span className="metric-number">100%</span>
              <span className="metric-label">TypeScript &amp; React</span>
            </div>
            <div className="metric-cell">
              <span className="metric-number">60 FPS</span>
              <span className="metric-label">WebGL Graphics</span>
            </div>
          </div>

          {/* Tech Stack Badges */}
          <div className="profile-stack-section">
            <h4><i className="fas fa-layer-group"></i> Core Technology Stack</h4>
            <div className="stack-chips-wrap">
              <span className="stack-chip"><i className="fab fa-react"></i> React 18</span>
              <span className="stack-chip"><i className="fab fa-js-square"></i> TypeScript</span>
              <span className="stack-chip"><i className="fab fa-js"></i> JavaScript ES6+</span>
              <span className="stack-chip"><i className="fas fa-layer-group"></i> Next.js</span>
              <span className="stack-chip"><i className="fas fa-atom"></i> Redux Toolkit</span>
              <span className="stack-chip"><i className="fas fa-wind"></i> Tailwind CSS</span>
              <span className="stack-chip"><i className="fab fa-sass"></i> SCSS / SASS</span>
              <span className="stack-chip"><i className="fas fa-shapes"></i> Material UI (MUI)</span>
              <span className="stack-chip"><i className="fas fa-bolt"></i> Vite 6</span>
              <span className="stack-chip"><i className="fas fa-cloud"></i> Supabase Cloud</span>
              <span className="stack-chip"><i className="fas fa-database"></i> PostgreSQL</span>
              <span className="stack-chip"><i className="fas fa-server"></i> Dexie IndexedDB</span>
              <span className="stack-chip"><i className="fas fa-cube"></i> Three.js / WebGL</span>
              <span className="stack-chip"><i className="fas fa-paint-brush"></i> HTML5 Canvas</span>
              <span className="stack-chip"><i className="fab fa-node-js"></i> Node.js</span>
              <span className="stack-chip"><i className="fas fa-network-wired"></i> Express.js</span>
              <span className="stack-chip"><i className="fas fa-code-merge"></i> REST APIs &amp; GraphQL</span>
              <span className="stack-chip"><i className="fab fa-git-alt"></i> Git &amp; GitHub</span>
              <span className="stack-chip"><i className="fab fa-docker"></i> Docker</span>
              <span className="stack-chip"><i className="fas fa-vial-circle-check"></i> Vitest / Jest</span>
              <span className="stack-chip"><i className="fas fa-diagram-project"></i> CI/CD Workflows</span>
              <span className="stack-chip"><i className="fab fa-linux"></i> Linux</span>
            </div>
          </div>

          {/* Detailed Info Grid */}
          <div className="profile-details-grid">
            <div className="detail-card">
              <div className="detail-icon email-icon"><i className="fas fa-envelope"></i></div>
              <div className="detail-content">
                <span className="detail-title">Direct Email</span>
                <span className="detail-value">rajrishabhkr@gmail.com</span>
              </div>
              <button
                type="button"
                className="copy-detail-btn"
                onClick={handleCopyEmail}
                title="Copy Email Address"
              >
                <i className="fas fa-copy"></i>
              </button>
            </div>

            <div className="detail-card">
              <div className="detail-icon loc-icon"><i className="fas fa-location-dot"></i></div>
              <div className="detail-content">
                <span className="detail-title">Location</span>
                <span className="detail-value">Patna, Bihar, India</span>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon status-icon"><i className="fas fa-briefcase"></i></div>
              <div className="detail-content">
                <span className="detail-title">Availability</span>
                <span className="detail-value text-emerald-400">Open for Opportunities</span>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon edu-icon"><i className="fas fa-graduation-cap"></i></div>
              <div className="detail-content">
                <span className="detail-title">Focus &amp; Discipline</span>
                <span className="detail-value">Software Architecture &amp; UI/UX</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
