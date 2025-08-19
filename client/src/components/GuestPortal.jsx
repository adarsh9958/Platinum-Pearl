// client/src/components/GuestPortal.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBookingStatus, checkOutGuest, addChargeToBooking } from '../api/apiService';

const roomServices = [
  { item: 'Laundry Service', price: 25 },
  { item: 'Club Sandwich', price: 18 },
  { item: 'Pizza Margherita', price: 22 },
  { item: 'Bottled Water (x4)', price: 8 },
  { item: 'Movie Rental', price: 15 },
];

const GuestPortal = ({ uniqueKey, onCheckout }) => {
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [isOverstaying, setIsOverstaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchBooking = async () => {
    try {
      const response = await getBookingStatus(uniqueKey);
      setBooking(response.data.booking);
      setIsOverstaying(response.data.isOverstaying);
      setError('');
    } catch (err) {
      setError('Could not find booking. Please check your key.');
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [uniqueKey]);

  const handleCheckout = async () => {
    if (!window.confirm('Are you sure you want to check out?')) return;
    try {
      const response = await checkOutGuest(uniqueKey);
      alert(response.data.message);
      onCheckout();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed.');
    }
  };

  const handleAddCharge = async (service) => {
    try {
        const response = await addChargeToBooking(uniqueKey, service);
        setMessage(response.data.message);
        // Refresh booking details to show new charge
        fetchBooking(); 
        // Clear message after a few seconds
        setTimeout(() => setMessage(''), 3000);
    } catch (err) {
        setError(err.response?.data?.message || 'Failed to add item.');
        setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) return <p>Loading your details...</p>;
  if (!booking) return <div className="message message-error"><h2>{error}</h2></div>;

  const totalBill = booking.charges.reduce((acc, charge) => acc + charge.price, 0);

  const groupCharges = (charges) => {
    return charges.reduce((acc, charge) => {
      const { item, price } = charge;
      if (!acc[item]) {
        acc[item] = { count: 0, price, total: 0 };
      }
      acc[item].count++;
      acc[item].total += price;
      return acc;
    }, {});
  };

  const groupedCharges = groupCharges(booking.charges);

  return (
    <div>
      <div className="card">
        <h2>Welcome, {booking.guestName}!</h2>
        {isOverstaying && (
            <p className="message message-error">
            ⚠️ Your booking period has ended. Please check out or contact the front desk.
            </p>
        )}
        <p><strong>Room Number:</strong> {booking.room.roomNumber}</p>
        <p><strong>Status:</strong> You are currently checked in.</p>
        
        <h3>Current Bill ($ {totalBill.toFixed(2)})</h3>
        <ul>
          {Object.entries(groupedCharges).map(([itemName, data]) => (
            <li key={itemName}>
              {itemName} {data.count > 1 && `x ${data.count}`} - ${data.total.toFixed(2)}
            </li>
          ))}
        </ul>
        <button onClick={handleCheckout} className="btn btn-danger btn-full-width">
            Check Out & Receive Bill
        </button>
      </div>

      <div className="card">
        <h2>Room Service</h2>
        {message && <p className="message message-success">{message}</p>}
        {error && <p className="message message-error">{error}</p>}
        <ul>
            {roomServices.map((service, index) => (
                <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span>{service.item} - ${service.price.toFixed(2)}</span>
                    <button onClick={() => handleAddCharge(service)} className="btn btn-success">Add</button>
                </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default GuestPortal;