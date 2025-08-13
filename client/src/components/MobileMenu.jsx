import React from 'react';
import { Link } from 'react-router-dom';

const MobileMenu = ({ adminToken, onLogout, closeMenu }) => {
  const handleLinkClick = () => {
    closeMenu(); // Close the menu when a link is clicked
  };

  return (
    <div className="mobile-menu">
      {adminToken ? (
        <>
          <Link to="/admin/dashboard" className="mobile-menu-link" onClick={handleLinkClick}>Dashboard</Link>
          <Link to="/admin/bookings" className="mobile-menu-link" onClick={handleLinkClick}>Bookings</Link>
          <Link to="/admin/reports" className="mobile-menu-link" onClick={handleLinkClick}>Reporting</Link>
          <button
            onClick={() => {
              onLogout();
              handleLinkClick();
            }}
            className="mobile-menu-link btn-logout"
          >
            Logout
          </button>
        </>
      ) : (
        <Link to="/admin/login" className="mobile-menu-link" onClick={handleLinkClick}>Admin Login</Link>
      )}
    </div>
  );
};

export default MobileMenu;