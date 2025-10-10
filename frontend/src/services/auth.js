import api from './api.js';

export const authService = {
    async login(email, password) {
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.token) {
                localStorage.setItem('token', response.token);
            }
            return response;

        } catch (error) {
            throw new Error(error.message || 'Login failed');   
        }
    },

    async logout() {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            //localStorage.removeItem('user');
        }
    },

    isAuthenticated() {
        return !!localStorage.getItem('token');
    },

    getToken() {
        return localStorage.getItem('token');
    },

    // getUser() {
    //     const user = localStorage.getItem('user');
    //     return user ? JSON.parse(user) : null;
    // }
}