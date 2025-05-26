import { defineStore } from "pinia";
import axiosClient from "../axios.js";

const useUserStore = defineStore("user", {
  state: () => ({
    user: null,
    userLoaded: false,
    SC3_API_KEY: import.meta.env.VITE_API_KEY
  }),

  actions: {
    // Fetch the user data
    async fetchUser() {
      try {
        const { data } = await axiosClient.get("/api/user", {
          headers: {
            "x-api-key": this.SC3_API_KEY
          }
        });
        
        this.user = data; 
      } catch (error) {
        this.user = null;
      } finally {
        this.userLoaded = true;
      }
      
    }
  },

  getters: {
      isLoggedIn: (state) => !!state.user,
    }
});

export default useUserStore;