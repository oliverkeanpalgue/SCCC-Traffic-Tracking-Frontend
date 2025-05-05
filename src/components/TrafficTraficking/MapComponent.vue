<template>
  <div id="map" class="w-[80%] h-full rounded-xl"></div>
  <div class="absolute text-white w-[150px] bg-[#1b1a1a] mt-[6px] ml-[320px] p-4 rounded-xl">
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
</template>

<script setup>
import mapboxgl from "mapbox-gl";
import { defineProps, onMounted, watch, ref } from "vue";

const props = defineProps({
  intersections: Array,
  colorMap: Object,
  API_KEY: String
});

let map;
const isMapReady = ref(false);

const drawRoute = (coords, routeName, lineColor, index, direction) => {
  if (!map) return;

  const routeGeoJson = {
    type: "FeatureCollection",
    features: [{
      type: "Feature",
      geometry: { type: "LineString", coordinates: coords },
      properties: { name: routeName, direction }
    }]
  };

  const sourceId = `route-source-${index}-${direction}`;
  const layerId = `route-line-${index}-${direction}`;

  if (map.getLayer(layerId)) map.removeLayer(layerId);
  if (map.getSource(sourceId)) map.removeSource(sourceId);

  map.addSource(sourceId, { type: "geojson", data: routeGeoJson });

  const lineWidth = Math.max(map.getZoom() * 0.2, 1);

  map.addLayer({
    id: layerId,
    type: "line",
    source: sourceId,
    layout: { "line-join": "round", "line-cap": "round" },
    paint: {
      "line-color": lineColor,
      "line-width": lineWidth
    }
  });
};

watch(() => props.intersections, (newIntersections) => {
  if (!isMapReady.value) return;

  newIntersections.forEach((feature, index) => {
    const inboundColor = props.colorMap[feature.inboundColor];
    const outboundColor = props.colorMap[feature.outboundColor];
    drawRoute(feature.geometry.coordinates.inbound, feature.properties.name, inboundColor, index, "inbound");
    drawRoute(feature.geometry.coordinates.outbound, feature.properties.name, outboundColor, index, "outbound");
  });
}, { immediate: true });

onMounted(() => {
  map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/dark-v11",
    center: [120.5948, 16.4133],
    zoom: 16,
    accessToken: props.API_KEY,
  });

  map.addControl(new mapboxgl.NavigationControl(), "top-right");

  map.on("load", () => {
    isMapReady.value = true;
    props.intersections.forEach((feature, index) => {
      const inboundColor = props.colorMap[feature.inboundColor];
      const outboundColor = props.colorMap[feature.outboundColor];
      drawRoute(feature.geometry.coordinates.inbound, feature.properties.name, inboundColor, index, "inbound");
      drawRoute(feature.geometry.coordinates.outbound, feature.properties.name, outboundColor, index, "outbound");
    });
  });
});

const updateMap = () => {
  props.intersections.forEach((feature, index) => {
    const inboundColor = props.colorMap[feature.inboundColor];
    const outboundColor = props.colorMap[feature.outboundColor];
    drawRoute(feature.geometry.coordinates.inbound, feature.properties.name, inboundColor, index, "inbound");
    drawRoute(feature.geometry.coordinates.outbound, feature.properties.name, outboundColor, index, "outbound");
  });
};

defineExpose({ updateMap });
</script>
