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
  activeRoadId: String,
  mapStyle: {
    type: String,
    default: "mapbox://styles/mapbox/dark-v11"
  }
});

const map = ref(null);
const loaded = ref(false);
const boundsInitialized = ref(false); 

const initMap = () => {
  mapboxgl.accessToken = props.apiKey;
  
  map.value = new mapboxgl.Map({
    container: "map",
    style: props.mapStyle,
    center: [120.5948, 16.4133],
    zoom: 16,
    transformRequest: (url, resourceType) => {
      // Add cache-busting for sprite resources
      if (resourceType === 'SpriteJSON' || resourceType === 'SpriteImage') {
        return {
          url: url + (url.includes('?') ? '&' : '?') + 'cachebust=' + Date.now()
        };
      }
    }
  });

  map.value.addControl(new mapboxgl.NavigationControl(), "bottom-right");

  map.value.on("load", () => {
    loaded.value = true;
    updateMapData(props.roads, true); // true = initialize bounds
  });
};

const drawRoute = (road, index) => {
  // Cleanup existing layers
  ['inbound', 'outbound'].forEach(direction => {
    const layerId = `route-${index}-${direction}`;
    const labelId = `label-${index}-${direction}`;
    if (map.value.getLayer(labelId)) map.value.removeLayer(labelId);
    if (map.value.getLayer(layerId)) map.value.removeLayer(layerId);
    if (map.value.getSource(layerId)) map.value.removeSource(layerId);
    if (map.value.getSource(labelId)) map.value.removeSource(labelId);
  });

  // Draw new routes
  if (road.geometry?.coordinates) {
    ['inbound', 'outbound'].forEach(direction => {
      const coords = road.geometry.coordinates[direction];
      const color = props.colorMap[road[direction + 'Color']];

      // Skip if no coordinates
      if (!coords || coords.length === 0) return;

      // Add the line source
      map.value.addSource(`route-${index}-${direction}`, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {
            name: direction.charAt(0).toUpperCase() + direction.slice(1)
          },
          geometry: {
            type: 'LineString',
            coordinates: coords
          }
        }
      });

      // Add the line
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

      // Add the label that follows the line
      map.value.addLayer({
        id: `label-${index}-${direction}`,
        type: 'symbol',
        source: `route-${index}-${direction}`,
        layout: {
          'text-field': ['get', 'name'],
          'text-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            12, 2,
            15, 4,
            18, 12
          ],
          'symbol-placement': 'line',
          'text-allow-overlap': true,
          'text-ignore-placement': true,
          'text-keep-upright': true,
          'text-letter-spacing': 0.05,
          'text-max-angle': 30,
          'text-pitch-alignment': 'viewport'
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 1.5
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

const updateMapData = (roads, initBounds = false) => {
  if (!loaded.value || !map.value) return;

  // Draw new routes
  roads.forEach((road, index) => drawRoute(road, index));

  // Only update bounds on initial load or when explicitly requested
  if (initBounds && !boundsInitialized.value) {
    updateMapBounds();
    boundsInitialized.value = true;
  }
};

// Update a specific road's color without redrawing everything
const updateRoadColor = (roadId, direction, color) => {
  if (!loaded.value || !map.value) return;

  const roadIndex = props.roads.findIndex(r => r.properties.id.toString() === roadId.toString());
  if (roadIndex === -1) return;

  const layerId = `route-${roadIndex}-${direction}`;
  if (map.value.getLayer(layerId)) {
    map.value.setPaintProperty(layerId, 'line-color', props.colorMap[color]);
  }

  // No need to update the label - it stays the same, only the line color changes
};

watch(() => props.mapStyle, (newStyle) => {
  if (map.value && loaded.value) {
    // Store current view state
    const center = map.value.getCenter();
    const zoom = map.value.getZoom();
    const bearing = map.value.getBearing();
    const pitch = map.value.getPitch();
    
    // Instead of modifying the existing map style, we need to create a new Map instance
    // This is a more reliable approach to handle sprite issues
    map.value.remove();
    
    // Create new map with the new style
    map.value = new mapboxgl.Map({
      container: "map",
      style: newStyle,
      center: center,
      zoom: zoom,
      bearing: bearing,
      pitch: pitch,
      transformRequest: (url, resourceType) => {
        if (resourceType === 'SpriteJSON' || resourceType === 'SpriteImage') {
          return {
            url: url + (url.includes('?') ? '&' : '?') + 'cachebust=' + Date.now()
          };
        }
      }
    });

    map.value.addControl(new mapboxgl.NavigationControl(), "top-right");
    
    // Wait for the style to load before adding data layers
    map.value.on("load", () => {
      loaded.value = true;
      updateMapData(props.roads);
    });
  }
});

onMounted(initMap);

const focusOnRoad = (roadId) => {
  if (!loaded.value || !map.value) return;

  // Find the road in the props.roads array
  const selectedRoad = props.roads.find(r => r.properties.id.toString() === roadId.toString());
  if (!selectedRoad || !selectedRoad.geometry?.coordinates) return;

  // Create a bounds object that includes both inbound and outbound coordinates
  const bounds = new mapboxgl.LngLatBounds();

  // Add all coordinates to bounds
  ['inbound', 'outbound'].forEach(direction => {
    selectedRoad.geometry.coordinates[direction]?.forEach(coord => {
      bounds.extend(coord);
    });
  });

  // Only proceed if we have coordinates
  if (bounds.isEmpty()) return;

  // Animate the map to zoom to the road
  map.value.fitBounds(bounds, {
    padding: 100, // Add padding around the road
    duration: 1000, // Animation duration in milliseconds
    maxZoom: 17 // Prevent excessive zooming
  });
};

// Update the defineExpose to include the new function
defineExpose({
  updateRoadColor,
  updateMapData,
  focusOnRoad
});
</script>