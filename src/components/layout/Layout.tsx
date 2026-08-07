import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import { ToastProvider } from "./ToastContext";
import "./Components.scss";

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <ToastProvider>
      <div className={`layout-container ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        {sidebarOpen && window.innerWidth < 768 && (
          <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
        )}
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} onItemClick={() => window.innerWidth < 768 && setSidebarOpen(false)} />
        
        <div className="main-content-wrapper">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          
          <main className="content">
            <Outlet />
          </main>
          
          <Footer />
        </div>
      </div>
    </ToastProvider>
  );
};

export default Layout;