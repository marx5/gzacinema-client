import axiosClient from "./axiosClient";

export const cinemaApi = {
    getAll: () => axiosClient.get('/cinemas'),
    getById: (id) => axiosClient.get(`/cinemas/${id}`),
    create: (data) => axiosClient.post('/cinemas', data),
    update: (id, data) => axiosClient.put(`/cinemas/${id}`, data),
    delete: (id) => axiosClient.delete(`/cinemas/${id}`),

    // Rooms
    getRooms: (cinemaId) => axiosClient.get(`/rooms/cinema/${cinemaId}`),
    createRoom: (cinemaId, data) => axiosClient.post(`/rooms/${cinemaId}`, data),
    deleteRoom: (roomId) => axiosClient.delete(`/rooms/${roomId}`)
};