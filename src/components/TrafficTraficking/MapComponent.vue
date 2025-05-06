<!-- TrafficMap.vue -->
<template>
  <div id="map" class="w-full h-full rounded-xl relative" style="min-height: 300px; position: relative;"></div>
</template>

<script setup>
import { defineProps, onMounted, watch } from "vue";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const props = defineProps({
  intersections: Array,
  colorMap: Object,
  apiKey: String,
  activeIndex: Number
});

let map;

const drawRoute = (coords, routeName, lineColor, index, direction) => {
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
  const labelLayerId = `${layerId}-label`;

  // Cleanup existing layers
  if (map.getLayer(layerId)) map.removeLayer(layerId);
  if (map.getLayer(labelLayerId)) map.removeLayer(labelLayerId);
  if (map.getSource(sourceId)) map.removeSource(sourceId);

  // Add new source
  map.addSource(sourceId, { type: "geojson", data: routeGeoJson });

  // Calculate line width
  const zoom = map.getZoom();
  const lineWidth = Math.max(zoom * 0.2, 1);

  // Add route line
  map.addLayer({
    id: layerId,
    type: "line",
    source: sourceId,
    layout: { 
      "line-join": "round", 
      "line-cap": "round" 
    },
    paint: {
      "line-color": lineColor,
      "line-width": lineWidth
    }
  });

  // Add direction labels
  map.addLayer({
    id: labelLayerId,
    type: "symbol",
    source: sourceId,
    layout: {
      "symbol-placement": "line",
      "text-field": [
        "case",
        ["==", ["get", "direction"], "inbound"], "INBOUND",
        ["==", ["get", "direction"], "outbound"], "OUTBOUND",
        ""
      ],
      "text-font": ["Open Sans Bold"],
      "text-size": 12,
      "text-rotation-alignment": "map",
      "text-keep-upright": true
    },
    paint: {
      "text-color": "#FFFFFF",
      "text-halo-color": "#000000",
      "text-halo-width": 2
    }
  });
};

const updateMapBounds = () => {
  const bounds = new mapboxgl.LngLatBounds();
  props.intersections.forEach(feature => {
    feature.geometry.coordinates.inbound.forEach(coord => bounds.extend(coord));
    feature.geometry.coordinates.outbound.forEach(coord => bounds.extend(coord));
  });
  if (props.intersections.length > 0) map.fitBounds(bounds, { padding: 60 });
};

onMounted(() => {
  map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/dark-v11",
    center: [120.5948, 16.4133],
    zoom: 16,
    accessToken: props.apiKey,
  });

  map.addControl(new mapboxgl.NavigationControl(), "top-right");

  map.on("load", () => {
    props.intersections.forEach((feature, index) => {
      const inboundColor = props.colorMap[feature.inboundColor];
      const outboundColor = props.colorMap[feature.outboundColor];
      drawRoute(feature.geometry.coordinates.inbound, feature.properties.name, inboundColor, index, "inbound");
      drawRoute(feature.geometry.coordinates.outbound, feature.properties.name, outboundColor, index, "outbound");
    });
    updateMapBounds();
  });
});

watch(() => props.intersections, (newVal) => {
  if (map.isStyleLoaded()) {
    newVal.forEach((feature, index) => {
      const inboundColor = props.colorMap[feature.inboundColor];
      const outboundColor = props.colorMap[feature.outboundColor];
      drawRoute(feature.geometry.coordinates.inbound, feature.properties.name, inboundColor, index, "inbound");
      drawRoute(feature.geometry.coordinates.outbound, feature.properties.name, outboundColor, index, "outbound");
    });
    updateMapBounds();
  }
});

defineExpose({
  updateLineColor: (index, direction, color) => {
    const lineId = `route-line-${index}-${direction}`;
    if (map.getLayer(lineId)) {
      map.setPaintProperty(lineId, "line-color", color);
    }
  }
});
</script>