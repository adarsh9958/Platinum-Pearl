import React, { useState, useEffect } from 'react';
import RoomManagementGrid from '../../components/RoomManagementGrid';
import { getAllRooms } from '../../api/apiService'; 

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    occupied: 0,
    cleaning: 0,
    maintenance: 0,
  });
  const adminToken = localStorage.getItem('adminToken');

  // This function will calculate stats from a given room list
  const calculateStats = (rooms) => {
    const total = rooms.length;
    const occupied = rooms.filter(r => r.status === 'occupied').length;
    const cleaning = rooms.filter(r => r.status === 'cleaning').length;
    const maintenance = rooms.filter(r => r.status === 'maintenance').length;
    const available = total - occupied - cleaning - maintenance;
    
    setStats({ total, available, occupied, cleaning, maintenance });
  };

  useEffect(() => {
    // Fetch initial stats when the page loads
    const fetchInitialRooms = async () => {
      if (!adminToken) return;
      try {
        const { data } = await getAllRooms(adminToken);
        calculateStats(data); // Calculate stats from initial fetch
      } catch (error) {
        console.error("Failed to fetch room stats", error);
      }
    };
    fetchInitialRooms();
  }, [adminToken]);

  // This function will be passed down to the grid component
  const handleRoomsUpdate = (updatedRooms) => {
    calculateStats(updatedRooms); // Recalculate stats with the new data from the child
  };

  const occupancy = stats.total > 0 ? (stats.occupied / stats.total) * 100 : 0;

  return (
    <div className="container">
      <div className="main-content">
        <h1>Admin Dashboard</h1>
        <div className="card">
          <h2>Hotel Status</h2>
          <p>Total Rooms: <strong>{stats.total}</strong></p>
          <p>Available: <strong>{stats.available}</strong></p>
          <p>Occupied: <strong>{stats.occupied}</strong></p>
          <p>Needs Cleaning: <strong>{stats.cleaning}</strong></p>
          <p>Under Maintenance: <strong>{stats.maintenance}</strong></p>
          <p>Occupancy Rate: <strong>{occupancy.toFixed(1)}%</strong></p>
        </div>
        <div className="card">
          <h2>Room Management</h2>
          {/* Pass the new function as a prop */}
          <RoomManagementGrid token={adminToken} onRoomsUpdate={handleRoomsUpdate} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;