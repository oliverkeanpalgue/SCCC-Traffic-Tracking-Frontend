<template>
  <div class="flex flex-row p-3 gap-2 h-[735px] bg-[#1b1a1a]" style="font-family: 'Montserrat', sans-serif;">
    <Sidebar :intersections="roads" :colorMap="colorMap" @openEditModal="openEditModal" />

    <!-- Map Component -->
    <div class="w-[80%] relative">
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

      <!-- Map Component -->
      <MapComponent ref="mapComponent" :roads="roads" :color-map="colorMap" :api-key="API_KEY"
        :active-road-id="activeRoad?.properties?.id" />

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

const databaseStore = useDatabaseStore();
const mapComponent = ref(null);
const colorMap = {
  green: "#7CFC00",
  yellow: "#FFD700",
  red: "#FF6347",
};
const activeRoad = ref(null);
const API_KEY = "pk.eyJ1IjoiaW1hc2tpc3NpdCIsImEiOiJjbTlyc3pwOHUwNWlpMmpvaXhtMGV5bHgyIn0.RqXu--zmQc6YvT4-EEkAHg";


// Enhanced roads computed property
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
const statusMap = {
  1: 'green',
  2: 'yellow',
  3: 'red'
};

const getColorFromStatusId = (statusId) => {
  return statusMap[statusId] || 'gray'; // default to gray if unknown
};
onMounted(async () => {
  try {
    await databaseStore.fetchData();
    if (mapComponent.value) {
      mapComponent.value.updateMapData(roads.value);
    }
  } catch (error) {
    console.error("Failed to load data:", error);
  } finally {
    // Convert status IDs to colors using the databaseStore's mapping
    databaseStore.roads.forEach(road => {
      const inboundColor = databaseStore.getColorFromStatusId(road.inbound.status_id);
      const outboundColor = databaseStore.getColorFromStatusId(road.outbound.status_id);
      
      // Update both directions with their actual colors
      changeTrafficLevel(road.id, 'inbound', inboundColor);
      changeTrafficLevel(road.id, 'outbound', outboundColor);
    });
  }
});

const openEditModal = (road) => {
  activeRoad.value = {
    ...road,
    properties: {
      id: road.id,
      name: road.road_name || road.properties?.name
    },
    inboundColor: databaseStore.getColorFromStatusId(road.inbound.status_id),
    outboundColor: databaseStore.getColorFromStatusId(road.outbound.status_id)
  };
};

const changeTrafficLevel = async (roadId, direction, color) => {
  try {
    const colorToStatus = {
      green: 1,
      yellow: 2,
      red: 3
    };
    const statusId = colorToStatus[color];
    
    await databaseStore.updateTrafficStatus(roadId, direction, statusId);
    
    // Update active road if it's the one being edited
    if (activeRoad.value?.properties.id === roadId) {
      const updatedRoad = databaseStore.getRoadById(roadId);
      activeRoad.value = {
        properties: {
          id: updatedRoad.id,
          name: updatedRoad.road_name
        },
        inboundColor: getColorFromStatusId(updatedRoad.inbound.status_id),
        outboundColor: getColorFromStatusId(updatedRoad.outbound.status_id)
      };
    }
  } catch (error) {
    console.error("Update failed:", error);
  }
};
</script>