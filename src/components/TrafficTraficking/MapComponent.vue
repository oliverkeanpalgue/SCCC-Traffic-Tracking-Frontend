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
  // Get the most current road data using the roadId from feature properties
  const roadId = feature.properties.roadId || "";
  let currentRoadData = props.roads.find(road =>
    String(road.properties?.id) === String(roadId)
  );

  // Update feature properties with fresh data if road is found
  if (currentRoadData) {
    // Normalize road name using priority order
    const normalizedRoadName = currentRoadData.road_name ||
      currentRoadData.properties?.name ||
      feature.properties.roadName ||
      feature.road_name ||
      feature.properties.name ||
      "Unknown Road";

    // Update all name fields for consistency
    feature.properties.roadName = normalizedRoadName;
    feature.properties.name = normalizedRoadName;
    feature.road_name = normalizedRoadName;
    feature.properties.roadType = currentRoadData.properties?.roadType || feature.properties.roadType;
  }

  // Get final name for popup display
  const roadNameToUse = feature.properties.roadName ||
    feature.road_name ||
    feature.properties.name ||
    "Road";

  // Create Vue component for popup content
  const popupApp = createApp(RoadPopup, {
    roadId,
    roadName: roadNameToUse,
    directionText: `${feature.properties.direction?.charAt(0).toUpperCase() + feature.properties.direction?.slice(1) || ""} Traffic`,
    trafficStatus: feature.properties.trafficStatus || "",
    roadType: currentRoadData?.properties?.roadType || feature.properties.roadType || "Street",
  });

  // Mount component to DOM container
  const container = document.createElement('div');
  container.dataset.roadId = roadId;
  container.dataset.createdAt = new Date().toISOString();
  container.dataset.roadName = roadNameToUse;
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

  // Store metadata on popup for later reference
  currentPopup.value._roadId = roadId;
  currentPopup.value._createdAt = new Date().toISOString();
  currentPopup.value._roadName = roadNameToUse;
};

// Initialize or reinitialize map with specified style
const createMap = (style, viewState = {}) => {
  // Default map settings
  const defaultOptions = {
    center: [120.5948, 16.4133],
    zoom: 16,
    bearing: 0,
    pitch: 0
  };
  
  const options = { ...defaultOptions, ...viewState };

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
  const directions = ['inbound', 'outbound'];
  
  // Remove existing layers and sources for this road
  directions.forEach(direction => {
    const layerId = `route-${index}-${direction}`;
    const labelId = `label-${index}-${direction}`;

    // Remove layers first
    if (map.value.getLayer(labelId)) map.value.removeLayer(labelId);
    if (map.value.getLayer(layerId)) map.value.removeLayer(layerId);

    // Then remove sources
    if (map.value.getSource(layerId)) map.value.removeSource(layerId);
  });

  // Draw both directions for this road
  directions.forEach(direction => {
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
          roadName: road.properties.name || road.road_name || "Unknown Road",
          roadType: road.properties.roadType,
          trafficStatus: road[direction + 'Color'],
          direction,
          lastUpdated: new Date().toISOString()
        },
        geometry: {
          type: Array.isArray(coords[0][0]) ? 'MultiLineString' : 'LineString',
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

  // Store current popup data before updating map
  let popupData = null;
  if (currentPopup.value) {
    popupData = {
      roadId: currentPopup.value._roadId,
      lngLat: currentPopup.value.getLngLat(),
      roadName: currentPopup.value._roadName
    };
    currentPopup.value.remove();
    currentPopup.value = null;
  }

  try {
    // Two-phase cleanup to avoid dependency errors
    
    // Step 1: First remove all layers
    roads.forEach((road, index) => {
      ['inbound', 'outbound'].forEach(direction => {
        const layerId = `route-${index}-${direction}`;
        const labelId = `label-${index}-${direction}`;

        if (map.value.getLayer(labelId)) map.value.removeLayer(labelId);
        if (map.value.getLayer(layerId)) map.value.removeLayer(layerId);
      });
    });

    // Step 2: Then remove all sources
    roads.forEach((road, index) => {
      ['inbound', 'outbound'].forEach(direction => {
        const layerId = `route-${index}-${direction}`;
        if (map.value.getSource(layerId)) map.value.removeSource(layerId);
      });
    });
  } catch (err) {
    // Non-critical error, continue with adding new data
  }

  // Draw all roads with fresh data
  roads.forEach((road, index) => drawRoute(road, index));

  // Initial fit to show all roads
  if (initBounds && !boundsInitialized.value) {
    const bounds = getBounds(roads);
    if (!bounds.isEmpty()) map.value.fitBounds(bounds, { padding: 60 });
    boundsInitialized.value = true;
  }

  // Restore popup if we had one
  if (popupData) {
    setTimeout(() => {
      // Find the road data in the new roads array
      const road = roads.find(r =>
        String(r.properties?.id) === String(popupData.roadId)
      );

      if (!road) return;

      // Find a feature with this road ID
      let feature = null;
      for (let i = 0; i < roads.length; i++) {
        ['inbound', 'outbound'].forEach(direction => {
          const layerId = `route-${i}-${direction}`;
          if (map.value.getLayer(layerId)) {
            const source = map.value.getSource(layerId);
            if (source && String(source._data?.properties?.roadId) === String(popupData.roadId)) {
              feature = source._data;
            }
          }
        });
      }

      if (feature) {
        // Update the feature with the latest road name before showing popup
        feature.properties.roadName = road.road_name || road.properties?.name || feature.properties.roadName;
        showRoadPopup(feature, popupData.lngLat);
      }
    }, 100);
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

// Refresh the current popup with latest data
const refreshCurrentPopup = () => {
  if (!currentPopup.value || !map.value) return;

  const roadId = currentPopup.value._roadId;
  const lngLat = currentPopup.value.getLngLat();

  // Find the updated road data
  const updatedRoad = props.roads.find(r =>
    String(r.properties?.id) === String(roadId)
  );

  if (!updatedRoad) return;

  // Find a matching feature for this road
  let feature = null;
  for (let i = 0; i < props.roads.length; i++) {
    ['inbound', 'outbound'].forEach(direction => {
      const layerId = `route-${i}-${direction}`;
      if (map.value.getLayer(layerId)) {
        const source = map.value.getSource(layerId);
        if (source && String(source._data?.properties?.roadId) === String(roadId)) {
          // Deep clone to avoid reference issues
          feature = JSON.parse(JSON.stringify(source._data));
        }
      }
    });
  }

  if (feature) {
    // First remove existing popup
    currentPopup.value.remove();
    currentPopup.value = null;

    // Update feature with fresh data before recreating popup
    const normalizedRoadName = updatedRoad.road_name || updatedRoad.properties?.name;
    feature.properties.roadName = normalizedRoadName;
    feature.properties.name = normalizedRoadName;
    feature.road_name = normalizedRoadName;
    feature.properties.roadType = updatedRoad.properties?.roadType;

    // Show new popup with fresh data
    setTimeout(() => showRoadPopup(feature, lngLat), 0);
  }
};

// Close all popups on the map
const closeAllPopups = () => {
  if (currentPopup.value) {
    // Remove the popup from the map
    currentPopup.value.remove();
    // Clear the reference
    currentPopup.value = null;

    // Clean up any DOM elements left behind
    const popupElements = document.querySelectorAll('.mapboxgl-popup');
    popupElements.forEach(elem => {
      elem.parentNode?.removeChild(elem);
    });
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

// Update map when road data changes
watch(() => props.roads, (newRoads) => {
  if (map.value && loaded.value) {
    // If there's an open popup, try refreshing it with updated data
    if (currentPopup.value) {
      refreshCurrentPopup();
    }

    // Reload all road data
    updateMapData(newRoads);
  }
}, { deep: true });

// Initialize map on component mount
onMounted(() => {
  mapboxgl.accessToken = props.apiKey;
  createMap(props.mapStyle);
});

// Full map refresh with loading indication
const reloadMapData = async (roads) => {
  if (!loaded.value || !map.value) return;

  // Close any open popups
  closeAllPopups();

  // Add a loading overlay to the map
  const loadingElement = document.createElement('div');
  loadingElement.className = 'map-loading-overlay';
  loadingElement.innerHTML = `
    <div class="spinner"></div>
    <div class="loading-text">Refreshing map data...</div>
  `;
  map.value.getContainer().appendChild(loadingElement);

  try {
    // Store current view state for restoration
    const viewState = {
      center: map.value.getCenter(),
      zoom: map.value.getZoom(),
      bearing: map.value.getBearing(),
      pitch: map.value.getPitch()
    };

    // Two-phase cleanup (layers first, then sources)
    try {
      // Phase 1: Remove all layers
      roads.forEach((road, index) => {
        ['inbound', 'outbound'].forEach(direction => {
          const layerId = `route-${index}-${direction}`;
          const labelId = `label-${index}-${direction}`;

          if (map.value.getLayer(labelId)) map.value.removeLayer(labelId);
          if (map.value.getLayer(layerId)) map.value.removeLayer(layerId);
        });
      });

      // Phase 2: Now it's safe to remove sources
      roads.forEach((road, index) => {
        ['inbound', 'outbound'].forEach(direction => {
          const layerId = `route-${index}-${direction}`;
          if (map.value.getSource(layerId)) map.value.removeSource(layerId);
        });
      });
    } catch (err) {
      // Non-critical error, continue with adding new data
    }

    // Brief pause to ensure all removals are processed
    await new Promise(resolve => setTimeout(resolve, 100));

    // Add all roads with fresh data
    roads.forEach((road, index) => drawRoute(road, index));

    // Restore the original view
    map.value.jumpTo(viewState);
  } finally {
    // Remove loading overlay
    const overlay = map.value.getContainer().querySelector('.map-loading-overlay');
    if (overlay) overlay.remove();
  }
};

// Expose methods to parent components
defineExpose({
  updateRoadColor,
  updateMapData,
  reloadMapData,
  focusOnRoad,
  getCurrentPopup: () => currentPopup.value,
  closeAllPopups,
  refreshCurrentPopup
});
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

/* Enhanced loading overlay styles */
.map-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  border-radius: 0.75rem;
  backdrop-filter: blur(2px);
  animation: fadeIn 0.2s ease-in-out;
}

.map-loading-overlay .spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #7CFC00;
  animation: spin 0.8s cubic-bezier(0.6, 0.2, 0.4, 0.8) infinite;
  margin-bottom: 10px;
}

.map-loading-overlay .loading-text {
  color: white;
  font-size: 16px;
  font-weight: 500;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0% {
    opacity: 0.7;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0.7;
  }
}
</style>