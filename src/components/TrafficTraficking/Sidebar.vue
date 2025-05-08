<template>
  <div class="w-[20%] rounded-2xl p-1 font-montserrat">
    <!-- Search Bar -->
    <div class="mt-1 mb-7">
      <input placeholder="Search..."
        class="w-full p-3 rounded-2xl text-white bg-[#282828] placeholder-gray-400 border-[#494949]" />
    </div>

    <!-- Intersections (with scrolling if there are many) -->
    <div ref="el" class="text-white p-2 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-custom">
      <!-- Loop through intersections -->
      <div v-for="(intersection, i) in intersections" :key="intersection.properties.id">
        <div v-if="intersection && intersection.properties" class="flex justify-between gap-2 mb-3">
          <div class="font-bold">{{ intersection.properties.name }}</div>
          <FeEdit2 class="mt-1 cursor-pointer" @click="openEditModal(intersection.properties.id)" />
        </div>

        <!-- Traffic Colors -->
        <div v-if="intersection" class="flex justify-between">
          <div class="flex items-center gap-2">
            <h1 class="text-[14px]">Inbound</h1>
            <div :style="{ backgroundColor: colorMap[intersection.inboundColor] || '#7CFC00' }"
              class="w-[15px] h-[15px] rounded-xs"></div>
          </div>

          <div class="flex items-center gap-2">
            <h1 class="text-[14px]">Outbound</h1>
            <div :style="{ backgroundColor: colorMap[intersection.outboundColor] || '#FF6347' }"
              class="w-[15px] h-[15px] rounded-xs"></div>
          </div>
        </div>
        <hr class="bg-[#fff] opacity-30 mt-3 mb-4">
      </div>
    </div>
  </div>
</template>

<script setup>
import { FeEdit2 } from '@kalimahapps/vue-icons';
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  intersections: Array,
  colorMap: Object
});

const emit = defineEmits(["openEditModal"]);

// Emit the 'openEditModal' event with the index when the edit button is clicked
const openEditModal = (id) => {
  emit("openEditModal", id);  // Emit the ID of the intersection to the parent
};
</script>

<style scoped>
/* Custom scrollbar styles to make it thin and minimalistic */
.scrollbar-custom::-webkit-scrollbar {
  width: 5px; /* Thin scrollbar */
}

.scrollbar-custom::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-custom::-webkit-scrollbar-thumb {
  background: #333; /* Dark thumb color */
  border-radius: 10px;
}

.scrollbar-custom::-webkit-scrollbar-thumb:hover {
  background: #555; /* Darker thumb color when hovered */
}

.scrollbar-custom {
  -ms-overflow-style: none;  /* For Internet Explorer */
  scrollbar-width: thin;  /* For Firefox */
  scrollbar-color: #333 transparent; /* For Firefox */
}
</style>
