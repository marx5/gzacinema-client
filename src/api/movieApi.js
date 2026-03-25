import axiosClient from "./axiosClient";

export const movieApi = {
    getAll: () => axiosClient.get('/movies'),
    getShowing: () => axiosClient.get('/movies?status=showing'),
    getComingSoon: () => axiosClient.get('/movies?status=coming_soon'),
    getById: (id) => axiosClient.get(`/movies/${id}`),
    getShowtimes: (id) => axiosClient.get(`/movies/${id}/showtimes`),
    create: (data) => axiosClient.post('/movies', data),
    update: (id, data) => axiosClient.put(`/movies/${id}`, data),
    delete: (id) => axiosClient.delete(`/movies/${id}`)
};