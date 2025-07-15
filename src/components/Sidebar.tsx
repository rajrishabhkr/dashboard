import React from "react";
import { IconButton, Divider } from "@mui/material";
import { Link } from "react-router-dom";
import {
  Dashboard,
  Feed,
  ShowChart,
  People,
  School,
  CalendarToday,
  SportsEsports,
  Calculate,
  ViewInAr,
  ChevronLeft,
} from "@mui/icons-material";
import "./Components.scss";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onItemClick: () => void;
}

const navItems = [
  {
    section: null,
    items: [
      { icon: <Dashboard />, label: "Home", path: "/" },
      { icon: <Feed />, label: "Info", path: "/info" }
    ]
  },
  {
    section: "Stocks",
    items: [
      { icon: <ShowChart />, label: "IPO List", path: "/ipolist" },
      { icon: <Calculate />, label: "Calculator", path: "/calculator" }
    ]
  },
  {
    section: "School Info",
    items: [
      { icon: <People />, label: "Students", path: "/students" },
      { icon: <School />, label: "Teachers", path: "/teachers" },
      { icon: <CalendarToday />, label: "Attendance", path: "/attendance" }
    ]
  },
  {
    section: "Games",
    items: [
      { icon: <SportsEsports />, label: "Tic Tac Toe", path: "/tictactoe" },
      { icon: <ViewInAr />, label: "3D Cube", path: "/3dcube" }
    ]
  }
];

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen, onItemClick }) => {
  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-header">
        <IconButton 
          className="close-btn" 
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
        >
          <ChevronLeft />
        </IconButton>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((group, index) => (
          <React.Fragment key={index}>
            {group.section && (
              <>
                <Divider className="sidebar-divider" />
                <h3 className="section-title">{group.section}</h3>
              </>
            )}
            <ul>
              {group.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <Link 
                    to={item.path} 
                    onClick={onItemClick}
                    className="nav-link"
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </React.Fragment>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;