import React, { useState, useEffect } from 'react';
import { getBookings, cancelBooking } from '../../api/apiService';

const BookingManagementPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({ search: '', status: '' });
    const adminToken = localStorage.getItem('adminToken');

    const fetchBookings = async () => {
        if (!adminToken) return;
        setLoading(true);
        try {
            const { data } = await getBookings(adminToken, filters);
            setBookings(data);
        } catch (err) {
            setError('Failed to fetch bookings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchBookings();
        }, 300); // Debounce search input
        return () => clearTimeout(timer);
    }, [filters, adminToken]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleCancelBooking = async (bookingId) => {
        if (window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
            try {
                await cancelBooking(bookingId, adminToken);
                alert('Booking canceled successfully.');
                fetchBookings(); // Refresh the list
            } catch (err) {
                alert('Failed to cancel booking.');
            }
        }
    };

    return (
        <div className="container">
            <div className="main-content">
                <h1>Booking Management</h1>
                <div className="card">
                    <h2>Filter & Search Bookings</h2>
                    <div className="filters">
                        <input
                            type="text"
                            name="search"
                            placeholder="Search by guest name..."
                            value={filters.search}
                            onChange={handleFilterChange}
                        />
                        <select name="status" value={filters.status} onChange={handleFilterChange}>
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    {loading && <p>Loading bookings...</p>}
                    {error && <p className="message message-error">{error}</p>}
                    
                    {!loading && (
                        <table className="bookings-table">
                            <thead>
                                <tr>
                                    <th>Guest Name</th>
                                    <th>Room</th>
                                    <th>Check-in</th>
                                    <th>Expected Check-out</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(booking => (
                                    <tr key={booking._id}>
                                        <td>{booking.guestName}</td>
                                        <td>{booking.room?.roomNumber || 'N/A'}</td>
                                        <td>{new Date(booking.checkInDate).toLocaleDateString()}</td>
                                        <td>{new Date(booking.expectedCheckOutDate).toLocaleDateString()}</td>
                                        <td>{booking.status}</td>
                                        <td>
                                            {booking.status === 'completed' ? (
                                                <span>Checked Out</span>
                                            ) : (
                                                <button 
                                                    className="btn btn-danger"
                                                    onClick={() => handleCancelBooking(booking._id)}
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingManagementPage;