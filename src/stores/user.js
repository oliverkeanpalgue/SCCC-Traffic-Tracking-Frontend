import { defineStore } from "pinia";
import axiosClient from "../axios.js";
const API_KEY = import.meta.env.VITE_API_KEY;

const useUserStore = defineStore("user", {
  state: () => ({
    user: null,
    loading: false,
  }),
  actions: {
    async fetchUser() {
      try {
        this.loading = true;
        const { data } = await axiosClient.get("/api/user", {
          headers: { "x-api-key": API_KEY },
        });
        this.user = data;
      } catch (error) {
        console.warn("⚠️ User not logged in or failed to fetch:", error);
        this.user = null;
      } finally {
        this.loading = false;
      }
    },
  },
});

export default useUserStore;