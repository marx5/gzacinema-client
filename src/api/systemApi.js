import axiosClient from "./axiosClient";

export const systemApi = {
    createShowtime: (data) => axiosClient.post('/showtimes', data),
    getStats: (params) => axiosClient.get('/statistics/dashboard', { params }),
    checkInTicket: (ticketId) => axiosClient.put(`/tickets/${ticketId}/checkin`),
    getShowtimesAdmin: (params) => axiosClient.get('/showtimes', { params }),
    deleteShowtime: (id) => axiosClient.delete(`/showtimes/${id}`)
};