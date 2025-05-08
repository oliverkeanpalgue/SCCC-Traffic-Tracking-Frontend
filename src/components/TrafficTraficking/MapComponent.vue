<template>
  <div id="map" class="w-full h-full rounded-xl relative min-h-[300px]"></div>
  
  <div ref="popupTemplateRef" class="hidden">
    <div>
      <h3>{{ popupData.roadName }}</h3>
      <div>
        <span>{{ popupData.directionText }}</span>
        <div>
          <span>{{ popupData.statusLabel }}</span>
          <div data-status="{{ popupData.trafficStatus }}"></div>
        </div>
      </div>
    </div>
  </div>
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
const currentPopup = ref(null);
const popupTemplateRef = ref(null);
const popupData = ref({
  roadName: '',
  directionText: '',
  statusLabel: '',
  trafficStatus: ''
});

// Map status to label text
const statusLabels = { 'green': 'Light', 'yellow': 'Moderate', 'red': 'Heavy' };

const showRoadPopup = (feature, lngLat) => {
  const props = feature.properties;
  
  popupData.value = {
    roadName: props.roadName,
    directionText: `${props.direction.charAt(0).toUpperCase() + props.direction.slice(1)} Traffic`,
    statusLabel: statusLabels[props.trafficStatus] || 'Unknown',
    trafficStatus: props.trafficStatus
  };
  
  setTimeout(() => {
    if (currentPopup.value) currentPopup.value.remove();
    
    const popupContent = popupTemplateRef.value.cloneNode(true);
    popupContent.classList.remove('hidden');
    
    currentPopup.value = new mapboxgl.Popup({ 
      closeButton: true,
      closeOnClick: true,
      maxWidth: '300px'
    })
      .setLngLat(lngLat)
      .setDOMContent(popupContent)
      .addTo(map.value);
  }, 0);
};

const createMap = (style, viewState = {}) => {
  const defaultView = {
    center: [120.5948, 16.4133],
    zoom: 16,
    bearing: 0,
    pitch: 0
  };
  
  const options = { ...defaultView, ...viewState };
  
  if (map.value) map.value.remove();
  
  map.value = new mapboxgl.Map({
    container: "map",
    style,
    ...options,
    transformRequest: (url, resourceType) => {
      if (['SpriteJSON', 'SpriteImage'].includes(resourceType)) {
        return { url: `${url}${url.includes('?') ? '&' : '?'}cachebust=${Date.now()}` };
      }
    }
  });

  map.value.addControl(new mapboxgl.NavigationControl(), "bottom-right");

  map.value.on("load", () => {
    loaded.value = true;
    updateMapData(props.roads, true);
  });
};

const setupLayerEvents = (layerId) => {
  map.value.on('click', layerId, (e) => {
    if (currentPopup.value) currentPopup.value.remove();
    showRoadPopup(e.features[0], e.lngLat);
  });
  
  map.value.on('mouseenter', layerId, () => map.value.getCanvas().style.cursor = 'pointer');
  map.value.on('mouseleave', layerId, () => map.value.getCanvas().style.cursor = '');
};

const drawRoute = (road, index) => {
  // Clean up existing layers for this road
  ['inbound', 'outbound'].forEach(direction => {
    const layerId = `route-${index}-${direction}`;
    const labelId = `label-${index}-${direction}`;
    
    [layerId, labelId].forEach(id => {
      if (map.value.getLayer(id)) map.value.removeLayer(id);
      if (map.value.getSource(id)) map.value.removeSource(id);
    });
  });

  // Draw routes for each direction
  ['inbound', 'outbound'].forEach(direction => {
    const coords = road.geometry?.coordinates?.[direction];
    if (!coords?.length) return;
    
    const color = props.colorMap[road[direction + 'Color']];
    const layerId = `route-${index}-${direction}`;
    const labelId = `label-${index}-${direction}`;
    
    // Add source
    map.value.addSource(layerId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {
          name: direction.charAt(0).toUpperCase() + direction.slice(1),
          roadId: road.properties.id,
          roadName: road.properties.name,
          trafficStatus: road[direction + 'Color'],
          direction
        },
        geometry: {
          type: 'LineString',
          coordinates: coords
        }
      }
    });

    // Add line layer
    map.value.addLayer({
      id: layerId,
      type: 'line',
      source: layerId,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': color, 'line-width': 4, 'line-opacity': 0.7 }
    });
    
    // Add events
    setupLayerEvents(layerId);

    // Add label layer
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

const getBounds = (roads) => {
  const bounds = new mapboxgl.LngLatBounds();
  roads.forEach(road => {
    ['inbound', 'outbound'].forEach(direction => {
      road.geometry?.coordinates?.[direction]?.forEach(coord => bounds.extend(coord));
    });
  });
  return bounds;
};

const updateMapData = (roads, initBounds = false) => {
  if (!loaded.value || !map.value) return;

  roads.forEach((road, index) => drawRoute(road, index));

  if (initBounds && !boundsInitialized.value) {
    const bounds = getBounds(roads);
    if (!bounds.isEmpty()) map.value.fitBounds(bounds, { padding: 60 });
    boundsInitialized.value = true;
  }
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

watch(() => props.mapStyle, (newStyle) => {
  if (!map.value || !loaded.value) return;
  
  // Store current view state before removing map
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

const focusOnRoad = (roadId) => {
  if (!loaded.value || !map.value) return;

  const selectedRoad = props.roads.find(r => r.properties.id.toString() === roadId.toString());
  if (!selectedRoad?.geometry?.coordinates) return;

  const bounds = new mapboxgl.LngLatBounds();
  ['inbound', 'outbound'].forEach(direction => {
    selectedRoad.geometry.coordinates[direction]?.forEach(coord => bounds.extend(coord));
  });

  if (!bounds.isEmpty()) {
    map.value.fitBounds(bounds, {
      padding: 100,
      duration: 1000,
      maxZoom: 17
    });
  }
};

onMounted(() => {
  mapboxgl.accessToken = props.apiKey;
  createMap(props.mapStyle);
});

defineExpose({ updateRoadColor, updateMapData, focusOnRoad });
</script>