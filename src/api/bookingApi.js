import axiosClient from "./axiosClient";

export const bookingApi = {
    getSeats: (showtimeId) => axiosClient.get(`/bookings/showtime/${showtimeId}/seats`),
    holdSeat: (data) => axiosClient.post('/bookings/hold', data),
    unholdSeat: (data) => axiosClient.post('/bookings/unhold', data),
    createPayment: (data) => axiosClient.post('/payments/create-payment-url', data),
    getAllAdmin: (params) => axiosClient.get('/bookings', { params })
};