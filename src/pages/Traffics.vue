<template>
  <div v-for="(intersection, i) in intersections" :key="i" class="flex flex-row p-3 gap-2 h-[740px] bg-[#1b1a1a]"
    style="font-family: 'Montserrat', sans-serif;">
    <!-- Sidebar -->
    <div class="w-[20%] rounded-2xl p-1">
      <!-- Logo and Header -->
      <div class="flex flex-row w-full justify-center h-[80px]">
        <div class="w-[70px] h-full">
          <img src="/img/Logo.png" alt="Logo" class="h-full w-full" />
        </div>
        <div class="flex items-center justify-center w-[200px]">
          <h1 class="text-white text-center font-bold text-lg">Traffic Monitoring System</h1>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="w-full mt-7 mb-7 relative">
        <input placeholder="Search..."
          class="placeholder-gray-400 text-white bg-[#282828] w-full p-3 pr-10 rounded-2xl border border-[#494949]" />
      </div>

      <!-- Intersections -->
      <div class="text-white p-2 ">
        <div class="flex justify-between mb-3">
          <div class="mb-2 font-bold">{{ intersection.properties.name }}</div>
          <!-- FeEdit2 button that opens the modal -->
          <FeEdit2 class="mt-1 cursor-pointer" @click="openEditModal(i)" />
        </div>

        <div class="w-full">
          <div class="flex justify-between">
            <div class="flex gap-2 items-center">
              <h1>Inbound</h1>
              <!-- Inbound Color Block Dynamically Set Based on JSON -->
              <div :style="{ backgroundColor: colorMap[intersection.inboundColor] }"
                class="w-[15px] h-[15px] rounded-xs"></div>
            </div>
            <div class="flex gap-2 items-center">
              <h1>Outbound</h1>
              <!-- Outbound Color Block Dynamically Set Based on JSON -->
              <div :style="{ backgroundColor: colorMap[intersection.outboundColor] }"
                class="w-[15px] h-[15px] rounded-xs"></div>
            </div>
          </div>
          <hr class="bg-[#fff] opacity-30 mt-3">
        </div>
      </div>

    </div>

    <!-- Map -->
    <div class="w-[80%] relative">
      <!-- First div (unchanged) -->
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

      <!-- Modal (only shows when `activeIndex` is not null) -->
      <div v-if="activeIndex !== null"
        class="absolute text-white w-[500px] bg-[#1b1a1a] z-10 mt-[10px] left-1/2 transform -translate-x-1/2 p-4 rounded-xl">
        <div class="flex flex-col gap-4">
          <div class="relative">
            <!-- Intersection Name -->
            <div class="text-center">{{ intersections[activeIndex].properties.name }}</div>

            <!-- Close Button positioned at the top-right corner -->
            <CdChromeClose class="absolute top-1 right-2 text-white cursor-pointer" @click="closeEditModal" />
          </div>

          <div class="flex">
            <div class="w-1/2">
              <div class="flex gap-4 items-center">
                <h1>Inbound</h1>
                <!-- Color Block and Dropdown Trigger -->
                <div class="flex items-center cursor-pointer relative" @click="toggleDropdown('inbound', activeIndex)">
                  <div :style="{ backgroundColor: colorMap[intersections[activeIndex].inboundColor] }"
                    class="w-[20px] h-[20px] rounded-xs"></div>

                  <!-- Dropdown Menu -->
                  <div v-if="activeDropdown === 'inbound' && activeIndex === activeIndex"
                    class="absolute mt-2 bg-[#1b1a1a] p-2 rounded-lg top-full left-0 z-10">
                    <!-- Color Options -->
                    <div v-for="color in ['green', 'moderate', 'red']" :key="color"
                      class="p-2 cursor-pointer flex items-center gap-2" :style="{ backgroundColor: '#1b1a1a' }"
                      @click="changeTrafficLevel(activeIndex, 'inbound', color)">
                      <div class="w-[20px] h-[20px] rounded-xs" :style="{ backgroundColor: colorMap[color] }"></div>
                      <span class="text-white">{{ color.charAt(0).toUpperCase() + color.slice(1) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="w-1/2">
              <div class="flex gap-4 items-center">
                <h1>Outbound</h1>
                <!-- Color Block and Dropdown Trigger -->
                <div class="flex items-center cursor-pointer relative" @click="toggleDropdown('outbound', activeIndex)">
                  <div :style="{ backgroundColor: colorMap[intersections[activeIndex].outboundColor] }"
                    class="w-[20px] h-[20px] rounded-xs"></div>

                  <!-- Dropdown Menu -->
                  <div v-if="activeDropdown === 'outbound' && activeIndex === activeIndex"
                    class="absolute mt-2 bg-[#1b1a1a] p-2 rounded-lg top-full left-0 z-10">
                    <!-- Color Options -->
                    <div v-for="color in ['green', 'moderate', 'red']" :key="color"
                      class="p-2 cursor-pointer flex items-center gap-2" :style="{ backgroundColor: '#1b1a1a' }"
                      @click="changeTrafficLevel(activeIndex, 'outbound', color)">
                      <div class="w-[20px] h-[20px] rounded-xs" :style="{ backgroundColor: colorMap[color] }"></div>
                      <span class="text-white">{{ colorz.charAt(0).toUpperCase() + color.slice(1) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Map container -->
      <div id="map" class="w-full h-full rounded-xl" style="min-height: 300px; position: relative;" />
    </div>
  </div>
</template>

<script setup>
import { CdChromeClose } from '@kalimahapps/vue-icons';
import { FeEdit2 } from '@kalimahapps/vue-icons';
import { onMounted, ref } from "vue";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import routeData from "../data/coordinates.json";  // Ensure correct path for the JSON file

const intersections = ref(routeData.features);  // Set the routeData.features into intersections

const bgColorMap = {
  green: "#3b7e20", // Light traffic
  moderate: "#b29500", // Moderate traffic
  red: "#a23b3b", // Heavy traffic
};

const colorMap = {
  green: "#7CFC00", // Light
  yellow: "#FFD700", // Moderate
  red: "#FF6347", // Heavy
};

const activeDropdown = ref(null);
const activeIndex = ref(null);

const API_KEY = "pk.eyJ1IjoiaW1hc2tpc3NpdCIsImEiOiJjbTlyc3pwOHUwNWlpMmpvaXhtMGV5bHgyIn0.RqXu--zmQc6YvT4-EEkAHg";
let map;

onMounted(() => {
  // Initialize the map
  map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/dark-v11",
    center: [120.5948, 16.4133],
    zoom: 16,
    accessToken: API_KEY,
  });

  map.addControl(new mapboxgl.NavigationControl(), "top-right");

  map.on("load", () => {
    intersections.value.forEach((feature, index) => {
      const coordinates = feature.geometry.coordinates.inbound;
      const routeName = feature.properties.name;

      const inboundColor = colorMap[feature.inboundColor]; // Get the color for inbound from JSON
      const outboundColor = colorMap[feature.outboundColor]; // Get the color for outbound from JSON

      // Fit the map to the route's coordinates
      const bounds = new mapboxgl.LngLatBounds();
      coordinates.forEach(coord => bounds.extend(coord));
      map.fitBounds(bounds, { padding: 60 });

      // Draw the route lines on the map
      drawRoute(coordinates, routeName, inboundColor, index, "inbound");
      drawRoute(feature.geometry.coordinates.outbound, routeName, outboundColor, index, "outbound");
    });
  });
});

// Function to draw the route line on the map
// Function to draw the route line on the map
// Function to draw the route line on the map
function drawRoute(coords, routeName, lineColor, index, direction) {
  const routeGeoJson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: coords,
        },
        properties: {
          name: routeName,
          direction: direction,
        },
      },
    ],
  };

  const sourceId = `route-source-${index}-${direction}`;
  const layerId = `route-line-${index}-${direction}`;
  const labelLayerId = `${layerId}-label`;

  // Remove existing layers and sources before adding new ones
  if (map.getLayer(layerId)) {
    map.removeLayer(layerId);
  }
  if (map.getLayer(labelLayerId)) {
    map.removeLayer(labelLayerId);
  }

  // Remove the source after removing layers that depend on it
  if (map.getSource(sourceId)) {
    map.removeSource(sourceId);
  }

  // Add the source
  map.addSource(sourceId, {
    type: "geojson",
    data: routeGeoJson,
  });

  // Get the current zoom level and adjust line width based on it
  const zoom = map.getZoom();
  console.log("Current Zoom Level:", zoom); // Log the current zoom level

  // Set the line width based on zoom level
  const lineWidth = Math.max(zoom * 0.2, 1);  // Adjust scaling factor here (0.5 instead of 0.2)

  // Add the route line layer with dynamic line width based on zoom level
  map.addLayer({
    id: layerId,
    type: "line",
    source: sourceId,
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": lineColor,
      "line-width": lineWidth,  // Dynamically set the line width
    },
  });

  // Add a label to display the route name
  map.addLayer({
    id: labelLayerId,
    type: "symbol",
    source: sourceId,
    layout: {
      "symbol-placement": "line",
      "text-field": [
        "case", // Use a conditional expression
        ["==", ["get", "direction"], "inbound"], // If direction is inbound
        ">>>", // Inbound label
        ["==", ["get", "direction"], "outbound"], // If direction is outbound
        "<<<", // Outbound label
        "" // Default if neither inbound nor outbound
      ],
      "text-font": ["Open Sans Bold"],
      "text-size": 12,
      "text-rotation-alignment": "map",
      "text-keep-upright": true,
    },
    paint: {
      "text-color": "#FFFFFF",
      "text-halo-color": "#000000",
      "text-halo-width": 2,
    },
  });

}






// Watcher function for dynamically adjusting the color of the route line
function setTrafficLevel(index, direction, level) {
  if (direction === "inbound") {
    intersections.value[index].inboundColor = level;
  } else {
    intersections.value[index].outboundColor = level;
  }
  console.log("Current Zoom Level:", zoomLevel);  // Log the zoom level to the console

  const color = colorMap[level];
  updateLineColor(index, direction, color);
}

// Function to update the line color dynamically
function updateLineColor(index, direction, color) {
  const lineId = `route-line-${index}-${direction}`;

  if (map.getLayer(lineId)) {
    map.setPaintProperty(lineId, "line-color", color); // Update the line color
  }
}

// Toggle dropdown visibility and correct positioning
function toggleDropdown(direction, index) {
  console.log("toggleDropdown called", { direction, index });  // Debug log

  // Only toggle the dropdown, but don't change the activeIndex
  if (activeDropdown.value === direction && activeIndex.value === index) {
    activeDropdown.value = null;
  } else {
    activeDropdown.value = direction;
  }
}

// This method will be triggered when you select a color from the dropdown
function changeTrafficLevel(index, direction, level) {
  console.log("changeTrafficLevel called", { index, direction, level });  // Debug log

  // Update the traffic color based on the selected level
  if (direction === "inbound") {
    intersections.value[index].inboundColor = level;
  } else {
    intersections.value[index].outboundColor = level;
  }

  const color = colorMap[level];
  updateLineColor(index, direction, color);

  // **Do not close the modal here** — only close when the user clicks on the close icon
}

// This method is triggered when the FeEdit2 button is clicked
function openEditModal(index) {
  console.log("openEditModal called", { index });  // Debug log
  // Set the active index to the clicked intersection, making the modal visible
  activeIndex.value = index;
}

// Optionally, you can close the modal when clicked again or based on other logic
function closeEditModal() {
  console.log("closeEditModal called");  // Debug log
  activeIndex.value = null;  // This hides the modal by setting the active index to null
}
</script>
