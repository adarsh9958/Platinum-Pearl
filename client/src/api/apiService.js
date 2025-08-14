import axios from 'axios';

// The base URL for your backend server
const API_URL = 'https://platinum-pearl.onrender.com/api'|| 'http://localhost:5000/api';

const apiService = axios.create({
  baseURL: API_URL,
});

export const getAvailableRooms = () => {
  return apiService.get('/rooms/available');
};

export const checkInGuest = (checkInData) => {
  return apiService.post('/bookings/checkin', checkInData);
};

export const getBookingStatus = (key) => {
  return apiService.get(`/bookings/status/${key}`);
};

export const checkOutGuest = (uniqueKey) => {
  return apiService.post('/bookings/checkout', { uniqueKey });
};

export const addChargeToBooking = (uniqueKey, chargeData) => {
  return apiService.post('/bookings/add-charge', { uniqueKey, ...chargeData });
};

export const loginAdmin = (credentials) => {
  return apiService.post('/auth/login', credentials);
};

// Helper function to get auth headers
const getConfig = (token) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const signupGuest = (userData) => {
  return apiService.post('/auth/register', { ...userData, role: 'guest' });
};

export const loginGuest = (credentials) => {
  return apiService.post('/auth/login', credentials);
};

export const getMyBookings = (token) => {
  return apiService.get('/bookings/mybookings', getConfig(token)); // getConfig is our helper from before
};

export const getAllRooms = (token) => {
  return apiService.get('/rooms', getConfig(token));
};

export const getRoomDetails = (id) => {
  return apiService.get(`/rooms/${id}`);
};

export const updateRoomStatus = (id, status, token) => {
  return apiService.put(`/rooms/${id}/status`, { status }, getConfig(token));
};

export const getBookings = (token, filters = {}) => {
  // Construct query parameters from filters object
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);

  return apiService.get(`/bookings?${params.toString()}`, getConfig(token));
};

export const cancelBooking = (id, token) => {
  return apiService.delete(`/bookings/${id}`, getConfig(token));
};

export const getReport = (token, startDate, endDate) => {
  const params = new URLSearchParams({ startDate, endDate });
  return apiService.get(`/bookings/report?${params.toString()}`, getConfig(token));
};

export const checkRoomAvailability = (startDate, endDate) => {
    const params = new URLSearchParams({ startDate, endDate });
    return apiService.get(`/rooms/availability?${params.toString()}`);
};