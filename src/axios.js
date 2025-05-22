import axios from "axios";
import router from "./router.js";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  withXSRFToken: true
});

axiosClient.interceptors.response.use(response => {
  return response;
}, error => {
  if (error.response && error.response.status === 401) {
    const currentRoute = router.currentRoute.value;
    // Only redirect to login for protected routes
    if (currentRoute.meta.requiresAuth && !currentRoute.meta.allowGuest) {
      router.push('/login');
    }
  }
  throw error;
});

export default axiosClient;