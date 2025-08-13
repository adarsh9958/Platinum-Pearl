import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MobileMenu from './MobileMenu';

// Define the button component outside to ensure stability
const ThemeToggleButton = ({ theme, toggleTheme }) => (
  <button onClick={toggleTheme} className="theme-toggle-btn">
    {theme === 'light' ? '🌙' : '☀️'}
  </button>
);

const Navbar = ({ adminToken, onLogout, theme, toggleTheme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <a href="/" className="navbar-brand">
            The Platinum Pearl
          </a>

          {/* Desktop Links */}
          <div className="navbar-links-desktop">
            {adminToken ? (
              <>
                <Link to="/admin/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/admin/bookings" className="nav-link">Bookings</Link>
                <Link to="/admin/reports" className="nav-link">Reporting</Link>
                <button onClick={onLogout} className="nav-link btn-logout">Logout</button>
              </>
            ) : (
              <Link to="/admin/login" className="nav-link">Admin Login</Link>
            )}
            <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />
          </div>

          {/* Mobile Icons */}
          <div className="navbar-icons-mobile">
            <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="hamburger-btn">
              {isMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>
      {isMenuOpen && (
        <MobileMenu adminToken={adminToken} onLogout={onLogout} closeMenu={() => setIsMenuOpen(false)} />
      )}
    </>
  );
};

export default Navbar;