import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRoomDetails } from '../api/apiService';

const RoomDetailsPage = () => {
    const { id } = useParams(); // Gets the room ID from the URL
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const { data } = await getRoomDetails(id);
                setRoom(data);
            } catch (err) {
                setError('Could not fetch room details.');
            } finally {
                setLoading(false);
            }
        };
        fetchRoom();
    }, [id]);

    if (loading) return <p className="container">Loading room details...</p>;
    if (error) return <p className="container message message-error">{error}</p>;
    if (!room) return <p className="container">Room not found.</p>;

    return (
        <div className="container main-content">
            <div className="card">
                <img src={room.imageUrl} alt={`View of ${room.type} room`} style={{ width: '100%', borderRadius: '8px' }} />
                <h1>Room {room.roomNumber} - {room.type}</h1>
                <p className="stat-value" style={{ textAlign: 'center' }}>${room.price}/night</p>
                
                <h3>Amenities</h3>
                <ul>
                    {room.amenities.map(amenity => (
                        <li key={amenity}>✓ {amenity}</li>
                    ))}
                </ul>
                
                <Link to="/" className="btn btn-primary btn-full-width" style={{ marginTop: '20px' }}>
                    ← Back to Bookings
                </Link>
            </div>
        </div>
    );
};

export default RoomDetailsPage;