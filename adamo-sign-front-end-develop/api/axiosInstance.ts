import { settingsApp } from "@/config/environment/settings";
import { COOKIES_APP } from "@/const/cookies";
import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: settingsApp.api.base,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    Accept: "application/json",
    CacheControl: "no-cache",
    Pragma: "no-cache",
    Expires: "0",
  },
});

export const cancelTokenSource = axios.CancelToken.source();

const getToken = () => {
  try {
    const tempToken = typeof window !== 'undefined' 
      ? sessionStorage.getItem(`${COOKIES_APP.ADS_TKAPPAD}_temp`) 
      : null;
    if (tempToken) return tempToken;
    
    const cookieToken = Cookies.get(COOKIES_APP.ADS_TKAPPAD);
    if (cookieToken) return cookieToken;
    
    const localToken = typeof window !== 'undefined' 
      ? localStorage.getItem(COOKIES_APP.ADS_TKAPPAD)
      : null;
    if (localToken) return localToken;
    
    return null;
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const token = getToken();

      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error parsing token:", error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.config && error.config.url === "/api/v1/auth/accept-terms") {
      const token = getToken(); // Usar la función actualizada
      if (token) {
        error.config.headers["Authorization"] = `Bearer ${token}`;
        return axiosInstance.request(error.config);
      }
    }
    console.error("API Error:", error);
    return Promise.reject(error);
  },
);

export default axiosInstance;