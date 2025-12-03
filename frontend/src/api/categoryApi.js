import { axiosClient } from './axiosClient.js';

export const categoryApi = {
    list: async (params = {}) => {
        return axiosClient.get('/categories', { params });
    },

    getById: async (id) => {
        return axiosClient.get(`/categories/${id}`);
    },

    create: async (data) => {
        return axiosClient.post('/categories', data);
    },

    update: async (id, data) => {
        return axiosClient.put(`/categories/${id}`, data);
    },

    delete: async (id) => {
        return axiosClient.delete(`/categories/${id}`);
    },
};
