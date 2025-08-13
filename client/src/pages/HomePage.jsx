import React, { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';


import GuestPortal from '../components/GuestPortal';
import { checkRoomAvailability, checkInGuest } from '../api/apiService';
import { useMediaQuery } from '../hooks/useMediaQuery'; 

const HomePage = () => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const numberOfMonths = isMobile ? 1 : 2; 
    // --- STATE MANAGEMENT ---
    const [keyInput, setKeyInput] = useState('');
    const [submittedKey, setSubmittedKey] = useState(null);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [range, setRange] = useState({ from: undefined, to: undefined });
    const [checkInData, setCheckInData] = useState({
        guestName: '',
        guestEmail: '',
        roomNumber: '',
        expectedCheckOutDate: '',
    });

    // --- EFFECTS ---
    useEffect(() => {
        const fetchAvailableRooms = async () => {
            // Only fetch if the date range is complete
            if (!range || !range.from || !range.to) {
                setAvailableRooms([]);
                return;
            }
            setLoading(true);
            try {
                const { data } = await checkRoomAvailability(range.from, range.to);
                setAvailableRooms(data);
                if (data.length > 0) {
                    setCheckInData(prev => ({ ...prev, roomNumber: data[0].roomNumber }));
                }
            } catch (err) {
                setError('Could not fetch room availability for the selected dates.');
            } finally {
                setLoading(false);
            }
        };

        fetchAvailableRooms();
    }, [range]);

    useEffect(() => {
        if (range && range.to) {
            setCheckInData(prev => ({...prev, expectedCheckOutDate: format(range.to, 'yyyy-MM-dd')}));
        }
    }, [range]);


    // --- HANDLERS ---
    
    // THIS IS THE FIX: This new function intelligently handles date selection
    // to prevent the blank page bug on double-click.
    const handleDateSelect = (selectedRange) => {
        if (selectedRange?.from && selectedRange?.to && selectedRange.from.getTime() === selectedRange.to.getTime()) {
            // If user double-clicks a single date, treat it as the start of a new selection
            setRange({ from: selectedRange.from, to: undefined });
        } else {
            setRange(selectedRange);
        }
    };
    
    const handleKeySubmit = (e) => {
        e.preventDefault();
        if (keyInput) setSubmittedKey(keyInput);
    };

    const handleCheckInChange = (e) => {
        setCheckInData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCheckInSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!checkInData.guestName || !checkInData.guestEmail || !checkInData.expectedCheckOutDate) {
            setError('Please fill in all fields.');
            return;
        }

        const submissionData = {
            ...checkInData,
            checkInDate: range.from
        };

        try {
            const { data } = await checkInGuest(submissionData);
            setMessage(data.message);
            // Reset state after successful booking
            setRange({ from: undefined, to: undefined });
            setCheckInData({ guestName: '', guestEmail: '', roomNumber: '', expectedCheckOutDate: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Check-in failed.');
        }
    };

    const handleCheckoutSuccess = () => {
        setSubmittedKey(null);
    };

    // --- RENDER LOGIC ---
    let footer = <p>Please select your check-in date.</p>;
    if (range?.from) {
        if (!range.to) {
            footer = <p>Selected Check-in: {format(range.from, 'PPP')}</p>;
        } else if (range.to) {
            footer = <p>Selected Stay: {format(range.from, 'PPP')} – {format(range.to, 'PPP')}</p>;
        }
    }

    return (
        <div className="home-page-wrapper">
            <div className="container">
                <h1>Welcome to The Platinum Pearl</h1>
                {submittedKey ? (
                    <GuestPortal uniqueKey={submittedKey} onCheckout={handleCheckoutSuccess} />
                ) : (
                    <>
                        {/* --- CALENDAR BOOKING --- */}
                        <div className="card">
                            <h2>Book Your Stay</h2>
                            <p>Select your check-in and check-out dates to see available rooms.</p>
                            <DayPicker
                                mode="range"
                                selected={range}
                                onSelect={handleDateSelect} // Use the new, corrected handler
                                footer={footer}
                                numberOfMonths={numberOfMonths}
                                disabled={{ before: new Date() }}
                            />
                        </div>

                        {/* --- AVAILABLE ROOMS & CHECK-IN FORM (only show if dates are selected) --- */}
                        {range?.from && range?.to && (
                            <>
                                <div className="card">
                                    <h2>Available Rooms for Your Stay</h2>
                                    {loading ? (
                                        <p>Checking availability...</p>
                                    ) : (
                                        <div className="room-list">
                                        {availableRooms.length > 0 ? availableRooms.map(room => (
                                            <div key={room._id} className="room-item">Room {room.roomNumber}</div>
                                        )) : <p>Sorry, no rooms are available for the selected dates.</p>}
                                        </div>
                                    )}
                                </div>

                                {availableRooms.length > 0 && (
                                    <div className="card">
                                        <h2>Confirm Your Reservation</h2>
                                        <form onSubmit={handleCheckInSubmit}>
                                            <div className="form-group">
                                                <label>Full Name</label>
                                                <input type="text" name="guestName" value={checkInData.guestName} onChange={handleCheckInChange} required />
                                            </div>
                                            <div className="form-group">
                                                <label>Email</label>
                                                <input type="email" name="guestEmail" value={checkInData.guestEmail} onChange={handleCheckInChange} required />
                                            </div>
                                            <div className="form-group">
                                                <label>Select a Room</label>
                                                <select name="roomNumber" value={checkInData.roomNumber} onChange={handleCheckInChange}>
                                                    {availableRooms.map(room => (
                                                        <option key={room._id} value={room.roomNumber}>Room {room.roomNumber}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <button type="submit" className="btn btn-success btn-full-width">Book Now</button>
                                        </form>
                                        {message && <p className="message message-success">{message}</p>}
                                        {error && <p className="message message-error">{error}</p>}
                                    </div>
                                )}
                            </>
                        )}
                        
                        {/* --- ALREADY CHECKED IN --- */}
                        <div className="card">
                          <h2>Already Checked In?</h2>
                          <form onSubmit={handleKeySubmit}>
                            <div className="form-group">
                              <label>Enter your unique key</label>
                              <input type="text" value={keyInput} onChange={(e) => setKeyInput(e.target.value)} />
                            </div>
                            <button type="submit" className="btn btn-primary btn-full-width">Access My Room</button>
                          </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default HomePage;