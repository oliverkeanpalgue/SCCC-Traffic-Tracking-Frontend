import { defineStore } from "pinia";
import axiosClient from "../axios.js";
const API_KEY = import.meta.env.VITE_API_KEY;

const useUserStore = defineStore("user", {
  state: () => ({
    user: null,
    inventoryAccess: null,
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

        // Fetch inventory access for this user
        const accessRes = await axiosClient.get("/api/inventory_access", {
          headers: { "x-api-key": API_KEY },
        });

        if (this.user && this.user.id) {
          const accessRes = await axiosClient.get("/api/inventory_access", {
            headers: { "x-api-key": API_KEY },
          });

          this.inventoryAccess = accessRes.data.find(
            (access) => access.user_id === this.user.id
          );

          console.log("🔐 inventoryAccess:", this.inventoryAccess);
        } else {
          this.inventoryAccess = null;
          router.push("/login");
        }
      } catch (error) {
        console.warn("⚠️ User not logged in or failed to fetch:", error);
        this.user = null;
        this.inventoryAccess = null;
      } finally {
        this.loading = false;
      }
    },
  },
});

export default useUserStore;
