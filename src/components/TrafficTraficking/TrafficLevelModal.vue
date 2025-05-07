<template>
  <div 
    v-if="activeRoad"
    class="fixed text-white w-[500px] bg-[#1b1a1a] z-[1000] top-[24px] left-[930px] -translate-x-1/2 p-5 rounded-xl"
    @click.stop
  >
    <div class="flex flex-col gap-4">
      <div class="relative">
        <!-- Road Name -->
        <div class="text-center">{{ activeRoad.properties.name }}</div>

        <!-- Close Button -->
        <CdChromeClose 
          class="absolute top-1 right-2 text-white cursor-pointer" 
          @click.stop="closeEditModal" 
        />
      </div>

      <div class="flex">
        <!-- Inbound Color Dropdown -->
        <div class="w-1/2">
          <div class="flex gap-4 items-center">
            <h1>Inbound</h1>
            <div class="flex items-center cursor-pointer relative" @click.stop="toggleDropdown('inbound')">
              <div :style="{ backgroundColor: colorMap[activeRoad.inboundColor] }"
                class="w-[20px] h-[20px] rounded-xs"></div>

              <!-- Dropdown Menu -->
              <div v-if="activeDropdown === 'inbound'"
                class="absolute mt-2 bg-[#1b1a1a] p-2 rounded-lg top-full left-0 z-[1001]">
                <div v-for="color in ['green', 'yellow', 'red']" :key="color"
                  class="p-2 cursor-pointer flex items-center gap-2"
                  @click.stop="changeTrafficLevel(activeRoad.properties.id, 'inbound', color)">
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
            <div class="flex items-center cursor-pointer relative" @click.stop="toggleDropdown('outbound')">
              <div :style="{ backgroundColor: colorMap[activeRoad.outboundColor] }"
                class="w-[20px] h-[20px] rounded-xs"></div>

              <!-- Dropdown Menu -->
              <div v-if="activeDropdown === 'outbound'"
                class="absolute mt-2 bg-[#1b1a1a] p-2 rounded-lg top-full left-0 z-[1001]">
                <div v-for="color in ['green', 'yellow', 'red']" :key="color"
                  class="p-2 cursor-pointer flex items-center gap-2"
                  @click.stop="changeTrafficLevel(activeRoad.properties.id, 'outbound', color)">
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

const props = defineProps({
  activeRoad: Object,
  colorMap: Object
});

const emit = defineEmits(["changeTrafficLevel", "closeEditModal"]);

const activeDropdown = ref(null);

const toggleDropdown = (direction) => {
  activeDropdown.value = activeDropdown.value === direction ? null : direction;
};

const changeTrafficLevel = (roadId, direction, color) => {
  emit('changeTrafficLevel', roadId, direction, color);
  activeDropdown.value = null;
};

const closeEditModal = () => {
  emit('closeEditModal');
};
</script>