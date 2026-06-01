import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:5000/api', // Keeping /api as base, but test endpoint is at root
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a specific method for the health check which is at the root
export const checkBackendHealth = () => axios.get('http://127.0.0.1:5000/');

export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);

// ✅ Fraud API (real ML check)
export const predictFraudAPI = (data) => api.post("/fraud/check", data);

// ✅ Upload CSV API
export const uploadTransactionsCSV = (formData) => api.post('/transactions/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

// ✅ Analytics API
export const getAnalytics = () => api.get('/fraud/analytics');

// ✅ Random User API
export const getRandomUserAPI = () => api.get('/fraud/random-user');

export default api;
