<template>
  <div v-if="activeRoad"
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
              <h1>{{ capitalizeFirstLetter(direction) }}</h1>
              <div class="flex items-center cursor-pointer relative" @click.stop="toggleDropdown(direction)">
                <!-- Color indicator -->
                <div :style="{ backgroundColor: colorMap[activeRoad[direction + 'Color']] }"
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

// Component constants
const DIRECTIONS = ['inbound', 'outbound'];
const TRAFFIC_LABELS = { 'green': 'Light', 'yellow': 'Moderate', 'red': 'Heavy' };

// Component interface definition
defineProps({ 
  activeRoad: Object, 
  colorMap: Object 
});

const emit = defineEmits(["changeTrafficLevel", "closeEditModal"]);

// State management
const activeDropdown = ref(null);

// Helper methods
const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

// Toggle dropdown visibility with auto-close behavior
const toggleDropdown = (direction) => {
  activeDropdown.value = activeDropdown.value === direction ? null : direction;
};

// Update traffic level and close dropdown
const updateTrafficLevel = (roadId, direction, color) => {
  emit('changeTrafficLevel', roadId, direction, color);
  activeDropdown.value = null;
};

// Close modal by emitting event to parent
const closeEditModal = () => emit('closeEditModal');
</script>