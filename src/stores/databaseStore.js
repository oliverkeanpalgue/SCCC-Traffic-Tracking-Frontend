// /src/stores/databaseStore.js
import { defineStore } from 'pinia'
import axiosClient from '../axios'
import coordinates from '../data/coordinates.json'

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
        
        // Merge API data with GeoJSON coordinates
        this.roads = resRoads.data.roads.map(road => {
          const geoFeature = coordinates.features.find(f => 
            f.properties.id === road.id.toString()
          );
          
          return {
            ...road,
            geometry: geoFeature?.geometry || null,
            properties: {
              // From GeoJSON
              ...(geoFeature?.properties || {}),
              // From API (override GeoJSON properties if needed)
              name: road.road_name || geoFeature?.properties?.name,
            }
          };
        });
        
        console.log("Merged roads data:", this.roads);
      } catch (error) {
        this.error = error;
        console.error("Error fetching data:", error);
        throw error;
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
        
        // Update local state with merged data
        const roadIndex = this.roads.findIndex(r => r.id === roadId);
        if (roadIndex > -1) {
          this.roads[roadIndex][direction].status_id = statusId;
          this.roads[roadIndex][`${direction}Color`] = this.getColorFromStatusId(statusId);
        }
        
        return response.data;
      } catch (error) {
        console.error("Error updating traffic status:", error);
        throw error;
      }
    },

    getColorFromStatusId(statusId) {
      const statusMap = { 1: 'green', 2: 'yellow', 3: 'red' };
      return statusMap[statusId] || 'green';
    }
  },
  getters: {
    getRoadById: (state) => (id) => {
      return state.roads.find(road => road.id === id);
    },
    
    // New getter for coordinates access
    getRoadCoordinates: (state) => (roadId, direction) => {
      const road = state.roads.find(r => r.id === roadId);
      return road?.geometry?.coordinates?.[direction] || [];
    }
  }
})  