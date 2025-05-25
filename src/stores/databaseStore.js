// Store definition
import { defineStore } from "pinia";
import axiosClient from "../axios";

// Configuration
const STATUS_COLORS = { 1: "green", 2: "yellow", 3: "red" };
const DEFAULT_STATUS = 1;
const API_ENDPOINTS = {
  USERS: "/api/users",
  ROADS: "/api/traffic-tracking/roads",
  ROAD_TYPES: "/api/traffic-tracking/road-types",
  TRAFFIC_STATUS: (direction, id) => `/api/traffic-tracking/${direction}/${id}`,
  COORDINATES: (direction, id) =>
    `/api/traffic-tracking/${direction}-coordinates/${id}`,
  ROAD_INFO: (id) => `/api/traffic-tracking/road/${id}`,
};

export const useDatabaseStore = defineStore("database", {
  state: () => ({
    users: [],
    roads: [],
    roadTypes: [],
    isLoading: false,
    error: null,
    currentUser: null,
  }),

  actions: {
    // Data retrieval
    // Fetch all data with optional query parameters
    async fetchData(queryParams = "") {
      this.isLoading = true;
      this.error = null;

      try {
        const headers = this.getAuthHeaders();
        const [resUsers, resRoads, resRoadTypes] = await Promise.all([
          axiosClient.get(API_ENDPOINTS.USERS, { headers }),
          axiosClient.get(`${API_ENDPOINTS.ROADS}${queryParams}`, { headers }),
          axiosClient.get(API_ENDPOINTS.ROAD_TYPES, { headers }),
        ]);

        this.users = resUsers.data;
        this.roads = this.transformRoadData(resRoads.data.roads);

        if (resRoadTypes.data && Array.isArray(resRoadTypes.data.roadTypes)) {
          this.roadTypes = resRoadTypes.data.roadTypes;
        } else {
          console.warn(
            "Unexpected road types response format:",
            resRoadTypes.data
          );
          this.roadTypes = [];
        }

        return this.roads;
      } catch (error) {
        this.error = error;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Get road types
    async fetchRoadTypes() {
      try {
        const headers = this.getAuthHeaders();
        const response = await axiosClient.get(API_ENDPOINTS.ROAD_TYPES, {
          headers,
        });

        if (response.data && Array.isArray(response.data.roadTypes)) {
          this.roadTypes = response.data.roadTypes;
        } else {
          console.warn("Unexpected road types response format:", response.data);
          this.roadTypes = [];
        }
        return this.roadTypes;
      } catch (error) {
        console.error("Error fetching road types:", error);
        return [];
      }
    },

    // Get road coordinates
    async fetchRoadCoordinates(roadId, direction) {
      this.isLoading = true;
      try {
        const headers = this.getAuthHeaders();
        const endpoint = API_ENDPOINTS.COORDINATES(direction, roadId);
        const response = await axiosClient.get(endpoint, { headers });

        return response.data && response.data[direction]
          ? response.data[direction].coordinates || []
          : [];
      } catch (error) {
        return [];
      } finally {
        this.isLoading = false;
      }
    },

    // Data modification
    // Update traffic status for road direction
    async updateTrafficStatus(roadId, direction, statusId) {
      try {
        const headers = this.getAuthHeaders();
        const endpoint = API_ENDPOINTS.TRAFFIC_STATUS(direction, roadId);
        const response = await axiosClient.put(
          endpoint,
          { status_id: statusId },
          { headers }
        );

        this.updateRoadTrafficStatus(roadId, direction, statusId);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Update road coordinates
    async updateRoadCoordinates(roadId, direction, coordinates) {
      try {
        const headers = this.getAuthHeaders();
        const endpoint = API_ENDPOINTS.COORDINATES(direction, roadId);
        const coordData = this.normalizeCoordinates(coordinates);

        const response = await axiosClient.put(
          endpoint,
          { coordinates: coordData },
          {
            headers: {
              ...headers,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        this.updateLocalRoadCoordinates(roadId, direction, coordData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Create new road
    async createRoad(roadData, inboundCoords = null, outboundCoords = null) {
      try {
        const headers = this.getAuthHeaders();
        const response = await axiosClient.post(API_ENDPOINTS.ROADS, roadData, {
          headers: {
            ...headers,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        const newRoadId = response.data.data?.road?.id;

        if (newRoadId) {
          await this.saveRoadCoordinates(
            newRoadId,
            inboundCoords,
            outboundCoords
          );
        }

        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Update road information
    async updateRoadInfo(roadId, roadData) {
      try {
        const headers = this.getAuthHeaders();
        const cleanedData = this.removeUndefinedValues(roadData);
        const response = await axiosClient.put(
          API_ENDPOINTS.ROAD_INFO(roadId),
          cleanedData,
          {
            headers: {
              ...headers,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (response.data?.data?.road) {
          this.updateLocalRoadInfo(roadId, response.data.data.road);
        }

        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Refresh road data
    async refreshRoadData(roadId) {
      await this.fetchData();
      return this.getRoadById(roadId);
    },

    // Fetch current user
    async fetchCurrentUser() {
      try {
        const headers = this.getAuthHeaders();
        const response = await axiosClient.get('/api/user', { headers });
        this.currentUser = response.data;
        return response.data;
      } catch (error) {
        console.error('Error fetching current user:', error);
        throw error;
      }
    },

    // Helper functions
    // Get authorization headers
    getAuthHeaders() {
      const API_KEY = import.meta.env.VITE_API_KEY;
      return { "x-api-key": API_KEY };
    },

    // Transform road data for consistency
    transformRoadData(roads) {
      return roads.map((road) => ({
        ...road,
        properties: {
          id: road.id.toString(),
          name: road.road_name,
          roadType:
            road.road_type_name ||
            this.getRoadTypeName(road.road_type_id) ||
            "Unknown",
          road_type_id: road.road_type_id,
        },
      }));
    },

    // Set default road types
    setDefaultRoadTypes() {
      this.roadTypes = [
        { id: 1, name: "Intersection" },
        { id: 2, name: "Rotunda" },
        { id: 3, name: "Street" },
        { id: 4, name: "Entry Point" },
        { id: 5, name: "Road" },
      ];
      return this.roadTypes;
    },

    // Format coordinates for API
    normalizeCoordinates(coordinates) {
      if (typeof coordinates === "string") {
        try {
          return JSON.parse(coordinates);
        } catch (e) {
          throw new Error("Invalid coordinate format");
        }
      }
      return coordinates;
    },

    // Remove undefined values from object
    removeUndefinedValues(obj) {
      const cleaned = { ...obj };
      Object.keys(cleaned).forEach((key) => {
        if (cleaned[key] === undefined) delete cleaned[key];
      });
      return cleaned;
    },

    // Save coordinates for both directions
    async saveRoadCoordinates(roadId, inboundCoords, outboundCoords) {
      const updatePromises = [];
      if (inboundCoords) {
        updatePromises.push(
          this.updateRoadCoordinates(roadId, "inbound", inboundCoords)
        );
      }
      if (outboundCoords) {
        updatePromises.push(
          this.updateRoadCoordinates(roadId, "outbound", outboundCoords)
        );
      }
      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
      }
    },

    // Update local traffic status
    updateRoadTrafficStatus(roadId, direction, statusId) {
      const roadIndex = this.roads.findIndex((r) => r.id === roadId);
      if (roadIndex > -1) {
        if (!this.roads[roadIndex][direction]) {
          this.roads[roadIndex][direction] = {};
        }
        this.roads[roadIndex][direction].status_id = statusId;
        this.roads[roadIndex][`${direction}Color`] =
          this.getColorFromStatusId(statusId);
      }
    },

    // Update local coordinates
    updateLocalRoadCoordinates(roadId, direction, coordinates) {
      const roadIndex = this.getRoadIndexById(roadId);
      if (roadIndex === -1) return;

      if (!this.roads[roadIndex][direction]) {
        this.roads[roadIndex][direction] = {};
      }
      this.roads[roadIndex][direction].coordinates = coordinates;

      if (!this.roads[roadIndex].geometry) {
        this.roads[roadIndex].geometry = {
          type: "LineString",
          coordinates: {},
        };
      }
      if (!this.roads[roadIndex].geometry.coordinates) {
        this.roads[roadIndex].geometry.coordinates = {};
      }
      this.roads[roadIndex].geometry.coordinates[direction] = coordinates;
    },

    // Update local road information
    updateLocalRoadInfo(roadId, updatedRoad) {
      const index = this.getRoadIndexById(roadId);
      if (index === -1) return;

      if (updatedRoad.road_name !== undefined) {
        this.updateRoadName(index, updatedRoad.road_name);
      }

      if (updatedRoad.road_type_id !== undefined) {
        this.roads[index].road_type_id = updatedRoad.road_type_id;
      }

      this.roads[index].properties = {
        ...this.roads[index].properties,
        name: updatedRoad.road_name || this.roads[index].road_name,
        roadType: updatedRoad.road_type_id
          ? this.getRoadTypeName(updatedRoad.road_type_id)
          : this.roads[index].properties.roadType || "Unknown",
      };
    },

    // Update road name in all references
    updateRoadName(index, newName) {
      this.roads[index].road_name = newName;

      if (this.roads[index].properties) {
        this.roads[index].properties.name = newName;
      }

      ["inbound", "outbound"].forEach((direction) => {
        if (this.roads[index].geometry?.coordinates?.[direction]) {
          if (!this.roads[index][`${direction}_features`]) {
            this.roads[index][`${direction}_features`] = {};
          }
          this.roads[index][`${direction}_features`].roadName = newName;
        }
      });
    },

    // Get road index by ID
    getRoadIndexById(roadId) {
      return this.roads.findIndex((r) => r.id.toString() === roadId.toString());
    },

    // Get road type name from ID
    getRoadTypeName(typeId) {
      const foundType = this.roadTypes.find(
        (type) => type.id.toString() === typeId.toString()
      );
      return foundType ? foundType.name : "Unknown";
    },

    // Get color from status ID
    getColorFromStatusId(statusId) {
      return STATUS_COLORS[statusId] || STATUS_COLORS[DEFAULT_STATUS];
    },
  },

  getters: {
    // Get road by ID
    getRoadById: (state) => (id) => {
      const idStr = String(id);
      return state.roads.find((road) => String(road.id) === idStr);
    },

    // Get road coordinates
    getRoadCoordinates: (state) => (roadId, direction) => {
      const road = state.getRoadById(roadId);
      if (!road) return [];

      if (road?.geometry?.coordinates?.[direction]) {
        return road.geometry.coordinates[direction];
      }

      if (road?.[direction]?.coordinates) {
        if (typeof road[direction].coordinates === "string") {
          try {
            return JSON.parse(road[direction].coordinates);
          } catch (e) {
            return [];
          }
        }
        return road[direction].coordinates;
      }

      return [];
    },

    // Get current user
    getCurrentUser: (state) => state.currentUser,
  },
});