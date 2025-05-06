<template>
  <div class="w-[20%] rounded-2xl p-1 font-montserrat">
    <!-- Logo and Header -->
    <div class="flex justify-center items-center h-[80px]">
      <img src="/img/Logo.png" alt="Logo" class="w-[70px] h-full" />
      <h1 class="text-white font-bold text-lg text-center ml-4">Traffic Monitoring System</h1>
    </div>

    <!-- Search Bar -->
    <div class="mt-7">
      <input 
        v-model="searchTerm"
        @input="handleSearch"
        placeholder="Search intersections..."
        class="w-full p-3 rounded-2xl text-white bg-[#282828] placeholder-gray-400 border-[#494949] focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <!-- Intersections List -->
    <div 
      ref="scrollContainer"
      class="text-white p-2 overflow-y-auto max-h-[calc(100vh-220px)] scrollbar-custom"
      :class="{ 'pr-2': showScrollbar }"
    >
      <div 
        v-for="intersection in filteredIntersections" 
        :key="intersection.properties.id"
        class="intersection-item"
      >
        <div class="flex justify-between gap-2 mb-3">
          <div class="font-bold">{{ intersection.properties.name }}</div>
          <FeEdit2 
            class="mt-1 cursor-pointer text-gray-400 hover:text-white transition-colors" 
            @click="openEditModal(intersection.properties.id)" 
          />
        </div>
        
        <div class="flex justify-between">
          <div class="flex items-center gap-2">
            <h1 class="text-[14px]">Inbound</h1>
            <div 
              :style="{ backgroundColor: colorMap[intersection.inboundColor] || '#7CFC00' }"
              class="w-[15px] h-[15px] rounded-xs"
            ></div>
          </div>

          <div class="flex items-center gap-2">
            <h1 class="text-[14px]">Outbound</h1>
            <div 
              :style="{ backgroundColor: colorMap[intersection.outboundColor] || '#FF6347' }"
              class="w-[15px] h-[15px] rounded-xs"
            ></div>
          </div>
        </div>
        <hr class="border-t border-gray-600 mt-3 mb-4">
      </div>

      <div 
        v-if="filteredIntersections.length === 0" 
        class="text-center text-gray-400 py-4"
      >
        No intersections found
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { FeEdit2 } from '@kalimahapps/vue-icons';

const props = defineProps({
  intersections: {
    type: Array,
    default: () => []
  },
  colorMap: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(["openEditModal"]);

// Search functionality
const searchTerm = ref('');
const showScrollbar = ref(false);
const scrollContainer = ref(null);

// Check if scrollbar is needed
const checkScrollbar = () => {
  if (scrollContainer.value) {
    showScrollbar.value = scrollContainer.value.scrollHeight > scrollContainer.value.clientHeight;
  }
};

// Handle search with debounce
let searchTimeout = null;
const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    checkScrollbar();
  }, 300);
};

// Filter intersections based on search term
const filteredIntersections = computed(() => {
  if (!searchTerm.value.trim()) return props.intersections;
  
  const term = searchTerm.value.toLowerCase();
  return props.intersections.filter(intersection => 
    intersection.properties.name.toLowerCase().includes(term)
  );
});

// Open edit modal
const openEditModal = (id) => {
  emit("openEditModal", id);
};

// Handle resize and initial load
onMounted(() => {
  checkScrollbar();
  window.addEventListener('resize', checkScrollbar);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScrollbar);
});
</script>

<style scoped>
.scrollbar-custom {
  scrollbar-width: thin;
  scrollbar-color: #4a4a4a transparent;
}

.scrollbar-custom::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-custom::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

.scrollbar-custom::-webkit-scrollbar-thumb {
  background-color: #4a4a4a;
  border-radius: 3px;
}

.scrollbar-custom::-webkit-scrollbar-thumb:hover {
  background-color: #5a5a5a;
}

.intersection-item {
  transition: all 0.2s ease;
  padding: 8px;
  border-radius: 8px;
}

.intersection-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

input:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}
</style>