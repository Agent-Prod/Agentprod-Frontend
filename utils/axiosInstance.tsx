// utils/axiosInstance.js
import axios from "axios";
import { getCookie, deleteCookie } from "cookies-next";

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
    console.log('Axios Error:', error);

    if (error.response) {
      if (error.response.status === 403) {
        handleForbiddenError();
      }
    }
    else if (error.code === 'ERR_NETWORK') {
      handleForbiddenError();
    }

    return Promise.reject(error);
  }
);

const handleForbiddenError = () => {

  deleteCookie('auth-token');
  deleteCookie('user');

  window.location.href = "/";
};

export default axiosInstance;
