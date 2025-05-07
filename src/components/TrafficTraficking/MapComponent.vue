<!-- TrafficMap.vue -->
<template>
  <div id="map" class="w-full h-full rounded-xl relative" style="min-height: 300px; position: relative;"></div>
</template>

<script setup>
import { defineProps, onMounted, watch, ref } from "vue";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const props = defineProps({
  roads: Array,
  colorMap: Object,
  apiKey: String,
  activeRoadId: String
});

const map = ref(null);
const loaded = ref(false);

const initMap = () => {
  map.value = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/dark-v11",
    center: [120.5948, 16.4133],
    zoom: 16,
    accessToken: props.apiKey,
  });

  map.value.addControl(new mapboxgl.NavigationControl(), "top-right");
  
  map.value.on("load", () => {
    loaded.value = true;
    updateMapData(props.roads);
  });
};

const drawRoute = (road, index) => {
  // Cleanup existing layers
  ['inbound', 'outbound'].forEach(direction => {
    const layerId = `route-${index}-${direction}`;
    if (map.value.getLayer(layerId)) map.value.removeLayer(layerId);
    if (map.value.getSource(layerId)) map.value.removeSource(layerId);
  });

  // Draw new routes
  if (road.geometry?.coordinates) {
    ['inbound', 'outbound'].forEach(direction => {
      const coords = road.geometry.coordinates[direction];
      const color = props.colorMap[road[direction + 'Color']];
      
      map.value.addSource(`route-${index}-${direction}`, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: coords
          }
        }
      });

      map.value.addLayer({
        id: `route-${index}-${direction}`,
        type: 'line',
        source: `route-${index}-${direction}`,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': color,
          'line-width': 4,
          'line-opacity': 0.7
        }
      });
    });
  }
};

const updateMapBounds = () => {
  const bounds = new mapboxgl.LngLatBounds();
  props.roads.forEach(road => {
    ['inbound', 'outbound'].forEach(direction => {
      road.geometry?.coordinates?.[direction]?.forEach(coord => bounds.extend(coord));
    });
  });
  if (!bounds.isEmpty()) map.value.fitBounds(bounds, { padding: 60 });
};

const updateMapData = (roads) => {
  if (!loaded.value) return;
  
  // Clear existing layers
  const existingLayers = map.value.getStyle().layers || [];
  existingLayers.forEach(layer => {
    if (layer.id.startsWith('route-')) {
      map.value.removeLayer(layer.id);
      map.value.removeSource(layer.id);
    }
  });

  // Draw new routes
  roads.forEach((road, index) => drawRoute(road, index));
  updateMapBounds();
};

watch(() => props.roads, (newVal) => {
  updateMapData(newVal);
}, { deep: true });

onMounted(initMap);

defineExpose({
  updateLineColor: (index, direction, color) => {
    const layerId = `route-${index}-${direction}`;
    if (map.value.getLayer(layerId)) {
      map.value.setPaintProperty(layerId, 'line-color', color);
    }
  },
  updateMapData
});
</script>