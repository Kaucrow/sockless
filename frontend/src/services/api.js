import axios from 'axios';
import router from '@/router';

const API_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
})


api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        return config;
    }, 
    (error) => {
        return Promise.reject(error);
    },
)

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            localStorage.removeItem('token');
            router.push('/login');
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
)
export default {
    get: (endpoint, config = {}) => api.get(endpoint, config),
    post: (endpoint, data, config = {}) => api.post(endpoint, data, config),
    put: (endpoint, data, config = {}) => api.put(endpoint, data, config),
    delete: (endpoint, config = {}) => api.delete(endpoint, config),
}