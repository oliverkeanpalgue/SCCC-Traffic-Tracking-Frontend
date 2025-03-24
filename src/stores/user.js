import { defineStore } from "pinia";
import axiosClient from "../axios.js";
const API_KEY = import.meta.env.VITE_API_KEY;

const useUserStore = defineStore("user", {
  state: () => ({
    user: null
  }),
  actions: {
    fetchUser() {
      return axiosClient.get("/api/user", {
        headers: {
          "x-api-key": API_KEY
        }
      })
      .then(({ data }) => {
        console.log(data);
        this.user = data;
      })
      .catch(error => {
        console.error("Error fetching user:", error);
      });
    }
  }
});

export default useUserStore;
