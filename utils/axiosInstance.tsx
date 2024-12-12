// utils/axiosInstance.js
import axios from "axios";
import { getCookie } from "cookies-next";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = getCookie('auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      handleForbiddenError();
    }
    return Promise.reject(error);
  }
);

const handleForbiddenError = () => {
  document.cookie.split(";").forEach((cookie) => {
    document.cookie = cookie
      .replace(/^ +/, "")
      .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
  });
  
  window.location.href = "/";
};

export default axiosInstance;
