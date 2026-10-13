import React from "react";
import { IconButton, Tooltip, Menu as MuiMenu, MenuItem, Divider } from "@mui/material";
import { Facebook, X, LinkedIn, GitHub, Instagram, Menu, Share, GetApp } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useToast } from "./ToastContext";
import "./Components.scss";
import dashboardLogo from '../../../public/images/logo/wolf.png';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { showToast } = useToast();
  const socialLinks = [
    { icon: <X />, url: "https://twitter.com", label: "Twitter" },
    { icon: <Facebook />, url: "https://facebook.com", label: "Facebook" },
    { icon: <Instagram />, url: "https://instagram.com", label: "Instagram" },
    { icon: <LinkedIn />, url: "https://linkedin.com", label: "LinkedIn" },
    { icon: <GitHub />, url: "https://github.com", label: "GitHub" },
  ];

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleDownloadApk = async () => {
    setAnchorEl(null);
    try {
      showToast("Starting Rishabh Tech APK download... 🚀", "info");
      const baseUrl = import.meta.env.BASE_URL.endsWith('/')
        ? import.meta.env.BASE_URL
        : `${import.meta.env.BASE_URL}/`;
      const apkUrl = `${baseUrl}rishabh-tech.apk`;

      const response = await fetch(apkUrl);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const blob = await response.blob();
      const apkBlob = new Blob([blob], { type: 'application/vnd.android.package-archive' });
      const blobUrl = window.URL.createObjectURL(apkBlob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "rishabh-tech.apk";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      showToast("Rishabh Tech APK downloaded! 📱", "success");
    } catch (err) {
      console.error("APK download error:", err);
      // Fallback direct link with baseUrl
      const baseUrl = import.meta.env.BASE_URL.endsWith('/')
        ? import.meta.env.BASE_URL
        : `${import.meta.env.BASE_URL}/`;
      const link = document.createElement("a");
      link.href = `${baseUrl}rishabh-tech.apk`;
      link.download = "rishabh-tech.apk";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Downloading APK... 🚀", "info");
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <Tooltip title="Toggle sidebar">
          <IconButton 
            className="menu-icon" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <Menu />
          </IconButton>
        </Tooltip>

        <Link to="/" className="logo-title">
          <img 
            src={dashboardLogo}
            alt="Rishabh Tech Logo" 
            className="logo-img"
          />
          <span className="app-title">Rishabh Tech</span>
        </Link>
      </div>

      <div className="header-right desktop-social">
        {socialLinks.map((link, index) => (
          <Tooltip key={index} title={link.label}>
            <IconButton 
              component="a" 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-icon"
              aria-label={link.label}
            >
              {link.icon}
            </IconButton>
          </Tooltip>
        ))}
        <Tooltip title="Download Website Android APK">
          <IconButton
            onClick={handleDownloadApk}
            className="social-icon apk-desktop-btn"
            aria-label="Download Android APK"
            style={{ padding: '6px' }}
          >
            <img
              src={dashboardLogo}
              alt="Rishabh Tech APK"
              style={{ width: '22px', height: '22px', objectFit: 'contain', borderRadius: '50%' }}
            />
          </IconButton>
        </Tooltip>
      </div>

      <div className="header-right mobile-social-dropdown">
        <Tooltip title="Download Website APK">
          <IconButton
            onClick={handleDownloadApk}
            className="social-icon apk-mobile-btn"
            aria-label="Download Website APK"
            style={{ padding: '6px' }}
          >
            <img
              src={dashboardLogo}
              alt="Rishabh Tech APK"
              style={{ width: '22px', height: '22px', objectFit: 'contain', borderRadius: '50%' }}
            />
          </IconButton>
        </Tooltip>

        <Tooltip title="Social Media & Links">
          <IconButton
            onClick={(e) => setAnchorEl(e.currentTarget)}
            className="social-icon"
            aria-label="Social Links Menu"
          >
            <Share style={{ color: '#1e90ff' }} />
          </IconButton>
        </Tooltip>
        <MuiMenu
          anchorEl={anchorEl}
          open={openMenu}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            style: {
              backgroundColor: '#1e1e1e',
              color: '#ffffff',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              minWidth: '220px',
              padding: '6px 0',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
            }
          }}
        >
          {socialLinks.map((link, index) => (
            <MenuItem
              key={index}
              onClick={() => {
                window.open(link.url, '_blank', 'noopener,noreferrer');
                setAnchorEl(null);
              }}
              style={{ gap: '12px', fontSize: '0.9rem', padding: '10px 16px' }}
            >
              <span style={{ color: '#1e90ff', display: 'flex', alignItems: 'center' }}>{link.icon}</span>
              <span>{link.label}</span>
            </MenuItem>
          ))}

          <Divider style={{ borderColor: 'rgba(255,255,255,0.12)', margin: '6px 0' }} />

          {/* APK File Download Option under social media icons */}
          <MenuItem
            onClick={handleDownloadApk}
            className="apk-download-item"
            style={{
              gap: '12px',
              fontSize: '0.9rem',
              color: '#2ed573',
              fontWeight: 600,
              padding: '10px 16px',
              backgroundColor: 'rgba(46, 213, 115, 0.08)',
              margin: '4px 8px 4px',
              borderRadius: '8px',
              border: '1px solid rgba(46, 213, 115, 0.25)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src={dashboardLogo}
                alt="Rishabh Tech APK"
                style={{ width: '24px', height: '24px', objectFit: 'contain', borderRadius: '50%' }}
              />
            </span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                Download APK <GetApp fontSize="small" />
              </span>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)', fontWeight: 400 }}>
                Rishabh Tech App (Android)
              </span>
            </div>
          </MenuItem>
        </MuiMenu>
      </div>
    </header>
  );
};

export default Header;