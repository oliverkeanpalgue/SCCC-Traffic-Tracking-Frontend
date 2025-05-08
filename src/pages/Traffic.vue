<template>
  <div class="flex flex-row p-3 gap-2 h-[735px] bg-[#1b1a1a]" style="font-family: 'Montserrat', sans-serif;">
    <Sidebar :intersections="roads" :colorMap="colorMap" @openEditModal="openEditModal" />

    <!-- Map Component -->
    <div class="w-[75%] relative">
      <!-- Loading Overlay -->
      <div v-if="isLoading"
        class="absolute inset-0 bg-black bg-opacity-60 z-20 flex items-center justify-center rounded-xl">
        <div
          class="inline-block h-14 w-14 animate-spin rounded-full border-4 border-solid border-white border-r-transparent">
        </div>
      </div>

      <!-- Map Legend -->
      <div class="absolute text-white w-[150px] bg-[#1b1a1a] z-10 mt-[10px] ml-[10px] p-4 rounded-xl">
        <div class="flex flex-col">
          <div class="flex gap-4 items-center">
            <div class="w-[15px] h-[15px] bg-[#7CFC00] rounded-xs"></div>
            <h1>Light</h1>
          </div>
          <div class="flex gap-4 items-center">
            <div class="w-[15px] h-[15px] bg-[#FFD700] rounded-xs"></div>
            <h1>Moderate</h1>
          </div>
          <div class="flex gap-4 items-center">
            <div class="w-[15px] h-[15px] bg-[#FF6347] rounded-xs"></div>
            <h1>Heavy</h1>
          </div>
        </div>
      </div>

      <!-- Map Component - Notice the String() conversion below -->
      <MapComponent ref="mapComponent" :roads="processedRoads" :color-map="colorMap" :api-key="API_KEY"
        :active-road-id="activeRoad?.properties?.id?.toString()" v-if="dataReady" />

      <!-- Traffic Level Modal -->
      <TrafficLevelModal :active-road="activeRoad" :color-map="colorMap" @closeEditModal="closeEditModal"
        @changeTrafficLevel="changeTrafficLevel" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useDatabaseStore } from '../stores/databaseStore';
import Sidebar from '../components/TrafficTraficking/Sidebar.vue';
import MapComponent from '../components/TrafficTraficking/MapComponent.vue';
import TrafficLevelModal from '../components/TrafficTraficking/TrafficLevelModal.vue';

// Store and refs
const databaseStore = useDatabaseStore();
const mapComponent = ref(null);
const dataReady = ref(false);
const isLoading = ref(true);
const processedRoads = ref([]);
const activeRoad = ref(null);

// Constants
const API_KEY = "pk.eyJ1IjoiaW1hc2tpc3NpdCIsImEiOiJjbTlyc3pwOHUwNWlpMmpvaXhtMGV5bHgyIn0.RqXu--zmQc6YvT4-EEkAHg";
const colorMap = {
  green: "#7CFC00",
  yellow: "#FFD700",
  red: "#FF6347",
};
const statusMap = {
  1: 'green',
  2: 'yellow',
  3: 'red'
};
const colorToStatus = { green: 1, yellow: 2, red: 3 };

// Computed properties
const roads = computed(() =>
  databaseStore.roads.map(road => ({
    ...road,
    geometry: road.geometry || {},
    properties: {
      ...road.properties,
      name: road.road_name || road.properties?.name
    }
  }))
);

// Utility functions
const getColorFromStatusId = (statusId) => {
  return statusMap[statusId] || 'gray';
};

// Initialize data
onMounted(async () => {
  isLoading.value = true;
  try {
    await databaseStore.fetchData();

    // Process all roads at once
    const allRoads = databaseStore.roads.map(road => ({
      ...road,
      geometry: road.geometry || {},
      properties: {
        ...road.properties,
        name: road.road_name || road.properties?.name
      },
      inboundColor: getColorFromStatusId(road.inbound.status_id),
      outboundColor: getColorFromStatusId(road.outbound.status_id)
    }));

    processedRoads.value = allRoads;

    // Background updates
    const updatePromises = [];
    databaseStore.roads.forEach(road => {
      const inboundColor = getColorFromStatusId(road.inbound.status_id);
      const outboundColor = getColorFromStatusId(road.outbound.status_id);

      updatePromises.push(
        databaseStore.updateTrafficStatus(road.id, 'inbound', colorToStatus[inboundColor])
      );
      updatePromises.push(
        databaseStore.updateTrafficStatus(road.id, 'outbound', colorToStatus[outboundColor])
      );
    });

    Promise.all(updatePromises).catch(err => console.error("Background updates failed:", err));

  } catch (error) {
    console.error("Failed to load data:", error);
  } finally {
    isLoading.value = false;
    dataReady.value = true;
  }
});

// Modal handlers
const openEditModal = (road) => {
  activeRoad.value = {
    ...road,
    properties: {
      id: road.id,
      name: road.road_name || road.properties?.name
    },
    inboundColor: getColorFromStatusId(road.inbound.status_id),
    outboundColor: getColorFromStatusId(road.outbound.status_id)
  };
  
  // Focus the map on the selected road
  if (mapComponent.value) {
    mapComponent.value.focusOnRoad(road.id.toString());
  }
};

const closeEditModal = () => {
  activeRoad.value = null;
};

// Update traffic status
const changeTrafficLevel = async (roadId, direction, color) => {
  try {
    console.log(`Updating traffic level: Road ${roadId}, ${direction} to ${color}`);
    const statusId = colorToStatus[color];
    console.log(`Converted to status ID: ${statusId}`);

    const response = await databaseStore.updateTrafficStatus(roadId, direction, statusId);
    console.log("API response:", response);

    // Update the map line color directly
    if (mapComponent.value) {
      mapComponent.value.updateRoadColor(roadId, direction, color);
    }

    // Update the processedRoads data to keep it in sync with the visual change
    const roadIndex = processedRoads.value.findIndex(r => r.properties.id.toString() === roadId.toString());
    if (roadIndex !== -1) {
      processedRoads.value[roadIndex][`${direction}Color`] = color;
    }

    if (activeRoad.value?.properties.id === roadId) {
      const updatedRoad = databaseStore.getRoadById(roadId);
      activeRoad.value = {
        ...activeRoad.value,
        properties: {
          id: updatedRoad.id,
          name: updatedRoad.road_name || updatedRoad.properties?.name
        },
        inboundColor: direction === 'inbound' ? color : activeRoad.value.inboundColor,
        outboundColor: direction === 'outbound' ? color : activeRoad.value.outboundColor
      };
    }
  } catch (error) {
    console.error("Update failed:", error);
    alert("Failed to update traffic status: " + error.message);
  }
};
</script>