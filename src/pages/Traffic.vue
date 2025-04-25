<template>
  <div class="flex flex-row p-3 gap-2 h-[740px] bg-[#1b1a1a]" style="font-family: 'Montserrat', sans-serif;">
    <!-- Map -->
    <div class="w-[100%]">
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

</script>
