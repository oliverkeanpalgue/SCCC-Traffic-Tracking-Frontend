<template>
  <div class="w-[23%] rounded-2xl p-1 font-montserrat relative">
    <!-- Search input -->
    <div class="mt-4 mb-7">
      <input v-model="searchTerm" placeholder="Search..."
        class="w-full p-3 rounded-2xl text-white bg-[#282828] placeholder-gray-400 border-[#494949]"
        @input="debouncedSearch" />
    </div>

    <!-- Loading indicator -->
    <div v-if="isLoading" class="text-center text-gray-400 py-4">Loading roads...</div>

    <!-- Roads list with transition group -->
    <div v-else ref="scrollContainer" class="text-white p-2 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-custom"
      :class="{ 'pr-2': showScrollbar }">

      <TransitionGroup 
        name="road-list" 
        tag="div"
      >
        <!-- Road items -->
        <div v-for="road in filteredRoads" 
          :key="road.id"
          v-memo="[road.id, road.road_name, road.inbound.status_id, road.outbound.status_id]"
          class="road-item p-2 rounded-md cursor-pointer hover:bg-[#303030]" 
          @click="handleRoadClick(road)"
        >

          <div class="flex justify-between mb-3">
            <div class="font-bold">{{ road.road_name }}</div>
            <FeEdit2 v-if="isLoggedIn" class="mt-1" />
            <FeInfo v-else class="mt-1" />
          </div>

          <!-- Traffic status indicators -->
          <div class="flex justify-between">
            <div class="flex items-center gap-2">
              <h1 class="text-[14px]">Inbound</h1>
              <div :style="{ backgroundColor: getStatusColor(road.inbound.status_id) }"
                class="w-[15px] h-[15px] rounded-xs" :aria-label="`Inbound traffic status`"></div>
            </div>
            <div class="flex items-center gap-2">
              <h1 class="text-[14px]">Outbound</h1>
              <div :style="{ backgroundColor: getStatusColor(road.outbound.status_id) }"
                class="w-[15px] h-[15px] rounded-xs" :aria-label="`Outbound traffic status`"></div>
            </div>
          </div>

          <hr class="bg-[#fff] opacity-30 mt-3 mb-4">
        </div>
      </TransitionGroup>

      <!-- Empty state -->
      <div v-if="!filteredRoads.length" class="text-center text-gray-400 py-4">No roads found</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useDatabaseStore } from '../../stores/databaseStore';
import { FeEdit2, FeInfo } from '@kalimahapps/vue-icons';

// Configuration
const DEBOUNCE_DELAY = 300;
const STATUS_COLORS = { 1: 'green', 2: 'yellow', 3: 'red' };

// Data retrieval
const props = defineProps({
  intersections: Array,
  colorMap: Object,
  isLoggedIn: Boolean
});

const emit = defineEmits(["openEditModal"]);

const databaseStore = useDatabaseStore();
const roads = computed(() => props.intersections || []);
const isLoading = computed(() => {
  // Only show loading on initial load, not during updates
  return databaseStore.isLoading && !roads.value?.length;
});

// Filter roads based on search
const filteredRoads = computed(() => {
  if (!roads.value?.length) return [];

  const term = searchTerm.value.trim().toLowerCase();
  if (!term) return roads.value;

  return roads.value.filter(road => {
    const roadName = (road.road_name || road.properties?.name || '').toLowerCase();
    return roadName.includes(term);
  });
});

// State management
const searchTerm = ref('');
const showScrollbar = ref(false);
const scrollContainer = ref(null);
const searchTimeout = ref(null);

// Data modification
// Update scrollbar state based on content
const updateScrollbarVisibility = async () => {
  await nextTick();
  if (scrollContainer.value) {
    const hasOverflow = scrollContainer.value.scrollHeight > scrollContainer.value.clientHeight;
    showScrollbar.value = hasOverflow;
  }
};

// Data removal
// Clean up event listeners and timers
const cleanupResources = () => {
  window.removeEventListener('resize', handleResize);
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
    searchTimeout.value = null;
  }
};

// Helper functions
// Get color for traffic status
const getStatusColor = (statusId) => {
  const colorName = STATUS_COLORS[statusId];
  return props.colorMap?.[colorName] || '#CCCCCC';
};

// Optimize resize handling
const handleResize = () => {
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(updateScrollbarVisibility);
  } else {
    updateScrollbarVisibility();
  }
};

// Event handlers
// Handle search input with debounce
const debouncedSearch = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
  searchTimeout.value = setTimeout(updateScrollbarVisibility, DEBOUNCE_DELAY);
};

// Send selected road to parent
const handleRoadClick = (road) => {
  if (road?.id) {
    emit("openEditModal", road);
  }
};

// Lifecycle
// Component initialization
onMounted(() => {
  updateScrollbarVisibility();
  window.addEventListener('resize', handleResize, { passive: true });
});

// Component cleanup
onUnmounted(() => {
  cleanupResources();
});

// Add a watcher to handle new road data smoothly
watch(
  () => props.intersections,
  (newIntersections) => {
    if (newIntersections?.length) {
      // Update without showing loading state
      nextTick(() => {
        updateScrollbarVisibility();
      });
    }
  },
  { deep: true }
);
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

/* Add these new animation styles */
.road-list-move,
.road-list-enter-active,
.road-list-leave-active {
  transition: all 0.5s ease;
}

.road-list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.road-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.road-list-leave-active {
  position: absolute;
}
</style>