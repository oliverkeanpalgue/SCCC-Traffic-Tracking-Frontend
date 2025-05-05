<template>
  <div v-if="activeIndex !== null"
    class="absolute text-white w-[500px] bg-[#1b1a1a] z-10 mt-[10px] left-[45%] p-4 rounded-xl">
    <div class="flex flex-col gap-4">
      <div class="relative">
        <!-- Intersection Name -->
        <div class="text-center">{{ activeIndex.properties.name }}</div>

        <!-- Close Button positioned at the top-right corner -->
        <CdChromeClose class="absolute top-1 right-2 text-white cursor-pointer" @click="closeEditModal" />
      </div>

      <div class="flex">
        <!-- Inbound Color Dropdown -->
        <div class="w-1/2">
          <div class="flex gap-4 items-center">
            <h1>Inbound</h1>
            <div class="flex items-center cursor-pointer relative" @click="toggleDropdown('inbound')">
              <div :style="{ backgroundColor: colorMap[activeIndex.inboundColor] }"
                class="w-[20px] h-[20px] rounded-xs"></div>

              <!-- Dropdown Menu -->
              <div v-if="activeDropdown === 'inbound'"
                class="absolute mt-2 bg-[#1b1a1a] p-2 rounded-lg top-full left-0 z-10">
                <div v-for="color in ['green', 'yellow', 'red']" :key="color"
                  class="p-2 cursor-pointer flex items-center gap-2"
                  @click="changeTrafficLevel(activeIndex.properties.id, 'inbound', color)">
                  <div class="w-[20px] h-[20px] rounded-xs" :style="{ backgroundColor: colorMap[color] }"></div>
                  <span class="text-white">{{ color.charAt(0).toUpperCase() + color.slice(1) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Outbound Color Dropdown -->
        <div class="w-1/2">
          <div class="flex gap-4 items-center">
            <h1>Outbound</h1>
            <div class="flex items-center cursor-pointer relative" @click="toggleDropdown('outbound')">
              <div :style="{ backgroundColor: colorMap[activeIndex.outboundColor] }"
                class="w-[20px] h-[20px] rounded-xs"></div>

              <!-- Dropdown Menu -->
              <div v-if="activeDropdown === 'outbound'"
                class="absolute mt-2 bg-[#1b1a1a] p-2 rounded-lg top-full left-0 z-10">
                <div v-for="color in ['green', 'yellow', 'red']" :key="color"
                  class="p-2 cursor-pointer flex items-center gap-2"
                  @click="changeTrafficLevel(activeIndex.properties.id, 'outbound', color)">
                  <div class="w-[20px] h-[20px] rounded-xs" :style="{ backgroundColor: colorMap[color] }"></div>
                  <span class="text-white">{{ color.charAt(0).toUpperCase() + color.slice(1) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { CdChromeClose } from '@kalimahapps/vue-icons';
import { ref, defineProps, defineEmits } from 'vue';

// Define the props for intersections, activeIndex, colorMap, and activeDropdown
const props = defineProps({
  intersections: Array,
  activeIndex: Object,
  colorMap: Object,
  activeDropdown: String,
});

// Define the emits
const emit = defineEmits(["toggleDropdown", "changeTrafficLevel", "closeEditModal"]);

// Reactive references for active dropdown and active index
const activeDropdown = ref(null);

// Function to toggle the dropdown (inbound or outbound)
const toggleDropdown = (direction) => {
  if (activeDropdown.value === direction) {
    activeDropdown.value = null;  // Close dropdown if clicked again
  } else {
    activeDropdown.value = direction;  // Open the respective dropdown
  }
};

// Function to change traffic level (inbound or outbound)
const changeTrafficLevel = (index, direction, level) => {
  emit('changeTrafficLevel', index, direction, level);  // Emit event to change traffic level
};

// Function to close the modal
const closeEditModal = () => {
  emit('closeEditModal');  // Emit close modal event
};
</script>
