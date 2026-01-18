import api from './axiosInstance.js';

export const authService = {
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (code, newPassword, email) => api.post('/auth/reset-password', { code, newPassword, email })
};