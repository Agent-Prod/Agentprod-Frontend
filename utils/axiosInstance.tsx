// utils/axiosInstance.js
import axios from "axios";
import Cookies from "js-cookie";

const token = Cookies.get('Authorization');
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  // 10 second timeout
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  },
  // You can add more default settings here
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("Authorization");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
