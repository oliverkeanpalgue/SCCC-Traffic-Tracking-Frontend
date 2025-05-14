<template>
  <div class="w-[23%] rounded-2xl p-1 font-montserrat">
    <!-- Search input -->
    <div class="mt-4 mb-7">
      <input v-model="searchTerm" placeholder="Search..."
        class="w-full p-3 rounded-2xl text-white bg-[#282828] placeholder-gray-400 border-[#494949]"
        @input="debouncedSearch" />
    </div>

    <!-- Loading indicator -->
    <div v-if="isLoading" class="text-center text-gray-400 py-4">Loading roads...</div>

    <!-- Roads list -->
    <div v-else ref="scrollContainer" 
      class="text-white p-2 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-custom"
      :class="{ 'pr-2': showScrollbar }">
      
      <!-- Road items -->
      <div v-for="road in filteredRoads" :key="road.id"
        v-memo="[road.id, road.inbound.status_id, road.outbound.status_id]"
        class="road-item p-2 rounded-md cursor-pointer hover:bg-[#303030]"
        @click="openEditModal(road)">
        
        <div class="flex justify-between mb-3">
          <div class="font-bold">{{ road.road_name }}</div>
          <FeEdit2 class="mt-1" />
        </div>

        <!-- Traffic status indicators -->
        <div class="flex justify-between">
          <div class="flex items-center gap-2">
            <h1 class="text-[14px]">Inbound</h1>
            <div :style="{ backgroundColor: getStatusColor(road.inbound.status_id) }" 
              class="w-[15px] h-[15px] rounded-xs"
              :aria-label="`Inbound traffic status`"></div>
          </div>
          <div class="flex items-center gap-2">
            <h1 class="text-[14px]">Outbound</h1>
            <div :style="{ backgroundColor: getStatusColor(road.outbound.status_id) }" 
              class="w-[15px] h-[15px] rounded-xs"
              :aria-label="`Outbound traffic status`"></div>
          </div>
        </div>
        
        <hr class="bg-[#fff] opacity-30 mt-3 mb-4">
      </div>

      <!-- Empty state -->
      <div v-if="!filteredRoads.length" class="text-center text-gray-400 py-4">No roads found</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useDatabaseStore } from '../../stores/databaseStore';
import { FeEdit2 } from '@kalimahapps/vue-icons';

// Props and store setup
const props = defineProps({
  intersections: Array,
  colorMap: Object
});

// Helper function to get status color
const getStatusColor = (statusId) => {
  const colorName = { 1: 'green', 2: 'yellow', 3: 'red' }[statusId];
  return props.colorMap?.[colorName] || '#CCCCCC';
};

// Core state management
const databaseStore = useDatabaseStore();
const roads = computed(() => props.intersections || []);
const isLoading = computed(() => databaseStore.isLoading);
const searchTerm = ref('');
const showScrollbar = ref(false);
const scrollContainer = ref(null);
const searchTimeout = ref(null);
const forceUpdate = ref(0); // Trigger reactive updates

// Filter roads based on search term
const filteredRoads = computed(() => {
  forceUpdate.value; // Include to trigger reevaluation
  if (!roads.value?.length) return [];
  
  const term = searchTerm.value.trim().toLowerCase();
  return term 
    ? roads.value.filter(road => (road.road_name || road.properties?.name || '').toLowerCase().includes(term))
    : roads.value;
});

// Efficient DOM updates
const debouncedSearch = () => {
  clearTimeout(searchTimeout.value);
  searchTimeout.value = setTimeout(checkScrollbar, 300);
};

// Update scrollbar visibility
const checkScrollbar = async () => {
  await nextTick();
  if (scrollContainer.value) {
    showScrollbar.value = scrollContainer.value.scrollHeight > scrollContainer.value.clientHeight;
  }
};

// Optimize resize handler with requestAnimationFrame
const handleResize = () => requestAnimationFrame?.(checkScrollbar) || checkScrollbar();

// Track data changes to trigger UI updates
watch(() => databaseStore.roads, () => {
  forceUpdate.value++;
  nextTick(checkScrollbar);
}, { deep: true });

watch(() => props.intersections, () => {
  forceUpdate.value++;
  nextTick(checkScrollbar);
}, { deep: true, immediate: true });

// Optimize component lifecycle
onMounted(() => {
  checkScrollbar();
  window.addEventListener('resize', handleResize, { passive: true });
  forceUpdate.value++; 
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  clearTimeout(searchTimeout.value);
});

// Expose methods to parent
const emit = defineEmits(["openEditModal"]);
const openEditModal = (road) => road?.id && emit("openEditModal", road);
</script>

<style scoped>
.scrollbar-custom::-webkit-scrollbar { width: 5px; }
.scrollbar-custom::-webkit-scrollbar-track { background: transparent; }
.scrollbar-custom::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
.scrollbar-custom::-webkit-scrollbar-thumb:hover { background: #555; }
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

.road-item:hover::before { height: 100%; }
.road-item.active {
  background-color: rgba(255, 255, 255, 0.1);
  border-left: 3px solid #7CFC00;
}
</style>