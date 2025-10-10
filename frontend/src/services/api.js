import router from "@/router";

const API_URL = 'http://localhost:8000';

async function handleRequest(response) {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API request failed. status: ${response.status}`);
    }
    return response.json();
}

async function apiRequest(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;

    const defaultOptions = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    }

    const token = localStorage.getItem('token');
    if (token) {
        defaultOptions.headers.Authorization = `Bearer ${token}`;
    }

    const config = {
    ...defaultOptions,
    ...options,
        headers: {
        ...defaultOptions.headers,
        ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);

        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/login');
            return;
        }
        return await handleRequest(response);
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
}

export default {
    get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
    post: (endpoint, data) => apiRequest(endpoint, { method: 'POST', body: JSON.stringify(data) }),
    put: (endpoint, data) => apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
}