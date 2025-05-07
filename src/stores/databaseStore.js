// /src/stores/databaseStore.js
import { defineStore } from 'pinia'
import axiosClient from '../axios'

export const useDatabaseStore = defineStore('database', {
  state: () => ({
    users: [],
    roads: [],
    isLoading: false,
    error: null
  }),
  actions: {
    async fetchData() {
      this.isLoading = true;
      this.error = null;
      const API_KEY = import.meta.env.VITE_API_KEY;
      try {
        const [resUsers, resRoads] = await Promise.all([
          axiosClient.get('/api/users', { headers: { 'x-api-key': API_KEY } }),
          axiosClient.get('/api/traffic-tracking/roads', { headers: { 'x-api-key': API_KEY } }),
        ]);
  
        this.users = resUsers.data;
        this.roads = resRoads.data.roads;
        console.log("Data fetched successfully:", this.roads);
      } catch (error) {
        this.error = error;
        console.error("Error fetching data:", error);
        throw error; // Re-throw to allow components to handle errors
      } finally {
        this.isLoading = false;
      }
    },
    
    async updateTrafficStatus(roadId, direction, statusId) {
      try {
        const API_KEY = import.meta.env.VITE_API_KEY;
        const endpoint = direction === 'inbound' ? 'inbound' : 'outbound';
        const response = await axiosClient.put(
          `/api/traffic-tracking/${endpoint}/${roadId}`,
          { status_id: statusId },
          { headers: { 'x-api-key': API_KEY } }
        );
        
        // Update local state immediately
        const road = this.roads.find(r => r.id === roadId);
        if (road) {
          road[direction].status_id = statusId;
        }
        
        return response.data;
      } catch (error) {
        console.error("Error updating traffic status:", error);
        throw error;
      }
    }
  },
  getters: {
    getRoadById: (state) => (id) => {
      return state.roads.find(road => road.id === id);
    }
  }
})