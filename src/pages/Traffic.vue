<template>
    <div id="map-container">
      <div id="map"></div>
  
      <!-- Zoom Button -->
      <button id="zoomto" class="btn-control">Zoom to bounds</button>
  
      <!-- Color Dropdown -->
      <select v-model="lineColor" @change="updateLineColor" class="color-select">
        <option value="#00FF00">Green</option>
        <option value="#FFFF00">Yellow</option>
        <option value="#FF0000">Red</option>
      </select>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import maplibregl from 'maplibre-gl';
  import 'maplibre-gl/dist/maplibre-gl.css';
  
  export default {
    name: 'App',
    setup() {
      const map = ref(null);
      const lineColor = ref('#00FF00'); // default color
      const layerId = 'LineString';
  
      const geojson = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [
                [120.59480026728613, 16.413331339241026  ],
                [120.5957172105073 , 16.412427594163688 ],
                [120.59642867513713  , 16.411749638972623  ],
              ]
            }
          }
        ]
      };
  
      const updateLineColor = () => {
        if (map.value && map.value.getLayer(layerId)) {
          map.value.setPaintProperty(layerId, 'line-color', lineColor.value);
        }
      };
  
      onMounted(() => {
        map.value = new maplibregl.Map({
          container: 'map',
          style: 'https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL',
          center: [120.5960, 16.4023],
          zoom: 12
        });
  
        map.value.on('load', () => {
          map.value.addSource(layerId, {
            type: 'geojson',
            data: geojson
          });
  
          map.value.addLayer({
            id: layerId,
            type: 'line',
            source: layerId,
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': lineColor.value,
              'line-width': 5
            }
          });
  
          document.getElementById('zoomto').addEventListener('click', () => {
            const coordinates = geojson.features[0].geometry.coordinates;
            const bounds = coordinates.reduce(
              (bounds, coord) => bounds.extend(coord),
              new maplibregl.LngLatBounds(coordinates[0], coordinates[0])
            );
            map.value.fitBounds(bounds, { padding: 20 });
          });
  
          // Double-click listener
          map.value.on('dblclick', (e) => {
            const lng = e.lngLat.lng;
            const lat = e.lngLat.lat;
            alert(`Double clicked at:\nLongitude: ${lng}\nLatitude: ${lat}`);
          });
        });
      });
  
      return {
        lineColor,
        updateLineColor
      };
    }
  };
  </script>
  
  <style>
  html, body, #app, #map-container {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
  }
  
  #map {
    height: 100%;
    width: 100%;
  }
  
  .btn-control {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
    padding: 10px 20px;
    background-color: #3386c0;
    color: white;
    border: none;
    border-radius: 3px;
    cursor: pointer;
  }
  .btn-control:hover {
    background-color: #4ea0da;
  }
  
  .color-select {
    position: absolute;
    top: 70px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
    padding: 10px;
    border-radius: 3px;
    font-size: 14px;
  }
  </style>
  