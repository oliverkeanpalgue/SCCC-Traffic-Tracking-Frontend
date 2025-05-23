<template>
  <div v-if="activeRoad && isLoggedIn"
    class="fixed text-white w-[500px] bg-[#1b1a1a] z-[1000] top-[102px] left-[930px] -translate-x-1/2 p-5 rounded-xl"
    @click.stop>
    <div class="flex flex-col gap-4">
      <!-- Header with road name and close button -->
      <div class="relative">
        <div class="text-center">{{ activeRoad.properties.name }}</div>
        <CdChromeClose class="absolute top-1 right-2 text-white cursor-pointer" @click.stop="closeEditModal" />
      </div>

      <!-- Traffic direction controls -->
      <div class="flex">
        <template v-for="direction in DIRECTIONS" :key="direction">
          <div class="w-1/2">
            <div class="flex gap-4 items-center">
              <h1>{{ formatDirectionName(direction) }}</h1>
              <div class="flex items-center cursor-pointer relative" @click.stop="toggleDropdown(direction)">
                <!-- Color indicator -->
                <div :style="{ backgroundColor: getTrafficStatusColor(direction) }"
                  class="w-[20px] h-[20px] rounded-xs"></div>

                <!-- Traffic level dropdown -->
                <div v-if="activeDropdown === direction"
                  class="absolute mt-2 bg-[#1b1a1a] p-2 rounded-lg top-full left-0 z-[1001]">
                  <div v-for="(label, color) in TRAFFIC_LABELS" :key="color"
                    class="p-2 cursor-pointer flex items-center gap-2"
                    @click.stop="updateTrafficLevel(activeRoad.properties.id, direction, color)">
                    <div :style="{ backgroundColor: colorMap[color] }" class="w-[20px] h-[20px] rounded-xs"></div>
                    <span class="text-white">{{ label }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { CdChromeClose } from '@kalimahapps/vue-icons';
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import useUserStore from '../../stores/user';

// Configuration
const DIRECTIONS = ['inbound', 'outbound'];
const TRAFFIC_LABELS = { 'green': 'Light', 'yellow': 'Moderate', 'red': 'Heavy' };

// Data retrieval
// Component props definition
const props = defineProps({ 
  activeRoad: Object, 
  colorMap: Object 
});

// Get traffic status color
const getTrafficStatusColor = (direction) => {
  if (!props.activeRoad || !props.colorMap) return '';
  return props.colorMap[props.activeRoad[direction + 'Color']] || '';
};

// Data modification
const emit = defineEmits(["changeTrafficLevel", "closeEditModal"]);

// State management
const activeDropdown = ref(null);

// Helper functions
// Format direction name
const formatDirectionName = (string) => string.charAt(0).toUpperCase() + string.slice(1);

// Event handlers
// Toggle dropdown visibility
const toggleDropdown = (direction) => {
  activeDropdown.value = activeDropdown.value === direction ? null : direction;
};

// Update traffic level
const updateTrafficLevel = (roadId, direction, color) => {
  emit('changeTrafficLevel', roadId, direction, color);
  activeDropdown.value = null;
};

// Close modal
const closeEditModal = () => emit('closeEditModal');

// Add user store integration
const userStore = useUserStore();
const { isLoggedIn } = storeToRefs(userStore);
</script>