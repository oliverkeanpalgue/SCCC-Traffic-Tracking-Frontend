<template>
  <div class="flex flex-row p-3 gap-2 h-[729px] bg-[#1b1a1a]" style="font-family: 'Montserrat', sans-serif;">
    <Sidebar :intersections="intersections" :colorMap="colorMap" @openEditModal="openEditModal" />
    <MapComponent ref="mapComponent" :intersections="intersections" :colorMap="colorMap" :API_KEY="API_KEY" />
    <TrafficLevelModal 
      :intersections="intersections" 
      :activeIndex="activeIndex" 
      :colorMap="colorMap" 
      @closeEditModal="closeEditModal" 
      @changeTrafficLevel="changeTrafficLevel" 
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import Sidebar from '../components/TrafficTraficking/Sidebar.vue';
import MapComponent from '../components/TrafficTraficking/MapComponent.vue';
import TrafficLevelModal from '../components/TrafficTraficking/TrafficLevelModal.vue';
import routeData from "../data/coordinates.json";

const intersections = ref(routeData.features);
const colorMap = {
  green: "#7CFC00",
  yellow: "#FFD700",
  red: "#FF6347",
};
const activeIndex = ref(null);
const API_KEY = "pk.eyJ1IjoiaW1hc2tpc3NpdCIsImEiOiJjbTlyc3pwOHUwNWlpMmpvaXhtMGV5bHgyIn0.RqXu--zmQc6YvT4-EEkAHg";

// Load saved intersections from localStorage
onMounted(() => {
  const savedIntersections = localStorage.getItem('intersections');
  if (savedIntersections) {
    intersections.value = JSON.parse(savedIntersections);  // Load updated data from localStorage
    console.log("Loaded intersections from localStorage:", intersections.value); // Log loaded data
  } else {
    intersections.value = [...routeData.features];  // Fallback to initial data if no saved intersections
    console.log("No saved intersections, using default data:", intersections.value); // Log default data
  }
});

// Watch for intersection changes and save them to localStorage
watch(() => intersections.value, (newIntersections) => {
  const plainIntersections = JSON.parse(JSON.stringify(newIntersections));  // Dereference the Proxy to get plain object
  console.log("Intersections changed, updating localStorage:", plainIntersections); // Log change in intersections
  localStorage.setItem('intersections', JSON.stringify(plainIntersections));  // Save immediately
}, { immediate: true });

// Open the modal for editing the intersection
const openEditModal = (id) => {
  const intersection = intersections.value.find(i => i.properties.id === id);
  if (intersection) activeIndex.value = intersection;
  console.log("Opened modal for intersection:", activeIndex.value); // Log when modal is opened
};

// Close the modal
const closeEditModal = () => {
  activeIndex.value = null;
  console.log("Modal closed, activeIndex reset to null."); // Log when modal is closed
};

// Change the traffic level color and save the updated state to localStorage
const changeTrafficLevel = (id, direction, level) => {
  console.log(`Changing ${direction} color for intersection ${id} to ${level}`); // Log the color change
  const updatedIntersections = intersections.value.map(intersection => {
    if (intersection.properties.id === id) {
      intersection[`${direction}Color`] = level;  // Update the respective color (inbound or outbound)
    }
    return intersection;
  });

  intersections.value = updatedIntersections;  // Apply the updated intersections array
  activeIndex.value = updatedIntersections.find(i => i.properties.id === id);  // Update activeIndex to reflect changes
  console.log("Updated intersections after color change:", updatedIntersections); // Log updated intersections

  // Saving to localStorage
  const plainUpdatedIntersections = JSON.parse(JSON.stringify(updatedIntersections));  // Dereference the Proxy to get plain object
  localStorage.setItem('intersections', JSON.stringify(plainUpdatedIntersections));  // Save immediately
  console.log("Saved updated intersections to localStorage:", plainUpdatedIntersections); // Log what's saved to localStorage
};
</script>





