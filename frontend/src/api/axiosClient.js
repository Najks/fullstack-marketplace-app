import axios from "axios";

const axiosClient = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

axiosClient.interceptors.request.use(
    (config) => {
        if (import.meta.env.DEV) {
            console.log("Request sent to:", config.method?.toUpperCase(), config.url);
        }
        return config;
    },
    (error) => Promise.reject(error)
);


axiosClient.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        if (error.response?.status === 401) {
            console.warn("Token expired or unauthorized.");
        }
        return Promise.reject(error);
    }
);

export { axiosClient };
