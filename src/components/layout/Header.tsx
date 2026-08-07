import React from "react";
import { IconButton, Tooltip, Menu as MuiMenu, MenuItem } from "@mui/material";
import { Facebook, X, LinkedIn, GitHub, Instagram, Menu, Share } from "@mui/icons-material";
import { Link } from "react-router-dom";
import "./Components.scss";
import dashboardLogo from '../../../public/images/logo/wolf.png';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const socialLinks = [
    { icon: <X />, url: "https://twitter.com", label: "Twitter" },
    { icon: <Facebook />, url: "https://facebook.com", label: "Facebook" },
    { icon: <Instagram />, url: "https://instagram.com", label: "Instagram" },
    { icon: <LinkedIn />, url: "https://linkedin.com", label: "LinkedIn" },
    { icon: <GitHub />, url: "https://github.com", label: "GitHub" },
  ];

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

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
      </div>

      <div className="header-right mobile-social-dropdown">
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          className="social-icon"
          aria-label="Social Links Menu"
        >
          <Share style={{ color: '#1e90ff' }} />
        </IconButton>
        <MuiMenu
          anchorEl={anchorEl}
          open={openMenu}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            style: {
              backgroundColor: '#1e1e1e',
              color: '#ffffff',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)'
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
              style={{ gap: '10px', fontSize: '0.9rem' }}
            >
              <span style={{ color: '#1e90ff', display: 'flex', alignItems: 'center' }}>{link.icon}</span>
              <span>{link.label}</span>
            </MenuItem>
          ))}
        </MuiMenu>
      </div>
    </header>
  );
};

export default Header;