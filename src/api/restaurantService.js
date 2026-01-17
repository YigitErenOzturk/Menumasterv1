import api from './axiosInstance.js';

export const restaurantService = {
    getInfo: (id) => api.get(`/restaurants/${id}`),
    getAll: () => api.get('/restaurants/all'),
    updateRestaurant: (id, payload) => api.put(`/restaurants/update/${id}`, payload),
    getMenu: () => api.get('/restaurants/menu'),
    addMenuItem: (item) => api.post('/restaurants/menu', item),
    deleteMenuItem: (id) => api.delete(`/restaurants/menu/${id}`),
    getReservations: () => api.get('/reservations/by-restaurant'),
    updateReservation: (id, status) => api.put(`/reservations/${id}`, { status }),
    getReviews: (resId) => api.get(`/reviews/restaurant/${resId}`),
    register: (restaurantData) => api.post('/restaurants/Register', restaurantData),
    login: (credentials) => api.post('/restaurants/login', credentials),
};