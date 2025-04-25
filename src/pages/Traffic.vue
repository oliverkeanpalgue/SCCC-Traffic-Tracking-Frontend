<template>
  <div class="flex flex-row p-3 gap-2 h-[740px] bg-[#1b1a1a]" style="font-family: 'Montserrat', sans-serif;">
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
          class="placeholder-gray-400 text-white bg-[#282828] w-full p-3 pr-10 rounded-2xl border border-[#494949]"
          style="font-family: 'Montserrat', sans-serif; font-weight: 100; font-size: 15px;" />
        <MagnifyingGlassIcon class="h-5 w-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
      </div>

      <!-- Intersections -->
      <div class="mx-4 flex flex-col gap-6">
        <div v-for="(intersection, i) in intersections" :key="i">
          <div>
            <h2 class="font-bold text-start text-md mb-2 text-white" style="font-family: 'Montserrat', sans-serif;">
              {{ intersection.name.trim() }}
            </h2>
          </div>

          <!-- Inbound -->
          <div class="text-center mb-2 flex flex-row w-full">
            <div class="w-1/2 flex justify-center">
              <p class="mb-1 text-sm font-medium text-gray-300 content-center" style="font-family: 'Montserrat', sans-serif;">
                Inbound
              </p>
            </div>
            <div class="w-1/2">
              <select v-model="inboundColors[i]" @change="setTrafficLevel(i, 'inbound', inboundColors[i])"
                :style="{ backgroundColor: bgColorMap[inboundColors[i]], fontFamily: 'Montserrat, sans-serif' }"
                class="w-full p-2 rounded-lg text-white text-sm">
                <option value="green">Light</option>
                <option value="yellow">Moderate</option>
                <option value="red">Heavy</option>
              </select>
            </div>
          </div>

          <!-- Outbound -->
          <div class="text-center">
            <div class="flex flex-row w-full">
              <div class="w-1/2 flex justify-center">
                <p class="mb-1 text-sm font-medium text-gray-300 content-center" style="font-family: 'Montserrat', sans-serif;">
                  Outbound
                </p>
              </div>
              <div class="w-1/2">
                <select v-model="outboundColors[i]" @change="setTrafficLevel(i, 'outbound', outboundColors[i])"
                  :style="{ backgroundColor: bgColorMap[outboundColors[i]], fontFamily: 'Montserrat, sans-serif' }"
                  class="w-full p-2 rounded-lg text-white text-sm">
                  <option value="green">Light</option>
                  <option value="yellow">Moderate</option>
                  <option value="red">Heavy</option>
                </select>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Map -->
    <div class="w-[80%]">
      <div id="map" class="w-full h-full rounded-xl" />
    </div>
  </div>
</template>


<script setup>
import { onMounted, ref } from "vue";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import intersections from "../data/coordinates.json";
import { MagnifyingGlassIcon } from "@heroicons/vue/24/solid";

const inboundColors = ref([]);
const outboundColors = ref([]);
let map;
const bgColorMap = {
  green: "#3b7e20",   // darker green
  yellow: "#b29500",  // muted yellow
  red: "#a23b3b",     // deep red
};
const colorMap = {
  green: "#7CFC00",   // light green
  yellow: "#FFD700",  // soft golden yellow
  red: "#FF6347",     // soft red (tomato)
};

onMounted(() => {
  inboundColors.value = intersections.map(() => "green");
  outboundColors.value = intersections.map(() => "green");

  map = new maplibregl.Map({
    container: "map",
    style: "https://api.maptiler.com/maps/dataviz-dark/style.json?key=XC9Lfduc1EhOtbZ45kzl",
    center: [120.59570512741732, 16.413332058081494],
    zoom: 18,
  });

  map.addControl(new maplibregl.NavigationControl(), "top-right");

  map.on("load", () => {
    intersections.forEach((intersection, index) => {
      ["inbound", "outbound"].forEach((dir) => {
        const layerId = `line-${index}-${dir}`;
        const glowId = `${layerId}-glow`;
        const labelId = `${layerId}-label`;
        const sourceId = `source-${index}-${dir}`;
        const coords = intersection[dir];
        const trafficLevel = dir === "inbound" ? inboundColors.value[index] : outboundColors.value[index];
        const color = colorMap[trafficLevel];

        map.addSource(sourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: coords,
            },
          },
        });

        // Glowing outer line
        map.addLayer({
          id: glowId,
          type: "line",
          source: sourceId,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": color,
            "line-width": [
              "interpolate", ["linear"], ["zoom"],
              12, 6,
              14, 12,
              16, 16,
              18, 28
            ],
            "line-blur": 7,
            "line-opacity": 0.3
          }
        });

        // Bright center line
        map.addLayer({
          id: layerId,
          type: "line",
          source: sourceId,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": color,
            "line-width": [
              "interpolate", ["linear"], ["zoom"],
              12, 2,
              14, 4,
              16, 6,
              18, 8
            ]
          }
        });

        // Direction label with arrows
        map.addLayer({
          id: labelId,
          type: "symbol",
          source: sourceId,
          layout: {
            "symbol-placement": "line",
            "text-field": dir === "inbound" ? "<<<" : ">>>",
            "text-font": ["Open Sans Bold"],
            "text-size": 14,
            "text-rotation-alignment": "map",
            "text-keep-upright": true,
          },
          paint: {
            "text-color": "#000",
            "text-halo-color": color,
            "text-halo-width": 1,
          }
        });
      });
    });
  });
});

function setTrafficLevel(index, direction, level) {
  if (direction === "inbound") {
    inboundColors.value[index] = level;
  } else {
    outboundColors.value[index] = level;
  }

  const color = colorMap[level];
  updateLineColor(index, direction, color);
}

function updateLineColor(index, dir, color) {
  const lineId = `line-${index}-${dir}`;
  const glowId = `${lineId}-glow`;
  const labelId = `${lineId}-label`;

  if (map.getLayer(lineId)) {
    map.setPaintProperty(lineId, "line-color", color);
  }
  if (map.getLayer(glowId)) {
    map.setPaintProperty(glowId, "line-color", color);
  }
  if (map.getLayer(labelId)) {
    map.setPaintProperty(labelId, "text-halo-color", color);
  }
}
</script>
