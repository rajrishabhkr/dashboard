import React from "react";
import { IconButton, Divider, Tooltip } from "@mui/material";
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
  Timer,
  Extension,
  Style,
  PlusOne,
  VideogameAsset,
  ChevronLeft,
  ChevronRight,
  GridOn,
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
    section: "Tools & Stocks",
    items: [
      { icon: <ShowChart />, label: "IPO List", path: "/ipolist" },
      { icon: <Calculate />, label: "Calculator", path: "/calculator" },
      { icon: <PlusOne />, label: "Digital Counter", path: "/counter" },
      { icon: <Timer />, label: "Precision Stopwatch", path: "/stopwatch" }
    ]
  },
  {
    section: "Games",
    items: [
      { icon: <SportsEsports />, label: "Tic Tac Toe", path: "/tictactoe" },
      { icon: <ViewInAr />, label: "3D Cube", path: "/3dcube" },
      { icon: <GridOn />, label: "Rubik's Cube", path: "/rubiks-cube" },
      { icon: <VideogameAsset />, label: "Snake Game", path: "/snake" },
      { icon: <Extension />, label: "Memory Match", path: "/memory-match" },
      { icon: <Style />, label: "Color Rush", path: "/color-rush" }
    ]
  },
  {
    section: "School Info",
    items: [
      { icon: <People />, label: "Students", path: "/students" },
      { icon: <School />, label: "Teachers", path: "/teachers" },
      { icon: <CalendarToday />, label: "Attendance", path: "/attendance" }
    ]
  }
];

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen, onItemClick }) => {
  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-header">
        <Tooltip title={open ? "Collapse Sidebar" : "Expand Sidebar"}>
          <IconButton 
            className="close-btn" 
            onClick={() => setOpen(!open)}
            aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
          >
            {open ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        </Tooltip>
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