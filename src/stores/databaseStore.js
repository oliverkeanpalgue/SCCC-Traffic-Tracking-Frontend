import { defineStore } from "pinia";
import axiosClient from "../axios";

// Road traffic management store
export const useDatabaseStore = defineStore("database", {
  state: () => ({
    users: [],
    roads: [],
    isLoading: false,
    error: null,
  }),
  
  actions: {
    async fetchData() {
      this.isLoading = true;
      this.error = null;
      const API_KEY = import.meta.env.VITE_API_KEY;
      const headers = { "x-api-key": API_KEY };
      
      try {
        // Parallel API requests for performance
        const [resUsers, resRoads] = await Promise.all([
          axiosClient.get("/api/users", { headers }),
          axiosClient.get("/api/traffic-tracking/roads", { headers }),
        ]);

        this.users = resUsers.data;
        
        // Transform road data for frontend use
        this.roads = resRoads.data.roads.map(road => ({
          ...road,
          properties: {
            id: road.id.toString(),
            name: road.road_name,
            roadType: road.road_type_id ? this.getRoadTypeName(road.road_type_id) : "Unknown",
          }
        }));

        console.log("Roads data from database:", this.roads);
      } catch (error) {
        this.error = error;
        console.error("Error fetching data:", error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    // Convert road type ID to human-readable name
    getRoadTypeName(typeId) {
      const typeMap = { 1: "Intersection", 2: "Rotunda", 3: "Street", 4: "Entry Point", 5: "Road" };
      return typeMap[typeId] || "Unknown";
    },
    
    async updateTrafficStatus(roadId, direction, statusId) {
      try {
        // Update backend
        const API_KEY = import.meta.env.VITE_API_KEY;
        const endpoint = `/api/traffic-tracking/${direction === "inbound" ? "inbound" : "outbound"}/${roadId}`;
        const response = await axiosClient.put(
          endpoint,
          { status_id: statusId },
          { headers: { "x-api-key": API_KEY } }
        );

        // Update local state
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

    // Map traffic status ID to color name
    getColorFromStatusId(statusId) {
      return { 1: "green", 2: "yellow", 3: "red" }[statusId] || "green";
    },
  },
  
  getters: {
    // Find road by ID
    getRoadById: state => id => state.roads.find(road => road.id === id),

    // Get coordinates for a specific road direction
    getRoadCoordinates: state => (roadId, direction) => {
      const road = state.roads.find(r => r.id === roadId);
      return road?.geometry?.coordinates?.[direction] || [];
    },
  },
});