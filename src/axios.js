import axios from "axios";
import router from "./router.js";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  withXSRFToken: true
})

// axiosClient.interceptors.request.use(config => {
//   config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`
// })


axiosClient.interceptors.response.use((response) => {
  return response;
}, error => {
  if (error.response && error.response.status === 401) {
    if (router.currentRoute.value.name !== 'Login') {
      router.push({ name: 'Login' });
    } else if (router.currentRoute.value.name !== 'Guest') {
      router.push({ name: 'Guest' });
    }
  }

  throw error;
})


export default axiosClient