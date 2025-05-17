import { defineStore } from "pinia";
import axiosClient from "../axios";

// Road traffic status mapping
const STATUS_ID_TO_COLOR = { 1: "green", 2: "yellow", 3: "red" };
const DEFAULT_STATUS_ID = 1;

// Road type mapping
const ROAD_TYPE_NAMES = {
  1: "Intersection",
  2: "Rotunda",
  3: "Street",
  4: "Entry Point",
  5: "Road",
};

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
        this.roads = resRoads.data.roads.map((road) => ({
          ...road,
          properties: {
            id: road.id.toString(),
            name: road.road_name,
            roadType: road.road_type_id
              ? this.getRoadTypeName(road.road_type_id)
              : "Unknown",
          },
        }));
      } catch (error) {
        this.error = error;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    getRoadTypeName(typeId) {
      return ROAD_TYPE_NAMES[typeId] || "Unknown";
    },

    async updateTrafficStatus(roadId, direction, statusId) {
      try {
        const API_KEY = import.meta.env.VITE_API_KEY;
        const endpoint = `/api/traffic-tracking/${direction}/${roadId}`;
        const response = await axiosClient.put(
          endpoint,
          { status_id: statusId },
          { headers: { "x-api-key": API_KEY } }
        );

        // Update local state
        const roadIndex = this.roads.findIndex((r) => r.id === roadId);
        if (roadIndex > -1) {
          this.roads[roadIndex][direction].status_id = statusId;
          this.roads[roadIndex][`${direction}Color`] =
            this.getColorFromStatusId(statusId);
        }

        return response.data;
      } catch (error) {
        throw error;
      }
    },

    async updateRoadCoordinates(roadId, direction, coordinates) {
      try {
        const API_KEY = import.meta.env.VITE_API_KEY;
        const endpoint = `/api/traffic-tracking/${direction}-coordinates/${roadId}`;

        // Ensure coordinates are parsed if they're in string format
        let coordData = coordinates;
        if (typeof coordinates === "string") {
          try {
            coordData = JSON.parse(coordinates);
          } catch (e) {
            throw new Error("Invalid coordinate format");
          }
        }

        // Send the coordinates in the expected format
        const response = await axiosClient.put(
          endpoint,
          { coordinates: coordData },
          {
            headers: {
              "x-api-key": API_KEY,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        // Update local state after successful API call
        this.updateLocalRoadCoordinates(roadId, direction, coordData);

        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Helper method to update road coordinates in local state
    updateLocalRoadCoordinates(roadId, direction, coordinates) {
      const roadIndex = this.roads.findIndex(
        (r) => r.id.toString() === roadId.toString()
      );

      if (roadIndex > -1) {
        // Initialize objects if they don't exist
        if (!this.roads[roadIndex][direction]) {
          this.roads[roadIndex][direction] = {};
        }
        this.roads[roadIndex][direction].coordinates = coordinates;

        // Update geometry structure for consistency
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
      }
    },

    async refreshRoadData(roadId) {
      try {
        // Fetch all data to ensure we get the latest state
        await this.fetchData();

        // Find and return the refreshed road
        return this.roads.find(
          (road) => road.id.toString() === roadId.toString()
        );
      } catch (error) {
        throw error;
      }
    },

    async fetchRoadCoordinates(roadId, direction) {
      try {
        this.isLoading = true;
        const API_KEY = import.meta.env.VITE_API_KEY;
        const endpoint = `/api/traffic-tracking/${direction}-coordinates/${roadId}`;

        const response = await axiosClient.get(endpoint, {
          headers: { "x-api-key": API_KEY },
        });

        if (response.data && response.data[direction]) {
          return response.data[direction].coordinates || [];
        }
        return [];
      } catch (error) {
        return [];
      } finally {
        this.isLoading = false;
      }
    },

    async updateRoadInfo(roadId, roadData) {
      try {
        const API_KEY = import.meta.env.VITE_API_KEY;
        const endpoint = `/api/traffic-tracking/road/${roadId}`;

        // Prepare headers
        const headers = {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        };

        // Remove undefined values to prevent validation errors
        const cleanedData = { ...roadData };
        Object.keys(cleanedData).forEach((key) => {
          if (cleanedData[key] === undefined) {
            delete cleanedData[key];
          }
        });

        // Send update request
        const response = await axiosClient.put(endpoint, cleanedData, { headers });

        // Update local state if response contains road data
        if (response.data?.data?.road) {
          this.updateLocalRoadInfo(roadId, response.data.data.road);
        }

        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Helper method to update road info in local state
    updateLocalRoadInfo(roadId, updatedRoad) {
      const index = this.roads.findIndex(
        (r) => r.id.toString() === roadId.toString()
      );

      if (index === -1) return;

      // Update road name if provided
      if (updatedRoad.road_name !== undefined) {
        // Direct road_name property
        this.roads[index].road_name = updatedRoad.road_name;

        // properties.name path
        if (this.roads[index].properties) {
          this.roads[index].properties.name = updatedRoad.road_name;
        }

        // Update inbound/outbound feature data
        ["inbound", "outbound"].forEach((direction) => {
          // Find and update any source data in the map
          if (this.roads[index].geometry?.coordinates?.[direction]) {
            if (!this.roads[index][`${direction}_features`]) {
              this.roads[index][`${direction}_features`] = {};
            }
            this.roads[index][`${direction}_features`].roadName = updatedRoad.road_name;
          }
        });
      }

      // Update road type if provided
      if (updatedRoad.road_type_id !== undefined) {
        this.roads[index].road_type_id = updatedRoad.road_type_id;
      }

      // Update the properties object for consistency
      this.roads[index].properties = {
        ...this.roads[index].properties,
        name: updatedRoad.road_name,
        roadType: updatedRoad.road_type_id
          ? this.getRoadTypeName(updatedRoad.road_type_id)
          : "Unknown",
      };
    },

    // Convert status ID to color name
    getColorFromStatusId(statusId) {
      return STATUS_ID_TO_COLOR[statusId] || STATUS_ID_TO_COLOR[DEFAULT_STATUS_ID];
    },
  },

  getters: {
    // Find road by ID
    getRoadById: (state) => (id) => {
      const idStr = String(id);
      return state.roads.find((road) => String(road.id) === idStr);
    },

    getRoadCoordinates: (state) => (roadId, direction) => {
      const idStr = String(roadId);
      const road = state.roads.find((r) => String(r.id) === idStr);

      if (!road) {
        return [];
      }

      // Try different paths to find coordinates
      let coords = [];

      // Check geometry path first
      if (road?.geometry?.coordinates?.[direction]) {
        coords = road.geometry.coordinates[direction];
      }
      // Check direction object (inbound/outbound)
      else if (road?.[direction]?.coordinates) {
        if (typeof road[direction].coordinates === "string") {
          try {
            coords = JSON.parse(road[direction].coordinates);
          } catch (e) {
            // Return empty array on parse error
            return [];
          }
        } else {
          coords = road[direction].coordinates;
        }
      }

      return coords || [];
    },
  },
});