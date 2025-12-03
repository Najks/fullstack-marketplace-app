import { axiosClient } from './axiosClient.js';

export const authApi = {
    googleCallback: (credential) =>
        axiosClient.post('/auth/google/callback', { code: credential }),
    me: () => axiosClient.get('/auth/me'),
    logout: () => axiosClient.post('/auth/logout'),
    updateProfile: (userId, profileData) =>
        axiosClient.put(`/users/${userId}`, profileData),
};