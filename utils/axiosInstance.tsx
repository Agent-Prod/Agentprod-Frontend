// utils/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  // 10 second timeout
  headers: {
    "Content-Type": "application/json",
  },
  // You can add more default settings here
});

export default axiosInstance;
