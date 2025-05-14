<template>
  <div class="flex flex-col h-20 bg-[#1b1a1a]">
    <Navbar />
  </div>
  <div class="flex flex-row p-3 gap-2 h-[649px] bg-[#1b1a1a]">
    <Sidebar :intersections="roads" :colorMap="colorMap" @openEditModal="openEditModal" />

    <div class="w-[77%] relative">
      <!-- Loading overlay -->
      <div v-if="isLoading" class="absolute inset-0 bg-black bg-opacity-60 z-20 flex items-center justify-center rounded-xl">
        <div class="inline-block h-14 w-14 animate-spin rounded-full border-4 border-solid border-white border-r-transparent"></div>
      </div>

      <!-- Map legend -->
      <div class="absolute text-white w-[150px] bg-[#1b1a1a] z-10 mt-[10px] ml-[1000px] p-4 rounded-xl">
        <div class="flex flex-col">
          <div v-for="(color, status) in legendItems" :key="status" class="flex gap-4 items-center">
            <div class="w-[15px] h-[15px] rounded-xs" :style="{backgroundColor: color.hex}"></div>
            <h1>{{ color.label }}</h1>
          </div>
        </div>
      </div>

      <!-- Map style selector -->
      <div class="absolute text-white w-[150px] bg-[#1b1a1a] z-10 mt-[120px] ml-[1000px] p-4 rounded-xl">
        <div class="text-sm font-bold mb-2">Map Style</div>
        <div class="relative map-style-dropdown">
          <div @click="toggleStyleDropdown" class="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-gray-700">
            <span>{{ currentStyleName }}</span>
            <svg class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-180': showStyleDropdown }"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>

          <div v-if="showStyleDropdown" class="absolute left-0 right-0 mt-1 bg-[#1b1a1a] rounded shadow-lg z-20 p-2">
            <div v-for="(url, name) in mapStyles" :key="name" @click="selectMapStyle(url)"
              class="flex items-center cursor-pointer hover:bg-gray-700 p-2 rounded">
              <span>{{ name }}</span>
            </div>
          </div>
        </div>
      </div>

      <MapComponent ref="mapComponent" :roads="processedRoads" :color-map="colorMap" :api-key="API_KEY"
        :map-style="selectedMapStyle" :active-road-id="activeRoad?.properties?.id?.toString()" v-if="dataReady" />

      <TrafficLevelModal :active-road="activeRoad" :color-map="colorMap" 
        @closeEditModal="closeEditModal" @changeTrafficLevel="changeTrafficLevel" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useDatabaseStore } from '../stores/databaseStore';
import Sidebar from '../components/TrafficTraficking/Sidebar.vue';
import Navbar from '../components/TrafficTraficking/Navbar.vue';
import MapComponent from '../components/TrafficTraficking/MapComponent.vue';
import TrafficLevelModal from '../components/TrafficTraficking/TrafficLevelModal.vue';

// Core state references
const databaseStore = useDatabaseStore();
const mapComponent = ref(null);
const dataReady = ref(false);
const isLoading = ref(true);
const processedRoads = ref([]);
const activeRoad = ref(null);
const showStyleDropdown = ref(false);

// Configuration constants
const API_KEY = "pk.eyJ1IjoiaW1hc2tpc3NpdCIsImEiOiJjbTlyc3pwOHUwNWlpMmpvaXhtMGV5bHgyIn0.RqXu--zmQc6YvT4-EEkAHg";
const colorMap = { green: "#7CFC00", yellow: "#FFD700", red: "#FF6347" };
const statusMap = { 1: 'green', 2: 'yellow', 3: 'red' };
const colorToStatus = { green: 1, yellow: 2, red: 3 };
const legendItems = {
  light: { hex: colorMap.green, label: "Light" },
  moderate: { hex: colorMap.yellow, label: "Moderate" },
  heavy: { hex: colorMap.red, label: "Heavy" }
};

// Map style options
const mapStyles = {
  Dark: "mapbox://styles/mapbox/dark-v11",
  Light: "mapbox://styles/mapbox/light-v11",
  Streets: "mapbox://styles/mapbox/streets-v12",
  Outdoors: "mapbox://styles/mapbox/outdoors-v12",
  Satellite: "mapbox://styles/mapbox/satellite-v9"
};
const selectedMapStyle = ref(mapStyles.Dark);
const currentStyleName = computed(() => 
  Object.keys(mapStyles).find(key => mapStyles[key] === selectedMapStyle.value) || 'Dark'
);

// Transform road data for consistent format
const roads = computed(() => databaseStore.roads.map(road => ({
  ...road,
  geometry: road.geometry || {},
  properties: {
    ...road.properties,
    name: road.road_name || road.properties?.name
  }
})));

// Map event handlers
const toggleStyleDropdown = () => showStyleDropdown.value = !showStyleDropdown.value;
const selectMapStyle = (style) => {
  selectedMapStyle.value = style;
  showStyleDropdown.value = false;
};

// Process road object with traffic status colors
const processRoad = (road) => ({
  ...road,
  geometry: road.geometry || {},
  properties: {
    ...road.properties,
    name: road.road_name || road.properties?.name
  },
  inboundColor: statusMap[road.inbound?.status_id] || 'green',
  outboundColor: statusMap[road.outbound?.status_id] || 'green'
});

// Modal handlers
const openEditModal = (road) => {
  activeRoad.value = processRoad(road);
  mapComponent.value?.focusOnRoad(road.id.toString());
};
const closeEditModal = () => activeRoad.value = null;

// Update traffic status and sync UI
const changeTrafficLevel = async (roadId, direction, color) => {
  try {
    const statusId = colorToStatus[color];
    await databaseStore.updateTrafficStatus(roadId, direction, statusId);
    mapComponent.value?.updateRoadColor(roadId, direction, color);
    
    // Update local state
    const roadIndex = processedRoads.value.findIndex(r => r.properties.id.toString() === roadId.toString());
    if (roadIndex !== -1) {
      processedRoads.value[roadIndex][`${direction}Color`] = color;
    }
    
    // Update active road if being modified
    if (activeRoad.value?.properties.id === roadId) {
      activeRoad.value = {
        ...activeRoad.value,
        [`${direction}Color`]: color
      };
    }
    
    // Update store to ensure sidebar updates
    const storeRoadIndex = databaseStore.roads.findIndex(r => r.id.toString() === roadId.toString());
    if (storeRoadIndex !== -1) {
      databaseStore.roads[storeRoadIndex] = {
        ...databaseStore.roads[storeRoadIndex],
        [direction]: {
          ...databaseStore.roads[storeRoadIndex][direction],
          status_id: statusId
        }
      };
    }
  } catch (error) {
    console.error("Update failed:", error);
    alert("Failed to update traffic status: " + error.message);
  }
};

// Initialize data
onMounted(async () => {
  isLoading.value = true;
  try {
    await databaseStore.fetchData();
    processedRoads.value = databaseStore.roads.map(processRoad);
    
    // Background sync of traffic statuses
    Promise.all(databaseStore.roads.flatMap(road => [
      databaseStore.updateTrafficStatus(road.id, 'inbound', road.inbound.status_id),
      databaseStore.updateTrafficStatus(road.id, 'outbound', road.outbound.status_id)
    ])).catch(err => console.error("Background updates failed:", err));
  } catch (error) {
    console.error("Failed to load data:", error);
  } finally {
    isLoading.value = false;
    dataReady.value = true;
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const dropdown = document.querySelector('.map-style-dropdown');
    if (dropdown && !dropdown.contains(e.target)) {
      showStyleDropdown.value = false;
    }
  });
});
</script>