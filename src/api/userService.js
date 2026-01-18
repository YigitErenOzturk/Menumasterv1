import api from './axiosInstance.js';

export const userService = {
    // Profile transactions
    getUserInfo: (id) => api.get(`/users/${id}`),
    updateUser: (id, payload) => api.put(`/users/update/${id}`, payload),

    // Discover restaurants
    getCities: () => api.get('/cities'),
    getPopularRestaurants: () => api.get('/restaurants/popular'),
    getAllRestaurants: () => api.get('/restaurants/all'),
    getRestaurantsByCity: (city) => api.get(`/restaurants?city=${encodeURIComponent(city)}`),

    // Reservation transactions
    getMyReservations: () => api.get('/reservations/my-reservations'),
    cancelReservation: (id) => api.delete(`/reservations/${id}`),

    // Reviews
    getMyReviews: () => api.get('/reviews/my-reviews'),
    updateReview: (id, payload) => api.put(`/reviews/${id}`, payload),
    deleteReview: (id) => api.delete(`/reviews/${id}`),

    // Auth
    forgotPassword: (email) => api.post('/Auth/forgot-password', { email }),
    register: (userData) => api.post('/users/register', userData),
    login: (credentials) => api.post('/users/login', credentials),
};