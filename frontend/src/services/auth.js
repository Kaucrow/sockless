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

    async forgotPassword(email) {
        try {
            const response = await api.post('/auth/forgot-password', { email });
            return response.data;
        } catch (error) {
            console.error('Forgot password error:', error);
            throw error;
        }
    },

    async resetPassword(token, newPassword) {
        try {
            const response = await api.put('/auth/forgot-password/reset', { token, passwd: newPassword });
            return response.data;
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
    },

    async register(email, password, name, surname) {
        try {
            const response = await api.post('/auth/register', { email, passwd: password, name, surname });
            return response.data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    async validateEmail(token) {
        try {
            const response = await api.post('/auth/register/verify-email', { token });
            return response.data;
        } catch (error) {
            console.error('Email validation error:', error);
            throw error;
        }
    }

    // getUser() {
    //     const user = localStorage.getItem('user');
    //     return user ? JSON.parse(user) : null;
    // }
}