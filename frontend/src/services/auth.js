import api from './api.js';

export const authService = {
    async login(email, password) {
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
            return response.data;

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
        const token = localStorage.getItem('token');
        return !!token && token !== 'null' && token !== 'undefined';
    },

    getToken() {
        return localStorage.getItem('token');
    },

    // getUser() {
    //     const user = localStorage.getItem('user');
    //     return user ? JSON.parse(user) : null;
    // }
}