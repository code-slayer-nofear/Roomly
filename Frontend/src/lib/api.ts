import axios from "axios";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle X-New-Token silent refresh + 401 logout
api.interceptors.response.use(
  (response) => {
    const newToken = response.headers["x-new-token"];
    if (newToken) useAuthStore.getState().setToken(newToken);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) useAuthStore.getState().logout();
    return Promise.reject(error);
  }
);

export default api;
