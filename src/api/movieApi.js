import axiosClient from "./axiosClient";

export const movieApi = {
    getAll: (params = {}) => axiosClient.get('/movies', { params }),
    getShowing: (params = {}) => axiosClient.get('/movies', { params: { ...params, status: 'showing' } }),
    getComingSoon: (params = {}) => axiosClient.get('/movies', { params: { ...params, status: 'coming_soon' } }),
    getById: (id) => axiosClient.get(`/movies/${id}`),
    getShowtimes: (id) => axiosClient.get(`/movies/${id}/showtimes`),
    create: (data) => axiosClient.post('/movies', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, data) => axiosClient.put(`/movies/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => axiosClient.delete(`/movies/${id}`)
};