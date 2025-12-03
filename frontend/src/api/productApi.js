import { axiosClient } from "./axiosClient.js";

const BASE = "/products";

export const productApi = {

    // GET /products
    list: async (params = {}, userId) =>
        axiosClient.get(BASE, { params, data: { userId } }),

    // GET /products/:id
    getById: async (id, params = {}, userId) => {
        if (id == null || id === "") throw new Error("Product id is required");
        return axiosClient.get(`${BASE}/${encodeURIComponent(id)}`, { params, data: { userId } });
    },

    // GET /products/search-filter
    searchFilter: async (params = {}, userId) =>
        axiosClient.get(`${BASE}/search-filter`, { params, data: { userId } }),

    // GET /products/category/:categoryId
    byCategory: async (categoryId, params = {}, userId) =>
        axiosClient.get(`${BASE}/category/${encodeURIComponent(categoryId)}`, { params, data: { userId } }),
    // GET /products/myproducts/:userId
    byUser: async (userId, page = 1) =>
        axiosClient.get(`${BASE}/myproducts/${encodeURIComponent(userId)}?page=${page}`),

    // GET /products/category/:categoryId/count
    countByCategory: async (categoryId) =>
        axiosClient.get(`${BASE}/category/${encodeURIComponent(categoryId)}/count`),

    // GET /products/user/:userId/count
    countByUser: async (userId) =>
        axiosClient.get(`${BASE}/user/${encodeURIComponent(userId)}/count`),

    // POST /products
    create: async (data) =>
        axiosClient.post(BASE, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    // DELETE /products/:id
    delete: async (id) => {
        if (id == null || id === "") throw new Error("Product id is required");
        return axiosClient.delete(`${BASE}/${encodeURIComponent(id)}`);
    },

    // PUT /products/:id
    update: async (id, data) => {
        if (id == null || id === "") throw new Error("Product id is required");
        return axiosClient.put(`${BASE}/${encodeURIComponent(id)}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    // GET /:userId/sold
    bySold: (userId, page = 1) => axiosClient.get(`/products/${userId}/sold`, { params: { page } }),

    addFavorite: (userId, productId) => axiosClient.post(`/users/${userId}/favorites/${productId}`),
    removeFavorite: (userId, productId) => axiosClient.delete(`/users/${userId}/favorites/${productId}`),
    getFavorites: (userId) => axiosClient.get(`/users/${userId}/favorites`),

};
