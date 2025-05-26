<template>
  <div id="map" class="w-full h-full rounded-xl relative min-h-[300px]"></div>
</template>

<script setup>
import { defineProps, onMounted, watch, ref, defineEmits } from "vue";
import { createApp } from "vue";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import RoadPopup from "./MapPopUp.vue";

// Configuration
const DEFAULT_MAP_CENTER = [120.5948, 16.4133];
const DEFAULT_MAP_ZOOM = 16;
const DEFAULT_MAP_BEARING = 0;
const DEFAULT_MAP_PITCH = 0;
const DIRECTION_TYPES = ['inbound', 'outbound'];
const POPUP_VERTICAL_OFFSET = 0.25;
const POPUP_DELAY = 50;
const MAP_FIT_PADDING = 60;
const ROAD_FOCUS_PADDING = 100;
const ROAD_FOCUS_DURATION = 1000;
const ROAD_FOCUS_MAX_ZOOM = 17;
const POPUP_RESTORE_DELAY = 100;
const MAP_CLEANUP_DELAY = 100;
const LAYER_PAINT_CONFIG = {
  'line-width': 4,
  'line-opacity': 0.7
};
const LABEL_LAYOUT_CONFIG = {
  'text-size': ['interpolate', ['linear'], ['zoom'], 12, 2, 15, 4, 18, 12],
  'symbol-placement': 'line',
  'text-allow-overlap': true,
  'text-ignore-placement': true,
  'text-keep-upright': true,
  'text-letter-spacing': 0.05,
  'text-max-angle': 30,
  'text-pitch-alignment': 'viewport'
};
const LABEL_PAINT_CONFIG = {
  'text-color': '#ffffff',
  'text-halo-color': '#000000',
  'text-halo-width': 1.5
};

// Props definition
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
const emit = defineEmits(['closeTrafficModal']);

// Core state
const map = ref(null);
const loaded = ref(false);
const boundsInitialized = ref(false);
const currentPopup = ref(null);

// Data retrieval functions
const getRoadById = (roadId) => {
  return props.roads.find(road => String(road.properties?.id) === String(roadId));
};

const getMapBounds = (roads) => {
  const bounds = new mapboxgl.LngLatBounds();
  roads.forEach(road => {
    DIRECTION_TYPES.forEach(direction => {
      road.geometry?.coordinates?.[direction]?.forEach(coord => bounds.extend(coord));
    });
  });
  return bounds;
};

const getCurrentViewState = () => {
  if (!map.value) return null;
  
  return {
    center: map.value.getCenter(),
    zoom: map.value.getZoom(),
    bearing: map.value.getBearing(),
    pitch: map.value.getPitch()
  };
};

const findFeatureForRoad = (roadId) => {
  for (let i = 0; i < props.roads.length; i++) {
    for (const direction of DIRECTION_TYPES) {
      const layerId = `route-${i}-${direction}`;
      if (map.value.getLayer(layerId)) {
        const source = map.value.getSource(layerId);
        if (source && String(source._data?.properties?.roadId) === String(roadId)) {
          return JSON.parse(JSON.stringify(source._data));
        }
      }
    }
  }
  return null;
};

const capturePopupState = () => {
  if (!currentPopup.value) return null;
  
  return {
    roadId: currentPopup.value._roadId,
    lngLat: currentPopup.value.getLngLat(),
    roadName: currentPopup.value._roadName
  };
};

// Data modification functions
const createMap = (style, viewState = {}) => {
  const defaultOptions = {
    center: DEFAULT_MAP_CENTER,
    zoom: DEFAULT_MAP_ZOOM,
    bearing: DEFAULT_MAP_BEARING,
    pitch: DEFAULT_MAP_PITCH
  };

  const options = { ...defaultOptions, ...viewState };

  if (map.value) map.value.remove();

  map.value = new mapboxgl.Map({
    container: "map",
    style,
    ...options,
    transformRequest: (url, resourceType) =>
      ['SpriteJSON', 'SpriteImage'].includes(resourceType)
        ? { url: `${url}${url.includes('?') ? '&' : '?'}cachebust=${Date.now()}` }
        : undefined
  });

  map.value.addControl(new mapboxgl.NavigationControl(), "bottom-right");

  map.value.on("load", () => {
    loaded.value = true;
    updateMapData(props.roads, true);
  });
};

const drawRoute = (road, index) => {
  DIRECTION_TYPES.forEach(direction => {
    const layerId = `route-${index}-${direction}`;
    const labelId = `label-${index}-${direction}`;

    if (map.value.getLayer(labelId)) map.value.removeLayer(labelId);
    if (map.value.getLayer(layerId)) map.value.removeLayer(layerId);
    if (map.value.getSource(layerId)) map.value.removeSource(layerId);
  });

  DIRECTION_TYPES.forEach(direction => {
    const coords = road.geometry?.coordinates?.[direction];
    if (!coords?.length) return;

    const color = props.colorMap[road[direction + 'Color']];
    const layerId = `route-${index}-${direction}`;
    const labelId = `label-${index}-${direction}`;

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

    map.value.addLayer({
      id: layerId,
      type: 'line',
      source: layerId,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': color, ...LAYER_PAINT_CONFIG }
    });

    setupLayerEvents(layerId);

    map.value.addLayer({
      id: labelId,
      type: 'symbol',
      source: layerId,
      layout: {
        'text-field': ['get', 'name'],
        ...LABEL_LAYOUT_CONFIG
      },
      paint: LABEL_PAINT_CONFIG
    });
  });
};

const updateRoadColor = (roadId, direction, color) => {
  if (!loaded.value || !map.value) return;

  const roadIndex = props.roads.findIndex(r => r.properties.id.toString() === roadId.toString());
  if (roadIndex === -1) return;

  const layerId = `route-${roadIndex}-${direction}`;
  if (map.value.getLayer(layerId)) {
    map.value.setPaintProperty(layerId, 'line-color', props.colorMap[color]);
  }
};

const updateMapData = (roads, initBounds = false) => {
  if (!loaded.value || !map.value) return;

  const popupData = capturePopupState();

  try {
    cleanupMapLayers(roads);
  } catch (err) {
    // Continue with adding new data
  }

  roads.forEach((road, index) => drawRoute(road, index));

  if (initBounds && !boundsInitialized.value) {
    const bounds = getMapBounds(roads);
    if (!bounds.isEmpty()) map.value.fitBounds(bounds, { padding: MAP_FIT_PADDING });
    boundsInitialized.value = true;
  }

  restorePopup(popupData, roads);
};

const focusOnRoad = (roadId) => {
  if (!loaded.value || !map.value) return;

  const selectedRoad = props.roads.find(r => r.properties.id.toString() === roadId.toString());
  if (!selectedRoad?.geometry?.coordinates) return;

  const bounds = new mapboxgl.LngLatBounds();
  DIRECTION_TYPES.forEach(direction => {
    selectedRoad.geometry.coordinates[direction]?.forEach(coord => bounds.extend(coord));
  });

  if (!bounds.isEmpty()) {
    map.value.fitBounds(bounds, { 
      padding: ROAD_FOCUS_PADDING, 
      duration: ROAD_FOCUS_DURATION, 
      maxZoom: ROAD_FOCUS_MAX_ZOOM 
    });
  }
};

const reloadMapData = async (roads) => {
  if (!loaded.value || !map.value) return;

  closeAllPopups();

  const loadingElement = createLoadingOverlay();
  map.value.getContainer().appendChild(loadingElement);

  try {
    const viewState = getCurrentViewState();

    try {
      cleanupMapLayers(roads);
    } catch (err) {
      // Continue with adding new data
    }

    await new Promise(resolve => setTimeout(resolve, MAP_CLEANUP_DELAY));

    roads.forEach((road, index) => drawRoute(road, index));

    map.value.jumpTo(viewState);
  } finally {
    const overlay = map.value.getContainer().querySelector('.map-loading-overlay');
    if (overlay) overlay.remove();
  }
};

const refreshCurrentPopup = () => {
  if (!currentPopup.value || !map.value) return;

  const roadId = currentPopup.value._roadId;
  const lngLat = currentPopup.value.getLngLat();

  const updatedRoad = getRoadById(roadId);
  if (!updatedRoad) return;

  const feature = findFeatureForRoad(roadId);
  if (!feature) return;

  currentPopup.value.remove();
  currentPopup.value = null;

  updateFeatureWithRoadData(feature, updatedRoad);

  setTimeout(() => showRoadPopup(feature, lngLat), 0);
};

const updateFeatureWithRoadData = (feature, roadData) => {
  if (!roadData) return;

  const normalizedRoadName = normalizeRoadName(roadData, feature);

  feature.properties.roadName = normalizedRoadName;
  feature.properties.name = normalizedRoadName;
  feature.road_name = normalizedRoadName;

  feature.properties.roadType = roadData.properties?.roadType ||
    feature.properties.roadType;

  feature.properties.road_type_id = roadData.road_type_id ||
    roadData.properties?.road_type_id;
};

const restorePopup = (popupData, roads) => {
  if (!popupData) return;
  
  setTimeout(() => {
    const road = roads.find(r => String(r.properties?.id) === String(popupData.roadId));
    if (!road) return;

    const feature = findFeatureForRoad(popupData.roadId);
    if (!feature) return;

    feature.properties.roadName = road.road_name || road.properties?.name || feature.properties.roadName;
    showRoadPopup(feature, popupData.lngLat);
  }, POPUP_RESTORE_DELAY);
};

// Data removal functions
const closeAllPopups = () => {
  if (currentPopup.value) {
    currentPopup.value.remove();
    currentPopup.value = null;

    const popupElements = document.querySelectorAll('.mapboxgl-popup');
    popupElements.forEach(elem => {
      elem.parentNode?.removeChild(elem);
    });
  }
};

const cleanupMapLayers = (roads) => {
  roads.forEach((road, index) => {
    DIRECTION_TYPES.forEach(direction => {
      const layerId = `route-${index}-${direction}`;
      const labelId = `label-${index}-${direction}`;

      if (map.value.getLayer(labelId)) map.value.removeLayer(labelId);
      if (map.value.getLayer(layerId)) map.value.removeLayer(layerId);
    });
  });

  roads.forEach((road, index) => {
    DIRECTION_TYPES.forEach(direction => {
      const layerId = `route-${index}-${direction}`;
      if (map.value.getSource(layerId)) map.value.removeSource(layerId);
    });
  });
};

// Helper functions
const normalizeRoadName = (currentRoadData, feature) => {
  return currentRoadData.road_name ||
    currentRoadData.properties?.name ||
    feature.properties.roadName ||
    feature.road_name ||
    feature.properties.name ||
    "Unknown Road";
};

const getRoadNameForDisplay = (feature) => {
  return feature.properties.roadName ||
    feature.road_name ||
    feature.properties.name ||
    "Road";
};

const createPopupContainer = (roadId, roadName) => {
  const container = document.createElement('div');
  container.dataset.roadId = roadId;
  container.dataset.createdAt = new Date().toISOString();
  container.dataset.roadName = roadName;
  return container;
};

const createMapboxPopup = (lngLat) => {
  return new mapboxgl.Popup({
    closeButton: true,
    closeOnClick: true,
    maxWidth: '300px',
    anchor: 'bottom',
    offset: [0, -10],
    className: 'custom-popup'
  }).setLngLat(lngLat);
};

const createLoadingOverlay = () => {
  const loadingElement = document.createElement('div');
  loadingElement.className = 'map-loading-overlay';
  loadingElement.innerHTML = `
    <div class="spinner"></div>
    <div class="loading-text">Refreshing map data...</div>
  `;
  return loadingElement;
};

// Event handlers and UI interactions
const showRoadPopup = (feature, lngLat) => {
  const roadId = feature.properties.roadId || "";
  let currentRoadData = getRoadById(roadId);

  updateFeatureWithRoadData(feature, currentRoadData);
  
  const roadNameToUse = getRoadNameForDisplay(feature);

  const popupApp = createApp(RoadPopup, {
    roadId,
    roadName: roadNameToUse,
    directionText: `${feature.properties.direction?.charAt(0).toUpperCase() + feature.properties.direction?.slice(1) || ""} Traffic`,
    trafficStatus: feature.properties.trafficStatus || "",
    roadType: currentRoadData?.properties?.roadType || feature.properties.roadType || "Street",
    roadImage: currentRoadData?.image_path || feature.image_path,
    onCloseTrafficModal: () => {
      emit('closeTrafficModal');
    }
  });

  const container = createPopupContainer(roadId, roadNameToUse);
  popupApp.mount(container);

  currentPopup.value = createMapboxPopup(lngLat)
    .setDOMContent(container)
    .addTo(map.value);

  currentPopup.value._roadId = roadId;
  currentPopup.value._createdAt = new Date().toISOString();
  currentPopup.value._roadName = roadNameToUse;
};

const setupLayerEvents = (layerId) => {
  map.value.on('click', layerId, (e) => {
    if (currentPopup.value) currentPopup.value.remove();

    const clickedFeature = e.features[0];
    const clickedLocation = e.lngLat;

    const verticalOffset = map.value.getContainer().clientHeight * POPUP_VERTICAL_OFFSET;
    const point = map.value.project(clickedLocation);
    point.y -= verticalOffset;
    const adjustedCenter = map.value.unproject(point);

    map.value.flyTo({
      center: adjustedCenter,
      zoom: Math.max(map.value.getZoom(), 15),
      duration: 800,
      essential: true
    });

    map.value.once('moveend', () => {
      setTimeout(() => showRoadPopup(clickedFeature, clickedLocation), POPUP_DELAY);
    });
  });

  map.value.on('mouseenter', layerId, () => map.value.getCanvas().style.cursor = 'pointer');
  map.value.on('mouseleave', layerId, () => map.value.getCanvas().style.cursor = '');
};

// Lifecycle and watchers
onMounted(() => {
  mapboxgl.accessToken = props.apiKey;
  createMap(props.mapStyle);
});

watch(() => props.mapStyle, (newStyle) => {
  if (!map.value || !loaded.value) return;

  const viewState = getCurrentViewState();

  if (currentPopup.value) {
    currentPopup.value.remove();
    currentPopup.value = null;
  }

  createMap(newStyle, viewState);
});

watch(() => props.roads, (newRoads) => {
  if (map.value && loaded.value) {
    if (currentPopup.value) {
      refreshCurrentPopup();
    }
    updateMapData(newRoads);
  }
}, { deep: true });

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