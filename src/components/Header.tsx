import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import { Facebook, X, LinkedIn, GitHub, Instagram, Menu } from "@mui/icons-material";
import { Link } from "react-router-dom";
import "./Components.scss";
import dashboardLogo from '../../public/images/logo/wolf.png';

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
            alt="Dashboard Logo" 
            className="logo-img"
          />
          <span className="app-title">Rishabh Dashboard</span>
        </Link>
      </div>

      <div className="header-right">
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
    </header>
  );
};

export default Header;