import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('autopilote_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (r) => r,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('autopilote_token');
            localStorage.removeItem('autopilote_user');
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/app/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
