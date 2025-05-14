<template>
  <div id="map" class="w-full h-full rounded-xl relative min-h-[300px]"></div>
</template>

<script setup>
import { defineProps, onMounted, watch, ref } from "vue";
import { createApp } from "vue";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import RoadPopup from "./MapPopUp.vue";

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

// Core state refs
const map = ref(null);
const loaded = ref(false);
const boundsInitialized = ref(false);
const currentPopup = ref(null);

// Create popup with road information
const showRoadPopup = (feature, lngLat) => {
  if (currentPopup.value) currentPopup.value.remove();
  
  // Create Vue component for popup content
  const popupApp = createApp(RoadPopup, {
    roadId: feature.properties.roadId || "",
    roadName: feature.properties.roadName || "Road",
    directionText: `${feature.properties.direction?.charAt(0).toUpperCase() + feature.properties.direction?.slice(1) || ""} Traffic`,
    trafficStatus: feature.properties.trafficStatus || "",
    roadType: feature.properties.roadType || "Street",
  });

  // Mount component to DOM container
  const container = document.createElement('div');
  popupApp.mount(container);

  // Create and display popup
  currentPopup.value = new mapboxgl.Popup({
    closeButton: true,
    closeOnClick: true,
    maxWidth: '300px',
    anchor: 'bottom',
    offset: [0, -10],
    className: 'custom-popup'
  })
    .setLngLat(lngLat)
    .setDOMContent(container)
    .addTo(map.value);
};

// Initialize or reinitialize map with specified style
const createMap = (style, viewState = {}) => {
  // Default map settings
  const options = {
    center: [120.5948, 16.4133],
    zoom: 16,
    bearing: 0,
    pitch: 0,
    ...viewState
  };

  // Clean up existing map instance
  if (map.value) map.value.remove();

  // Create new map
  map.value = new mapboxgl.Map({
    container: "map",
    style,
    ...options,
    transformRequest: (url, resourceType) => 
      ['SpriteJSON', 'SpriteImage'].includes(resourceType) 
        ? { url: `${url}${url.includes('?') ? '&' : '?'}cachebust=${Date.now()}` } 
        : undefined
  });

  // Add navigation controls
  map.value.addControl(new mapboxgl.NavigationControl(), "bottom-right");

  // Initialize data when map is ready
  map.value.on("load", () => {
    loaded.value = true;
    updateMapData(props.roads, true);
  });
};

// Setup interaction events for map layers
const setupLayerEvents = (layerId) => {
  // Handle click events
  map.value.on('click', layerId, (e) => {
    if (currentPopup.value) currentPopup.value.remove();
    
    const clickedFeature = e.features[0];
    const clickedLocation = e.lngLat;
    
    // Calculate adjusted center position for popup
    const verticalOffset = map.value.getContainer().clientHeight * 0.25;
    const point = map.value.project(clickedLocation);
    point.y -= verticalOffset;
    const adjustedCenter = map.value.unproject(point);

    // Animate to new center position
    map.value.flyTo({
      center: adjustedCenter,
      zoom: Math.max(map.value.getZoom(), 15),
      duration: 800,
      essential: true
    });

    // Show popup after animation completes
    map.value.once('moveend', () => {
      setTimeout(() => showRoadPopup(clickedFeature, clickedLocation), 50);
    });
  });

  // Handle hover effects
  map.value.on('mouseenter', layerId, () => map.value.getCanvas().style.cursor = 'pointer');
  map.value.on('mouseleave', layerId, () => map.value.getCanvas().style.cursor = '');
};

// Draw a road on the map with inbound/outbound directions
const drawRoute = (road, index) => {
  // Remove existing layers for this road
  ['inbound', 'outbound'].forEach(direction => {
    const layerId = `route-${index}-${direction}`;
    const labelId = `label-${index}-${direction}`;

    [layerId, labelId].forEach(id => {
      if (map.value.getLayer(id)) map.value.removeLayer(id);
      if (map.value.getSource(id)) map.value.removeSource(id);
    });
  });

  // Draw both directions for this road
  ['inbound', 'outbound'].forEach(direction => {
    const coords = road.geometry?.coordinates?.[direction];
    if (!coords?.length) return;

    const color = props.colorMap[road[direction + 'Color']];
    const layerId = `route-${index}-${direction}`;
    const labelId = `label-${index}-${direction}`;

    // Create data source
    map.value.addSource(layerId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {
          name: direction.charAt(0).toUpperCase() + direction.slice(1),
          roadId: road.properties.id,
          roadName: road.properties.name,
          roadType: road.properties.roadType,
          trafficStatus: road[direction + 'Color'],
          direction
        },
        geometry: {
          type: 'LineString',
          coordinates: coords
        }
      }
    });

    // Add line layer with color based on traffic status
    map.value.addLayer({
      id: layerId,
      type: 'line',
      source: layerId,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': color, 'line-width': 4, 'line-opacity': 0.7 }
    });

    // Set up interactivity
    setupLayerEvents(layerId);

    // Add direction label layer
    map.value.addLayer({
      id: labelId,
      type: 'symbol',
      source: layerId,
      layout: {
        'text-field': ['get', 'name'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 12, 2, 15, 4, 18, 12],
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
};

// Calculate map bounds to fit all roads
const getBounds = (roads) => {
  const bounds = new mapboxgl.LngLatBounds();
  roads.forEach(road => {
    ['inbound', 'outbound'].forEach(direction => {
      road.geometry?.coordinates?.[direction]?.forEach(coord => bounds.extend(coord));
    });
  });
  return bounds;
};

// Update all road data on the map
const updateMapData = (roads, initBounds = false) => {
  if (!loaded.value || !map.value) return;

  roads.forEach((road, index) => drawRoute(road, index));

  // Initial fit to show all roads
  if (initBounds && !boundsInitialized.value) {
    const bounds = getBounds(roads);
    if (!bounds.isEmpty()) map.value.fitBounds(bounds, { padding: 60 });
    boundsInitialized.value = true;
  }
};

// Update color for a specific road direction
const updateRoadColor = (roadId, direction, color) => {
  if (!loaded.value || !map.value) return;

  const roadIndex = props.roads.findIndex(r => r.properties.id.toString() === roadId.toString());
  if (roadIndex === -1) return;

  const layerId = `route-${roadIndex}-${direction}`;
  if (map.value.getLayer(layerId)) {
    map.value.setPaintProperty(layerId, 'line-color', props.colorMap[color]);
  }
};

// Focus map view on a specific road
const focusOnRoad = (roadId) => {
  if (!loaded.value || !map.value) return;

  const selectedRoad = props.roads.find(r => r.properties.id.toString() === roadId.toString());
  if (!selectedRoad?.geometry?.coordinates) return;

  const bounds = new mapboxgl.LngLatBounds();
  ['inbound', 'outbound'].forEach(direction => {
    selectedRoad.geometry.coordinates[direction]?.forEach(coord => bounds.extend(coord));
  });

  if (!bounds.isEmpty()) {
    map.value.fitBounds(bounds, { padding: 100, duration: 1000, maxZoom: 17 });
  }
};

// Handle map style changes
watch(() => props.mapStyle, (newStyle) => {
  if (!map.value || !loaded.value) return;

  // Preserve current view state when changing styles
  const viewState = {
    center: map.value.getCenter(),
    zoom: map.value.getZoom(),
    bearing: map.value.getBearing(),
    pitch: map.value.getPitch()
  };

  if (currentPopup.value) {
    currentPopup.value.remove();
    currentPopup.value = null;
  }

  createMap(newStyle, viewState);
});

// Initialize map on component mount
onMounted(() => {
  mapboxgl.accessToken = props.apiKey;
  createMap(props.mapStyle);
});

// Expose methods for parent components
defineExpose({ updateRoadColor, updateMapData, focusOnRoad });
</script>

<style>
/* Mapbox element styling overrides */
.mapboxgl-popup-content {
  background-color: transparent !important;
  padding: 0 !important;
  box-shadow: none !important;
}

.mapboxgl-popup-tip {
  display: none !important;
}

.mapboxgl-popup-close-button {
  font-size: 16px;
  color: white;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  right: 8px;
  top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}
</style>