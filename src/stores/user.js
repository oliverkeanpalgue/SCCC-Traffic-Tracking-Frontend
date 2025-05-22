import { defineStore } from "pinia";
import axiosClient from "../axios.js";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null,
    loading: false,
    isGuest: true,
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.user && !state.isGuest,
  },

  actions: {
    async fetchUser(ignoreError = false) {
      try {
        this.loading = true;
        const { data } = await axiosClient.get("/api/user");
        
        if (data) {
          this.user = data;
          this.isGuest = false;
          return true;
        }
        return false;
      } catch (error) {
        if (!ignoreError) {
          console.warn("Guest user or failed to fetch:", error);
        }
        this.setGuestMode();
        return false;
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
