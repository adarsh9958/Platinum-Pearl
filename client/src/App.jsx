import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import BookingManagementPage from './pages/admin/BookingManagementPage';
import ReportingPage from './pages/admin/ReportingPage';
import Navbar from './components/Navbar';
import RoomDetailsPage from './pages/RoomDetailsPage'; // Add this import


function ProtectedRoute({ token, children }) {
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('adminToken'));

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleLogin = (token) => {
    localStorage.setItem('adminToken', token);
    setAdminToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setAdminToken(null);
  };

  return (
    <>
      <Navbar 
        adminToken={adminToken} 
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme} // This correctly passes the function
      />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin/login" element={<AdminLoginPage onLogin={handleLogin} />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute token={adminToken}><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/bookings" element={<ProtectedRoute token={adminToken}><BookingManagementPage /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute token={adminToken}><ReportingPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}

export default App;