import axiosClient from "./axiosClient";

export const authApi = {
    login: (data) => axiosClient.post('/auth/login', data),
    register: (data) => axiosClient.post('/auth/register', data),
    logout: () => axiosClient.post('/auth/logout'),
    getProfile: () => axiosClient.get('/users/me'),
    getHistory: () => axiosClient.get('/users/history'),
    updateProfile: (data) => axiosClient.put('/users/me', data)
};