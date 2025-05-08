<template>
  <div class="flex flex-col h-26 bg-[#1b1a1a]">
    <Navbar /> <!-- Navbar Component -->
  </div>
  <div class="flex flex-row p-3 gap-2  h-[calc(100vh-100px)] bg-[#1b1a1a]">
    <Sidebar :intersections="roads" :colorMap="colorMap" @openEditModal="openEditModal" />

    <!-- Map Component -->
    <div class="w-[77%] relative">
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

      <!-- Map Settings -->
      <div class="absolute text-white w-[150px] bg-[#1b1a1a] z-10 mt-[120px] ml-[10px] p-4 rounded-xl">
        <div class="text-sm font-bold mb-2">Map Style</div>
        <div class="relative">
          <!-- Dropdown Trigger -->
          <div @click="toggleStyleDropdown"
            class="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-gray-700">
            <div class="flex items-center">
              <span>{{Object.keys(mapStyles).find(key => mapStyles[key] === selectedMapStyle)}}</span>
            </div>
            <svg class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-180': showStyleDropdown }"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>

          <!-- Dropdown Menu -->
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
import Navbar from '../components/TrafficTraficking/Navbar.vue';
import MapComponent from '../components/TrafficTraficking/MapComponent.vue';
import TrafficLevelModal from '../components/TrafficTraficking/TrafficLevelModal.vue';

// Store and refs
const databaseStore = useDatabaseStore();
const mapComponent = ref(null);
const dataReady = ref(false);
const isLoading = ref(true);
const processedRoads = ref([]);
const activeRoad = ref(null);
const showStyleDropdown = ref(false);

// Configuration constants for traffic status mapping and colors
const API_KEY = "pk.eyJ1IjoiaW1hc2tpc3NpdCIsImEiOiJjbTlyc3pwOHUwNWlpMmpvaXhtMGV5bHgyIn0.RqXu--zmQc6YvT4-EEkAHg";
const colorMap = { green: "#7CFC00", yellow: "#FFD700", red: "#FF6347" };
const statusMap = { 1: 'green', 2: 'yellow', 3: 'red' };
const colorToStatus = { green: 1, yellow: 2, red: 3 };

// Map style options
const mapStyles = {
  Dark: "mapbox://styles/mapbox/dark-v11",
  Light: "mapbox://styles/mapbox/light-v11",
  Streets: "mapbox://styles/mapbox/streets-v12",
  Outdoors: "mapbox://styles/mapbox/outdoors-v12",
  Satellite: "mapbox://styles/mapbox/satellite-v9"
};


// Default to Dark style
const selectedMapStyle = ref(mapStyles.Dark);

// Function to change map style
const changeMapStyle = (style) => {
  selectedMapStyle.value = style;
};

const toggleStyleDropdown = () => {
  showStyleDropdown.value = !showStyleDropdown.value;
};

const selectMapStyle = (style) => {
  selectedMapStyle.value = style;
  showStyleDropdown.value = false;
};

// Transform road data for display and interaction
const roads = computed(() => databaseStore.roads.map(road => ({
  ...road,
  geometry: road.geometry || {},
  properties: {
    ...road.properties,
    name: road.road_name || road.properties?.name
  }
})));

// Helper to get color string from traffic status ID
const getColorFromStatusId = (statusId) => statusMap[statusId] || 'gray';

// Process a road object for internal use
const processRoad = (road) => ({
  ...road,
  geometry: road.geometry || {},
  properties: {
    ...road.properties,
    name: road.road_name || road.properties?.name
  },
  inboundColor: getColorFromStatusId(road.inbound.status_id),
  outboundColor: getColorFromStatusId(road.outbound.status_id)
});

// Initialize data and fetch from database
onMounted(async () => {
  isLoading.value = true;
  try {
    await databaseStore.fetchData();
    processedRoads.value = databaseStore.roads.map(processRoad);

    // Update traffic statuses in the background for consistency
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

  document.addEventListener('click', (e) => {
    // Check if click is outside the dropdown area
    const dropdown = document.querySelector('.map-style-dropdown');
    if (dropdown && !dropdown.contains(e.target)) {
      showStyleDropdown.value = false;
    }
  });
});

// Handle opening the edit modal and focusing the map on selected road
const openEditModal = (road) => {
  activeRoad.value = processRoad(road);
  mapComponent.value?.focusOnRoad(road.id.toString());
};

// Close the edit modal
const closeEditModal = () => {
  activeRoad.value = null;
};

// Update traffic status and synchronize UI
const changeTrafficLevel = async (roadId, direction, color) => {
  try {
    const statusId = colorToStatus[color];
    await databaseStore.updateTrafficStatus(roadId, direction, statusId);

    // Update map visualization
    mapComponent.value?.updateRoadColor(roadId, direction, color);

    // Update local state to reflect changes
    const roadIndex = processedRoads.value.findIndex(r => r.properties.id.toString() === roadId.toString());
    if (roadIndex !== -1) {
      processedRoads.value[roadIndex][`${direction}Color`] = color;
    }

    // Update active road if it's the one being modified
    if (activeRoad.value?.properties.id === roadId) {
      activeRoad.value = {
        ...activeRoad.value,
        [direction === 'inbound' ? 'inboundColor' : 'outboundColor']: color
      };
    }

    // IMPORTANT: Update the roads in databaseStore to ensure sidebar updates
    const originalRoadIndex = databaseStore.roads.findIndex(r => r.id.toString() === roadId.toString());
    if (originalRoadIndex !== -1) {
      // Create a new object to ensure reactivity
      databaseStore.roads[originalRoadIndex] = {
        ...databaseStore.roads[originalRoadIndex],
        [direction]: {
          ...databaseStore.roads[originalRoadIndex][direction],
          status_id: statusId
        }
      };
    }
  } catch (error) {
    console.error("Update failed:", error);
    alert("Failed to update traffic status: " + error.message);
  }
};
</script>