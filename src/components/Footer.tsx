// src/components/Footer.tsx
import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import { Facebook, X, LinkedIn, GitHub, Instagram } from "@mui/icons-material";
import "./Components.scss";

const Footer: React.FC = () => {
    const socialLinks = [
    { icon: <X />, url: "https://twitter.com", label: "Twitter" },
    { icon: <Facebook />, url: "https://facebook.com", label: "Facebook" },
    { icon: <Instagram />, url: "https://instagram.com", label: "Instagram" },
    { icon: <LinkedIn />, url: "https://linkedin.com", label: "LinkedIn" },
    { icon: <GitHub />, url: "https://github.com", label: "GitHub" },
    ];
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="copyright">
          © {new Date().getFullYear()} Rishabh Dashboard. All rights reserved.
        </div>
        
        <div className="footer-social-icons">
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
      </div>
    </footer>
  );
};

export default Footer;