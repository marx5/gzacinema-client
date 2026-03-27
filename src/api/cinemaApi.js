import axiosClient from "./axiosClient";

export const cinemaApi = {
    getAll: () => axiosClient.get('/cinemas'),
    getById: (id) => axiosClient.get(`/cinemas/${id}`),
    create: (data) => axiosClient.post('/cinemas', data),
    update: (id, data) => axiosClient.put(`/cinemas/${id}`, data),
    delete: (id) => axiosClient.delete(`/cinemas/${id}`),

    getRooms: (cinemaId) => axiosClient.get(`/cinemas/${cinemaId}/rooms`),
    createRoom: (cinemaId, data) => axiosClient.post(`/cinemas/${cinemaId}/rooms`, data),
    updateRoom: (cinemaId, roomId, data) => axiosClient.put(`/cinemas/${cinemaId}/rooms/${roomId}`, data),
    deleteRoom: (cinemaId, roomId) => axiosClient.delete(`/cinemas/${cinemaId}/rooms/${roomId}`),

    updateSeatStatus: (cinemaId, roomId, seatId, data) => axiosClient.put(`/cinemas/${cinemaId}/rooms/${roomId}/seats/${seatId}`, data)
};