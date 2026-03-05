// Cliente para rutas API locales (Next.js)
import axiosLocal from "axios";
export const frontendApi = axiosLocal.create({
  baseURL: "/",
});
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "https://crmmibobackend-production.up.railway.app",
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
