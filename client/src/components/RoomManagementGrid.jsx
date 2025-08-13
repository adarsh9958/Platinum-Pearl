import React, { useState, useEffect } from 'react';
import { getAllRooms, updateRoomStatus } from '../api/apiService';

const RoomManagementGrid = ({ token, onRoomsUpdate }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingRoomId, setEditingRoomId] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const { data } = await getAllRooms(token);
        setRooms(data);
      } catch (err) {
        setError('Failed to fetch rooms. Please ensure you are logged in.');
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchRooms();
    }
  }, [token]);

  const handleStatusChange = async (roomId, newStatus) => {
    try {
      // Optimistically update the local state first for a snappy UI
      const updatedRooms = rooms.map(room => 
        room._id === roomId ? { ...room, status: newStatus } : room
      );
      setRooms(updatedRooms);
      setEditingRoomId(null); // Close the dropdown immediately

      // Call the parent component's update function
      onRoomsUpdate(updatedRooms);

      // Then, send the update to the backend
      await updateRoomStatus(roomId, newStatus, token);
      
    } catch (err) {
      setError('Failed to update room status. Please refresh the page.');
      // Optional: Revert optimistic update on failure
    }
  };

  const handleRoomClick = (room) => {
    if (room.status === 'occupied') {
      alert('Occupied room status must be changed via guest check-out.');
      return;
    }
    setEditingRoomId(prevId => (prevId === room._id ? null : room._id));
  };
  
  if (loading) return <p>Loading rooms...</p>;
  if (error) return <p className="message message-error">{error}</p>;

  return (
    <div className="room-grid">
      {rooms.map((room) => (
        <div 
          key={room._id} 
          className={`room-grid-item status-${room.status}`}
          onClick={() => handleRoomClick(room)}
        >
          <div className="room-number">Room {room.roomNumber}</div>
          <div className="room-status">{room.status}</div>
          
          {editingRoomId === room._id && (
            <select
              className="status-select"
              onChange={(e) => handleStatusChange(room._id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              defaultValue={room.status}
            >
              {room.status === 'available' && (
                <>
                  <option value="available">Available</option>
                  <option value="cleaning">Set to Cleaning</option>
                  <option value="maintenance">Set to Maintenance</option>
                </>
              )}
              {room.status !== 'available' && (
                 <>
                  <option value={room.status}>{room.status.charAt(0).toUpperCase() + room.status.slice(1)}</option>
                  <option value="available">Set to Available</option>
                </>
              )}
            </select>
          )}
        </div>
      ))}
    </div>
  );
};

export default RoomManagementGrid;