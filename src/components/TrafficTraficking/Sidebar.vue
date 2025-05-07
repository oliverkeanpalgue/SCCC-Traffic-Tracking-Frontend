<template>
  <div class="w-[20%] rounded-2xl p-1 font-montserrat">
    <!-- Logo and Header -->
    <div class="flex justify-center items-center h-[80px]">
      <img src="/img/Logo.png" alt="Logo" class="w-[70px] h-full" />
      <h1 class="text-white font-bold text-lg text-center ml-4">Traffic Monitoring System</h1>
    </div>

    <!-- Search Bar -->
    <div class="mt-7 mb-7">
      <input v-model="searchTerm" placeholder="Search..."
        class="w-full p-3 rounded-2xl text-white bg-[#282828] placeholder-gray-400 border-[#494949]" />
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="text-center text-gray-400 py-4">
      Loading roads...
    </div>

    <!-- Roads List -->
    <div ref="scrollContainer" class="text-white p-2 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-custom"
      :class="{ 'pr-2': showScrollbar }">
      <!-- Loop through filtered roads -->
      <div v-for="road in filteredRoads" :key="road.id">
        <div class="flex justify-between mb-3">
          <div class="font-bold">{{ road.road_name }}</div>
          <FeEdit2 
            class="mt-1 cursor-pointer" 
            @click.stop="openEditModal(road)" 
          />
        </div>

        <!-- Traffic Colors -->
        <div class="flex justify-between">
          <div class="flex items-center gap-2">
            <h1 class="text-[14px]">Inbound</h1>
            <div :style="{ backgroundColor: getStatusColor(road.inbound.status_id) }"
              class="w-[15px] h-[15px] rounded-xs">
            </div>
          </div>
          <div class="flex items-center gap-2">
            <h1 class="text-[14px]">Outbound</h1>
            <div :style="{ backgroundColor: getStatusColor(road.outbound.status_id) }"
              class="w-[15px] h-[15px] rounded-xs">
            </div>
          </div>
        </div>
        <hr class="bg-[#fff] opacity-30 mt-3 mb-4">
      </div>

      <!-- Empty state -->
      <div v-if="!isLoading && filteredRoads.length === 0" class="text-center text-gray-400 py-4">
        No roads found
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useDatabaseStore } from '../../stores/databaseStore';
import { FeEdit2 } from '@kalimahapps/vue-icons';

const databaseStore = useDatabaseStore();
const roads = computed(() => databaseStore.roads);
const isLoading = computed(() => databaseStore.isLoading);
const searchTerm = ref('');
const showScrollbar = ref(false);
const scrollContainer = ref(null);

// Traffic status mapping
const trafficStatus = {
  1: { color: '#7CFC00' }, // green
  2: { color: '#FFFF00' }, // yellow
  3: { color: '#FF0000' }  // red
};

const getStatusColor = (statusId) => {
  return trafficStatus[statusId]?.color || '#CCCCCC';
};

// Filter roads based on search term
const filteredRoads = computed(() => {
  if (!roads.value) return [];
  const term = searchTerm.value.toLowerCase();
  return roads.value.filter(road =>
    road.road_name.toLowerCase().includes(term)
  );
});

const checkScrollbar = () => {
  if (scrollContainer.value) {
    showScrollbar.value =
      scrollContainer.value.scrollHeight > scrollContainer.value.clientHeight;
  }
};

onMounted(() => {
  checkScrollbar();
});

const emit = defineEmits(["openEditModal"]);

const openEditModal = (road) => {
  console.log("Opening modal for road:", road);
  emit("openEditModal", road);
};
</script>

<style scoped>
/* Your existing styles remain the same */
.scrollbar-custom::-webkit-scrollbar {
  width: 5px;
}

.scrollbar-custom::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-custom::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 10px;
}

.scrollbar-custom::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.scrollbar-custom {
  -ms-overflow-style: none;
  scrollbar-width: thin;
  scrollbar-color: #333 transparent;
}
</style>