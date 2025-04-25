<script setup>

import { ref, computed, onMounted, onUnmounted } from "vue";
import useUserStore from "../stores/user.js";
import axiosClient from "../axios.js";
import { FeLogOut } from '@kalimahapps/vue-icons';
import { ClCloseMd } from '@kalimahapps/vue-icons';
import { MdDashboard } from '@kalimahapps/vue-icons';
import { MdInventory2 } from '@kalimahapps/vue-icons';
import { MdRoundCategory } from '@kalimahapps/vue-icons';
import { FlFilledPeopleSwap } from '@kalimahapps/vue-icons';
import { FaUserGear } from '@kalimahapps/vue-icons';
import { BxSolidBuildings } from '@kalimahapps/vue-icons';
import lightBlueBg from "../assets/lightBlueBg.jpg";
import darkBlueBg from "../assets/darkBlueBg.jpg";
import { MdRoundDarkMode } from '@kalimahapps/vue-icons';
import { MdRoundLightMode } from '@kalimahapps/vue-icons';
import { HuExchangeHorizontal } from '@kalimahapps/vue-icons';
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import intersections from "../data/coordinates.json";
import { MagnifyingGlassIcon } from "@heroicons/vue/24/solid";

const theme = ref(localStorage.getItem("theme") || "light");

const signout_visible = ref(false);

const sidebarVisible = ref(false);

const toggleTheme = () => {
  if (theme.value === "light") {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
    theme.value = "dark";
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
    theme.value = "light";
  }
};

const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value;
}

const closeSidebar = () => {
  sidebarVisible.value = false;
};

onMounted(() => {
  if (localStorage.getItem("theme") === "dark") {
    document.documentElement.classList.add("dark");
    theme.value = "dark";
  }
  document.addEventListener('click', handleClickOutside);
});

const userStore = useUserStore();
const user = computed(() => userStore.user);
const inventoryAccess = computed(() => userStore.inventoryAccess);

function logout() {
  axiosClient.post('/logout').then(() => {
    window.location.reload();
  });
}

const profileSettingsDropdownOpen = ref(false)
const profileSettingsDropdownButtonRef = ref(null)

const toggleProfileSettingsDropdown = () => {
  profileSettingsDropdownOpen.value = !profileSettingsDropdownOpen.value
}
const toggleButtonRef = ref(null);
const sidebarRef = ref(null);

// Custom composition function to handle click outside
const handleClickOutside = (event) => {
  console.log("clicked outside");
  if (
    profileSettingsDropdownButtonRef.value &&
    !profileSettingsDropdownButtonRef.value.contains(event.target)
  ) {
    profileSettingsDropdownOpen.value = false;
  }
  if (
    sidebarVisible.value &&
    sidebarRef.value &&
    toggleButtonRef.value &&
    !sidebarRef.value.contains(event.target) &&
    !toggleButtonRef.value.contains(event.target)
  ) {
    sidebarVisible.value = false;
  }
};

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const openSignOutModal = () => {
  signout_visible.value = true;
};

const closeSignOutModal = () => {
  signout_visible.value = false;
};

const inboundColors = ref([]);
const outboundColors = ref([]);
let map;
const bgColorMap = {
  green: "#3b7e20",   // darker green
  yellow: "#b29500",  // muted yellow
  red: "#a23b3b",     // deep red
};
const colorMap = {
  green: "#7CFC00",   // light green
  yellow: "#FFD700",  // soft golden yellow
  red: "#FF6347",     // soft red (tomato)
};

onMounted(() => {
  inboundColors.value = intersections.map(() => "green");
  outboundColors.value = intersections.map(() => "green");

  map = new maplibregl.Map({
    container: "map",
    style: "https://api.maptiler.com/maps/dataviz-dark/style.json?key=XC9Lfduc1EhOtbZ45kzl",
    center: [120.59570512741732, 16.413332058081494],
    zoom: 18,
  });

  map.addControl(new maplibregl.NavigationControl(), "top-right");

  map.on("load", () => {
    intersections.forEach((intersection, index) => {
      ["inbound", "outbound"].forEach((dir) => {
        const layerId = `line-${index}-${dir}`;
        const glowId = `${layerId}-glow`;
        const labelId = `${layerId}-label`;
        const sourceId = `source-${index}-${dir}`;
        const coords = intersection[dir];
        const trafficLevel = dir === "inbound" ? inboundColors.value[index] : outboundColors.value[index];
        const color = colorMap[trafficLevel];

        map.addSource(sourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: coords,
            },
          },
        });

        // Glowing outer line
        map.addLayer({
          id: glowId,
          type: "line",
          source: sourceId,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": color,
            "line-width": [
              "interpolate", ["linear"], ["zoom"],
              12, 6,
              14, 12,
              16, 16,
              18, 28
            ],
            "line-blur": 7,
            "line-opacity": 0.3
          }
        });

        // Bright center line
        map.addLayer({
          id: layerId,
          type: "line",
          source: sourceId,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": color,
            "line-width": [
              "interpolate", ["linear"], ["zoom"],
              12, 2,
              14, 4,
              16, 6,
              18, 8
            ]
          }
        });

        // Direction label with arrows
        map.addLayer({
          id: labelId,
          type: "symbol",
          source: sourceId,
          layout: {
            "symbol-placement": "line",
            "text-field": dir === "inbound" ? "<<<" : ">>>",
            "text-font": ["Open Sans Bold"],
            "text-size": 14,
            "text-rotation-alignment": "map",
            "text-keep-upright": true,
          },
          paint: {
            "text-color": "#000",
            "text-halo-color": color,
            "text-halo-width": 1,
          }
        });
      });
    });
  });
});

function setTrafficLevel(index, direction, level) {
  if (direction === "inbound") {
    inboundColors.value[index] = level;
  } else {
    outboundColors.value[index] = level;
  }

  const color = colorMap[level];
  updateLineColor(index, direction, color);
}

function updateLineColor(index, dir, color) {
  const lineId = `line-${index}-${dir}`;
  const glowId = `${lineId}-glow`;
  const labelId = `${lineId}-label`;

  if (map.getLayer(lineId)) {
    map.setPaintProperty(lineId, "line-color", color);
  }
  if (map.getLayer(glowId)) {
    map.setPaintProperty(glowId, "line-color", color);
  }
  if (map.getLayer(labelId)) {
    map.setPaintProperty(labelId, "text-halo-color", color);
  }
}

</script>

<template>
  <div
    class="bg-cover bg-center min-h-screen bg-[#1b1a1a]">

    <aside id="logo-sidebar" ref="sidebarRef"
      class="fixed top-0 left-0 w-[20%] h-screen pt-4 pl-3 xl:pt-4 transition-transform z-100 xl:z-5 backdrop-blur-lg xl:translate-x-0"
      :class="sidebarVisible ? 'translate-x-0' : '-translate-x-full'" aria-label="Sidebar">
      <div class="h-full px-3 pb-4 overflow-y-auto flex flex-col justify-between">

        <!-- Sidebar -->
        <div class="rounded-2xl p-1">
          <!-- Logo and Header -->
          <div class="flex flex-row w-full justify-center h-[80px]">
            <div class="w-[70px] h-full">
              <img src="/img/Logo.png" alt="Logo" class="h-full w-full" />
            </div>
            <div class="flex items-center justify-center w-[200px]">
              <h1 class="text-white text-center font-bold text-lg">Traffic Monitoring System</h1>
            </div>
          </div>

          <!-- Search Bar -->
          <div class="w-full mt-7 mb-7 relative">
            <input placeholder="Search..."
              class="placeholder-gray-400 text-white bg-[#282828] w-full p-3 pr-10 rounded-2xl border border-[#494949]"
              style="font-family: 'Montserrat', sans-serif; font-weight: 100; font-size: 15px;" />
            <MagnifyingGlassIcon class="h-5 w-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
          </div>

          <!-- Intersections -->
          <div class="mx-4 flex flex-col gap-6">
            <div v-for="(intersection, i) in intersections" :key="i">
              <div>
                <h2 class="font-bold text-start text-md mb-2 text-white" style="font-family: 'Montserrat', sans-serif;">
                  {{ intersection.name.trim() }}
                </h2>
              </div>

              <!-- Inbound -->
              <div class="text-center mb-2 flex flex-row w-full">
                <div class="w-1/2 flex justify-center">
                  <p class="mb-1 text-sm font-medium text-gray-300 content-center"
                    style="font-family: 'Montserrat', sans-serif;">
                    Inbound
                  </p>
                </div>
                <div class="w-1/2">
                  <select v-model="inboundColors[i]" @change="setTrafficLevel(i, 'inbound', inboundColors[i])"
                    :style="{ backgroundColor: bgColorMap[inboundColors[i]], fontFamily: 'Montserrat, sans-serif' }"
                    class="w-full p-2 rounded-lg text-white text-sm">
                    <option value="green">Light</option>
                    <option value="yellow">Moderate</option>
                    <option value="red">Heavy</option>
                  </select>
                </div>
              </div>

              <!-- Outbound -->
              <div class="text-center">
                <div class="flex flex-row w-full">
                  <div class="w-1/2 flex justify-center">
                    <p class="mb-1 text-sm font-medium text-gray-300 content-center"
                      style="font-family: 'Montserrat', sans-serif;">
                      Outbound
                    </p>
                  </div>
                  <div class="w-1/2">
                    <select v-model="outboundColors[i]" @change="setTrafficLevel(i, 'outbound', outboundColors[i])"
                      :style="{ backgroundColor: bgColorMap[outboundColors[i]], fontFamily: 'Montserrat, sans-serif' }"
                      class="w-full p-2 rounded-lg text-white text-sm">
                      <option value="green">Light</option>
                      <option value="yellow">Moderate</option>
                      <option value="red">Heavy</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div class="w-full font-medium">
          <div class="profile-div profile-div-not-active group">
            <button class="profile-button profile-button-not-active">
              <span class="profile-icon-span profile-icon-span-not-active">
                <FaUserGear class="icon-6" />
              </span>
              <span class="profile-title-span profile-title-span-not-active">
                {{ user.firstName }}
              </span>
            </button>
          </div>

          <!-- <div @click="toggleTheme" class="profile-div profile-div-not-active group">
            <button class="profile-button profile-button-not-active">
              <span class="profile-icon-span profile-icon-span-not-active">
                <MdRoundLightMode v-if="theme === 'light'" class="icon-6" />
                <MdRoundDarkMode v-else class="icon-6" />
              </span>
              <span v-if="theme === 'light'" class="profile-title-span profile-title-span-not-active">Light Mode</span>
              <span v-else class="profile-title-span profile-title-span-not-active">Dark Mode</span>
            </button>
          </div> -->

          <div @click="openSignOutModal()" class="profile-div profile-div-not-active group">
            <button class="profile-button profile-button-not-active">
              <span class="profile-icon-span profile-icon-span-not-active">
                <FeLogOut class="icon-6" />
              </span>
              <span class="profile-title-span profile-title-span-not-active">
                Sign Out
              </span>
            </button>
          </div>
        </div>
      </div>
    </aside>

    <nav class="fixed top-3 w-full z-55 ">
      <div class="px-3 py-3 xl:px-5 xl:pl-3">
        <div class="flex items-center xl:pl-64 justify-between">
          <div class="flex items-center ml-8 justify-start rtl:justify-end">
            <button @click="toggleSidebar" aria-controls="logo-sidebar" type="button" ref="toggleButtonRef"
              class="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg border xl:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600 border-blue-500 dark:border-gray-600">
              <span class="sr-only">Open sidebar</span>
              <svg class="icon-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg">
                <path clip-rule="evenodd" fill-rule="evenodd"
                  d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z">
                </path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="min-h-[100vh] max-h-[100vh] px-4 pl-8 xl:pl-4 xl:ml-64 dark:text-gray-200">
      <!-- MAIN CONTENT -->
      <router-view class="" />

      <!-- SIGN OUT modal -->
      <div v-show="signout_visible" class="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
        <div class="relative p-4 w-full max-w-md">
          <div
            class="relative bg-white rounded-lg shadow-sm border-2 border-gray-700 dark:bg-gray-800 dark:border-gray-500">
            <button type="button"
              class="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
              @click="closeSignOutModal()">
              <ClCloseMd class="icon-6" aria-hidden="true" />
            </button>
            <div class="p-4 md:p-5 text-center">
              <div class="flex mb-5 w-full items-center justify-center ">
                <FeLogOut class="w-10 h-10 " />
              </div>
              <h3 class="mb-6 text-lg font-normal text-gray-800 dark:text-gray-200">Are you sure you want
                to sign out?</h3>
              <button @click="logout" type="button"
                class="text-white bg-red-700 hover:bg-red-500 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">
                Yes, Sign Out
              </button>
              <button @click="closeSignOutModal()" type="button"
                class="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-400 hover:bg-green-500 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                No, Cancel
              </button>
            </div>
          </div>
        </div>
      </div>


    </div>
  </div>
</template>