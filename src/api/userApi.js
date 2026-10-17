import axiosClient from './axiosClient';

export const userApi = {
  getUsers: (params) => axiosClient.get('/users', { params }),
  createUser: (data) => axiosClient.post('/users', data),
  updateUser: (id, data) => axiosClient.put(`/users/${id}`, data),
  deleteUser: (id) => axiosClient.delete(`/users/${id}`),
};
