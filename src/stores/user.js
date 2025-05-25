import { defineStore } from "pinia";
import axiosClient from "../axios.js";
const API_KEY = import.meta.env.VITE_API_KEY;

const useUserStore = defineStore("user", {
  state: () => ({
    user: null,
    loading: false,
    isGuest: true,
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.user && !state.isGuest,
  },

  actions: {
    async fetchUser() {
      try {
        this.loading = true;
        const { data } = await axiosClient.get("/api/user");
        
        if (data) {
          this.user = data;
          this.isGuest = false;
        }
      } catch (error) {
        console.warn("Guest user or failed to fetch:", error);
        this.user = null;
        this.isGuest = true;
      } finally {
        this.loading = false;
      }
    },

    setGuestMode() {
      this.user = null;
      this.isGuest = true;
    }
  },
});

export default useUserStore;
