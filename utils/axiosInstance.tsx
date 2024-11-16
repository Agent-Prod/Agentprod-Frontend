// utils/axiosInstance.js
import axios from "axios";
import { cookies } from "next/headers";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// For client-side requests
if (typeof window !== 'undefined') {
  axiosInstance.interceptors.request.use(
    async (config) => {
      const response = await fetch('/api/auth/token');
      const { token } = await response.json();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
}

export default axiosInstance;
