<template>
  <div class="flex flex-col h-20 bg-[#1b1a1a]">
    <Navbar :isLoggedIn="isLoggedIn" :user="currentUser" />
  </div>
  <div class="flex flex-row p-3 gap-2 h-[calc(100vh-80px)] bg-[#1b1a1a]">
    <Sidebar ref="sideBar" :isLoggedIn="isLoggedIn" :intersections="normalizedRoads" :colorMap="COLOR_MAP" @openEditModal="openEditModal" />

    <div class="w-[77%] relative">
      <!-- Loading overlay -->
      <div v-if="isLoading"
        class="absolute inset-0 bg-black bg-opacity-60 z-20 flex items-center justify-center rounded-xl">
        <div
          class="inline-block h-14 w-14 animate-spin rounded-full border-4 border-solid border-white border-r-transparent">
        </div>
      </div>

      <!-- Right-side controls: legend, add button, map style -->
      <div class="absolute right-4 z-10 flex flex-col items-end space-y-4 top-[10px] w-[150px]">
        <!-- Map legend -->
        <div class="text-white bg-[#1b1a1a] p-4 rounded-xl w-full">
          <div class="flex flex-col">
            <div v-for="(color, status) in LEGEND_ITEMS" :key="status" class="flex gap-4 items-center">
              <div class="w-[15px] h-[15px] rounded-xs" :style="{ backgroundColor: color.hex }"></div>
              <h1>{{ color.label }}</h1>
            </div>
          </div>
        </div>

        <!-- Add Road button -->
        <div v-if="isLoggedIn"
          class="text-white bg-[#1b1a1a] hover:bg-green-700 p-1 rounded-xl w-full">
          <button @click="openAddRoadModal" class="w-full flex cursor-pointer items-center justify-between p-2 rounded">
            <span class="font-medium">Add Road</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <!-- Map style selector -->
        <div class="text-white bg-[#1b1a1a] p-4 rounded-xl w-full">
          <div class="text-sm font-bold mb-2">Map Style</div>
          <div class="relative map-style-dropdown">
            <div @click="toggleStyleDropdown"
              class="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-gray-700">
              <span>{{ currentStyleName }}</span>
              <svg class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-180': showStyleDropdown }"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            <div v-if="showStyleDropdown" class="absolute left-0 right-0 mt-1 bg-[#1b1a1a] rounded shadow-lg z-30 p-2">
              <div v-for="(url, name) in MAP_STYLES" :key="name" @click="selectMapStyle(url)"
                class="flex items-center cursor-pointer hover:bg-gray-700 p-2 rounded">
                <span>{{ name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MapComponent 
        ref="mapComponent" 
        :roads="processedRoads" 
        :color-map="COLOR_MAP" 
        :api-key="MAPBOX_API_KEY"
        :map-style="selectedMapStyle" 
        :active-road-id="activeRoad?.properties?.id?.toString()" 
        v-if="dataReady"
        @update="handleRoadUpdate"
        @closeTrafficModal="closeEditModal"
        :isLoggedIn="isLoggedIn" 
      />

      <TrafficLevelModal :active-road="activeRoad" :color-map="COLOR_MAP" @closeEditModal="closeEditModal"
        @changeTrafficLevel="changeTrafficLevel" :isLoggedIn="isLoggedIn" />

      <!-- Add Road Modal Component -->
      <AddRoadModal :show="showAddRoadModal" @close="closeAddRoadModal" @roadAdded="handleRoadAdded" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import { useDatabaseStore } from '../stores/databaseStore';
import Sidebar from '../components/TrafficTraficking/Sidebar.vue';
import Navbar from '../components/TrafficTraficking/Navbar.vue';
import MapComponent from '../components/TrafficTraficking/MapComponent.vue';
import TrafficLevelModal from '../components/TrafficTraficking/TrafficLevelModal.vue';
import AddRoadModal from '../components/TrafficTraficking/AddRoadModal.vue';
import useUserStore from '../stores/user';

//check if user is logged in
const userStore = useUserStore();
const isLoggedIn = computed(() => userStore.isLoggedIn);
const currentUser = computed(() => userStore.user);
// Configuration constants
const MAPBOX_API_KEY = "pk.eyJ1IjoiaW1hc2tpc3NpdCIsImEiOiJjbTlyc3pwOHUwNWlpMmpvaXhtMGV5bHgyIn0.RqXu--zmQc6YvT4-EEkAHg";
const COLOR_MAP = { green: "#7CFC00", yellow: "#FFD700", red: "#FF6347" };
const STATUS_MAP = { 1: 'green', 2: 'yellow', 3: 'red' };
const COLOR_TO_STATUS = { green: 1, yellow: 2, red: 3 };
const LEGEND_ITEMS = {
  light: { hex: COLOR_MAP.green, label: "Light" },
  moderate: { hex: COLOR_MAP.yellow, label: "Moderate" },
  heavy: { hex: COLOR_MAP.red, label: "Heavy" }
};
const showAddRoadModal = ref(false);


// Map style options
const MAP_STYLES = {
  Dark: "mapbox://styles/mapbox/dark-v11",
  Light: "mapbox://styles/mapbox/light-v11",
  Streets: "mapbox://styles/mapbox/streets-v12",
  Outdoors: "mapbox://styles/mapbox/outdoors-v12",
  Satellite: "mapbox://styles/mapbox/satellite-v9"
};

// Core state references
const databaseStore = useDatabaseStore();
const mapComponent = ref(null);
const dataReady = ref(false);
const processedRoads = ref([]);
const activeRoad = ref(null);
const showStyleDropdown = ref(false);
const selectedMapStyle = ref(MAP_STYLES.Dark);
const lastLocalUpdate = ref(null);

const isLoading = computed(() => {
  return (
    databaseStore.roads.length === 0
  )
});

// Computed properties
const currentStyleName = computed(() =>
  Object.keys(MAP_STYLES).find(key => MAP_STYLES[key] === selectedMapStyle.value) || 'Dark'
);

// Convert database roads to consistent format for components
const normalizedRoads = computed(() => databaseStore.roads.map(road => ({
  ...road,
  geometry: road.geometry || {},
  properties: {
    ...road.properties,
    name: road.road_name || road.properties?.name
  }
})));

// Process road object with traffic status colors
const processRoad = (road) => {
  const normalizedRoadName = road.road_name || road.properties?.name || "";
  const roadTypeId = road.road_type_id || road.properties?.road_type_id;
  const roadTypeName =
    road.road_type_name ||
    road.properties?.roadType ||
    databaseStore.getRoadTypeName(roadTypeId) ||
    "Unknown";

  return {
    ...road,
    road_name: normalizedRoadName,
    road_type_id: roadTypeId,
    road_type_name: roadTypeName,
    geometry: road.geometry || {},
    properties: {
      ...road.properties,
      name: normalizedRoadName,
      roadName: normalizedRoadName,
      roadType: roadTypeName,
      road_type_id: roadTypeId
    },
    inboundColor: STATUS_MAP[road.inbound?.status_id] || 'green',
    outboundColor: STATUS_MAP[road.outbound?.status_id] || 'green'
  };
};

// Map event handlers
const toggleStyleDropdown = () => showStyleDropdown.value = !showStyleDropdown.value;

const selectMapStyle = (style) => {
  selectedMapStyle.value = style;
  showStyleDropdown.value = false;
};

// Modal handlers
const openEditModal = (road) => {
  activeRoad.value = processRoad(road);
  mapComponent.value?.focusOnRoad(road.id.toString());
};

const closeEditModal = () => activeRoad.value = null;

// Add Road Modal handlers
const openAddRoadModal = () => {
  showAddRoadModal.value = true;
};

const closeAddRoadModal = () => {
  showAddRoadModal.value = false;
};

const handleRoadAdded = async (newRoad) => {
  if (!newRoad) return;

  // Show success message immediately
  alert("Road added successfully!");

  // Mark as loading
  isLoading.value = true;

  try {
    // Close the modal first to prevent component unmounting issues
    showAddRoadModal.value = false;

    // Wait a moment before refreshing data
    await new Promise(resolve => setTimeout(resolve, 300));

    // Fetch fresh data with cache busting
    await databaseStore.fetchData(`?_=${Date.now()}`);

    // Set data ready flag if not already set
    if (!dataReady.value) {
      dataReady.value = true;
    }

    // Process the fresh data
    processedRoads.value = databaseStore.roads.map(road => processRoad(road));

    // Update UI after data is processed
    await nextTick();

    // Check if map component is available before updating
    if (mapComponent.value) {
      try {
        mapComponent.value.updateMapData(processedRoads.value);
      } catch (mapError) {
        console.warn("Map update failed, will reload page instead:", mapError);
        window.location.reload();
      }
    }
  } catch (error) {
    console.error("Failed to refresh data after adding road:", error);

  } finally {
    isLoading.value = false;
  }
};

// Handle road updates from map component
const handleRoadUpdate = async (updatedRoad) => {
  // Close popups if requested
  if (updatedRoad.__closeAllPopups && mapComponent.value) {
    mapComponent.value.closeAllPopups();
  } else if (mapComponent.value) {
    mapComponent.value.refreshCurrentPopup();
  }

  // Close edit modal if open
  if (activeRoad.value) {
    closeEditModal();
  }

  // Refresh data
  isLoading.value = true;

  try {
    // Fetch fresh data with cache busting
    const timestamp = Date.now();
    await databaseStore.fetchData(`?_=${timestamp}`);

    // Process the fresh data
    processedRoads.value = databaseStore.roads.map(road => processRoad(road));

    // Update UI after data is processed
    await nextTick();

    // Refresh the map data
    if (mapComponent.value) {
      await mapComponent.value.updateMapData(processedRoads.value);

      if (updatedRoad.roadId) {
        mapComponent.value.focusOnRoad(updatedRoad.roadId.toString());
      }
    }
  } catch (error) {
    console.error("Failed to refresh data:", error);
  } finally {
    isLoading.value = false;
  }
};

// Update traffic status for a road
const changeTrafficLevel = async (roadId, direction, color, options = {}) => {
  try {
    const statusId = COLOR_TO_STATUS[color];
    
    const updateTimestamp = Date.now();
    lastLocalUpdate.value = {
      roadId: roadId.toString(),
      direction,
      timestamp: updateTimestamp
    };
    
    // Update store first
    const storeRoadIndex = databaseStore.roads.findIndex(r => r.id.toString() === roadId.toString());
    if (storeRoadIndex !== -1) {
      databaseStore.roads[storeRoadIndex] = {
        ...databaseStore.roads[storeRoadIndex],
        [direction]: {
          ...databaseStore.roads[storeRoadIndex][direction],
          status_id: statusId
        },
        [`${direction}Color`]: color
      };
    }

    // Update processed roads for sidebar
    const roadIndex = processedRoads.value.findIndex(r => r.properties.id.toString() === roadId.toString());
    if (roadIndex !== -1) {
      processedRoads.value[roadIndex] = {
        ...processedRoads.value[roadIndex],
        [direction]: {
          ...processedRoads.value[roadIndex][direction],
          status_id: statusId
        },
        [`${direction}Color`]: color
      };
    }

    // Update active road if being modified
    if (activeRoad.value?.properties?.id === roadId) {
      activeRoad.value = {
        ...activeRoad.value,
        [`${direction}Color`]: color,
        [direction]: {
          ...activeRoad.value[direction],
          status_id: statusId
        }
      };
    }

    // Update map color synchronously
    if (mapComponent.value) {
      mapComponent.value.updateRoadColor(roadId, direction, color);
    }

    // Make API call
    await databaseStore.updateTrafficStatus(roadId, direction, statusId);
  } catch (error) {
    console.error("Update failed:", error);
    // Revert changes on error
    const originalStatus = databaseStore.roads.find(r => r.id.toString() === roadId.toString())?.[direction]?.status_id;
    if (originalStatus) {
      const originalColor = STATUS_MAP[originalStatus];
      // Update map color back
      mapComponent.value?.updateRoadColor(roadId, direction, originalColor);
      
      // Revert store
      const storeRoadIndex = databaseStore.roads.findIndex(r => r.id.toString() === roadId.toString());
      if (storeRoadIndex !== -1) {
        databaseStore.roads[storeRoadIndex] = {
          ...databaseStore.roads[storeRoadIndex],
          [direction]: {
            ...databaseStore.roads[storeRoadIndex][direction],
            status_id: originalStatus
          },
          [`${direction}Color`]: originalColor
        };
      }
    }
    alert("Failed to update traffic status");
  }
};

// Update all local state references after a status change
const updateLocalState = (roadId, direction, color, statusId) => {
  // Update processed roads list
  const roadIndex = processedRoads.value.findIndex(r => r.properties.id.toString() === roadId.toString());
  if (roadIndex !== -1) {
    processedRoads.value[roadIndex] = {
      ...processedRoads.value[roadIndex],
      [`${direction}Color`]: color,
      [direction]: {
        ...processedRoads.value[roadIndex][direction],
        status_id: statusId
      }
    };
    // Create new array reference to trigger reactivity
    processedRoads.value = [...processedRoads.value];
  }

  // Update active road if being modified
  if (activeRoad.value?.properties.id === roadId) {
    activeRoad.value = {
      ...activeRoad.value,
      [`${direction}Color`]: color,
      [direction]: {
        ...activeRoad.value[direction],
        status_id: statusId
      }
    };
  }

  // Update store
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
};

// Initialize data on component mount
onMounted(async () => {
  isLoading.value = true;

  console.log(isLoggedIn.value ? "User is logged in" : "User is not logged in");
  try {
    // Load initial data
    await databaseStore.fetchData();
    processedRoads.value = databaseStore.roads.map(processRoad);

    window.Echo.channel('traffic-update').listen('.direction.status.updated', (event) => {
      if (!event) return;

      // Check if this is a response to our own recent update
      const isLocalUpdate = lastLocalUpdate.value && 
        lastLocalUpdate.value.roadId === event.road_id.toString() &&
        lastLocalUpdate.value.direction === event.direction &&
        Date.now() - lastLocalUpdate.value.timestamp < 5000; // 5 second window

      // Skip the update if it's our own change
      if (isLocalUpdate) {
        return;
      }

      const color = event.status_id === 1 ? 'green' : 
                    event.status_id === 2 ? 'yellow' : 
                    event.status_id === 3 ? 'red' : '';
      
      if (!color) return;
    
      // Update map immediately
      mapComponent.value?.updateRoadColor(event.road_id, event.direction, color);
      
      // Update local state without triggering rerenders
      const roadIndex = databaseStore.roads.findIndex(r => 
        r.id.toString() === event.road_id.toString()
      );
    
      if (roadIndex !== -1) {
        // Update store data
        databaseStore.roads[roadIndex] = {
          ...databaseStore.roads[roadIndex],
          [event.direction]: {
            ...databaseStore.roads[roadIndex][event.direction],
            status_id: event.status_id
          }
        };
    
        // Update processed roads
        const processedRoad = processRoad(databaseStore.roads[roadIndex]);
        processedRoads.value[roadIndex] = processedRoad;
    
        // Update active road if needed
        if (activeRoad.value?.properties?.id.toString() === event.road_id.toString()) {
          activeRoad.value = {
            ...activeRoad.value,
            [`${event.direction}Color`]: color
          };
        }
      }
    });

    window.Echo.channel('update-road')
      .listen('.road.updated', async (event) => {
        if (event) {
          await databaseStore.fetchData();
          processedRoads.value = databaseStore.roads.map(processRoad);
          await mapComponent.value?.reloadMapData(processedRoads.value);
        }

        closeEditModal();
      });

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