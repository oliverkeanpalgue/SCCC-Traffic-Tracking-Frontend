<template>
  <div class="w-[23%] rounded-2xl p-1 font-montserrat">
    <!-- Logo and Header -->
    <div class="flex justify-center items-center h-[80px]">
      <img src="/img/Logo.png" alt="Logo" class="w-[70px] h-full" />
      <h1 class="text-white font-bold text-lg text-center ml-4">Traffic Monitoring System</h1>
    </div>

    <!-- Search Bar -->
    <div class="mt-7 mb-7">
      <input v-model="searchTerm" placeholder="Search..."
        class="w-full p-3 rounded-2xl text-white bg-[#282828] placeholder-gray-400 border-[#494949]"
        @input="debouncedSearch" />
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="text-center text-gray-400 py-4">
      Loading roads...
    </div>

    <!-- Roads List -->
    <div ref="scrollContainer" class="text-white p-2 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-custom"
      :class="{ 'pr-2': showScrollbar }">
      <!-- Loop through filtered roads -->
      <div v-for="road in filteredRoads" :key="road.id"
        v-memo="[road.id, road.inbound.status_id, road.outbound.status_id]"
        class="road-item p-2 rounded-md cursor-pointer transition-all duration-200 hover:bg-[#303030]"
        @click="openEditModal(road)">
        <div class="flex justify-between mb-3">
          <div class="font-bold">{{ road.road_name }}</div>
          <FeEdit2 class="mt-1" />
        </div>

        <!-- Traffic Colors -->
        <div class="flex justify-between">
          <div class="flex items-center gap-2">
            <h1 class="text-[14px]">Inbound</h1>
            <div :style="{ backgroundColor: getStatusColor(road.inbound.status_id) }"
              class="w-[15px] h-[15px] rounded-xs" aria-label="Inbound traffic status"></div>
          </div>
          <div class="flex items-center gap-2">
            <h1 class="text-[14px]">Outbound</h1>
            <div :style="{ backgroundColor: getStatusColor(road.outbound.status_id) }"
              class="w-[15px] h-[15px] rounded-xs" aria-label="Outbound traffic status"></div>
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
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useDatabaseStore } from '../../stores/databaseStore';
import { FeEdit2 } from '@kalimahapps/vue-icons';

// Use the same color mapping that parent component uses
const props = defineProps({
  intersections: Array,
  colorMap: Object // Use the parent's color mapping consistently
});

const databaseStore = useDatabaseStore();
const roads = computed(() => props.intersections || []);
const isLoading = computed(() => databaseStore.isLoading);
const searchTerm = ref('');
const showScrollbar = ref(false);
const scrollContainer = ref(null);
const searchTimeout = ref(null);

// Force component refresh when database changes
const forceUpdate = ref(0);

// Get color based on traffic status ID - use the provided colorMap
const getStatusColor = (statusId) => {
  // Map status ID to color name, then get the hex color
  const colorName = { 1: 'green', 2: 'yellow', 3: 'red' }[statusId];
  return props.colorMap?.[colorName] || '#CCCCCC';
};

// Filter roads based on search term with real-time updates from database
const filteredRoads = computed(() => {
  // Include forceUpdate to trigger reevaluation
  forceUpdate.value;
  
  if (!roads.value?.length) return [];

  const term = searchTerm.value.trim().toLowerCase();
  if (!term) return roads.value;

  return roads.value.filter(road =>
    (road.road_name || road.properties?.name || '').toLowerCase().includes(term)
  );
});

// Use a more efficient debouncing technique
const debouncedSearch = () => {
  if (searchTimeout.value) clearTimeout(searchTimeout.value);
  searchTimeout.value = setTimeout(checkScrollbar, 300);
};

// Optimize scrollbar check
const checkScrollbar = async () => {
  await nextTick();
  if (scrollContainer.value) {
    showScrollbar.value = scrollContainer.value.scrollHeight > scrollContainer.value.clientHeight;
  }
};

// Handle window resize events with optimization
const handleResize = () => {
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(checkScrollbar);
  } else {
    checkScrollbar();
  }
};

// Watch database store road changes to trigger UI updates
watch(() => databaseStore.roads, () => {
  forceUpdate.value++;
  nextTick(checkScrollbar);
}, { deep: true });

// Direct reactive watch on the intersections prop for immediate updates
watch(() => props.intersections, (newVal) => {
  forceUpdate.value++;
  nextTick(checkScrollbar);
}, { deep: true, immediate: true });

// Watch for specific traffic status changes to ensure real-time updates
watch(() => props.intersections?.map(road => 
  [road.id, road.inbound?.status_id, road.outbound?.status_id].join('|')
), () => {
  forceUpdate.value++;
  nextTick(checkScrollbar);
}, { immediate: true });

onMounted(() => {
  checkScrollbar();
  window.addEventListener('resize', handleResize, { passive: true });
  
  // Initial force update to ensure data consistency
  forceUpdate.value++;
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (searchTimeout.value) clearTimeout(searchTimeout.value);
});

const emit = defineEmits(["openEditModal"]);

// Handle road edit request
const openEditModal = (road) => {
  if (!road?.id) return;
  emit("openEditModal", road);
};
</script>

<style scoped>
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

.road-item {
  position: relative;
  overflow: hidden;
  transition: background-color 0.2s ease, border-left 0.2s ease;
}

.road-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 0;
  background-color: rgba(255, 255, 255, 0.05);
  transition: height 0.2s ease;
}

.road-item:hover::before {
  height: 100%;
}

.road-item.active {
  background-color: rgba(255, 255, 255, 0.1);
  border-left: 3px solid #7CFC00;
}
</style>