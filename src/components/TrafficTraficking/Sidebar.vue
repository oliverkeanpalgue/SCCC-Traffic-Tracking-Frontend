
<template>
  <div class="w-[20%] rounded-2xl p-1 font-montserrat">
    <!-- Logo and Header -->
    <div class="flex justify-center items-center h-[80px]">
      <img src="/img/Logo.png" alt="Logo" class="w-[70px] h-full" />
      <h1 class="text-white font-bold text-lg text-center ml-4">Traffic Monitoring System</h1>
    </div>

    <!-- Search Bar -->
    <div class="mt-7 mb-7">
      <input 
        v-model="searchTerm"
        placeholder="Search..."
        class="w-full p-3 rounded-2xl text-white bg-[#282828] placeholder-gray-400 border-[#494949]"
      />
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="text-center text-gray-400 py-4">
      Loading intersections...
    </div>

    <!-- Intersections List -->
    <div 
      ref="scrollContainer" 
      class="text-white p-2 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-custom"
      :class="{ 'pr-2': showScrollbar }"
    >
      <!-- Loop through filtered intersections -->
      <div v-for="intersection in filteredIntersections" :key="intersection.id">
        <div class="flex justify-between mb-3">
          <div class="font-bold">{{ intersection.road_name }}</div>
          <FeEdit2 class="mt-1 cursor-pointer" @click="openEditModal(intersection.id)" />
        </div>

        <!-- Traffic Colors - You'll need to adapt this based on your actual data structure -->
        <div class="flex justify-between">
          <div class="flex items-center gap-2">
            <h1 class="text-[14px]">Inbound</h1>
            <div 
              :style="{ backgroundColor: colorMap[intersection.inbound.status_id] || '#7CFC00' }"
              class="w-[15px] h-[15px] rounded-xs"
            >
            {{ intersection.inbound.status_id }}
          </div>
          </div>

          <div class="flex items-center gap-2">
            <h1 class="text-[14px]">Outbound</h1>
            <div 
              :style="{ backgroundColor: colorMap[intersection.outbound.status_id] || '#FF6347' }"
              class="w-[15px] h-[15px] rounded-xs"
            >
            {{ intersection.outbound.status_id }}
          </div>
          </div>
        </div>
        <hr class="bg-[#fff] opacity-30 mt-3 mb-4">
      </div>

      <!-- Empty state -->
      <div v-if="!isLoading && filteredIntersections.length === 0" class="text-center text-gray-400 py-4">
        No intersections found
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
const isLoading = ref(true);
const searchTerm = ref('');
const showScrollbar = ref(false);
const scrollContainer = ref(null);

// Filter intersections based on search term
const filteredIntersections = computed(() => {
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

// Fetch data on mount
onMounted(async () => {
  try {
    await databaseStore.fetchData();
    console.log("Data fetched successfully:", databaseStore.roads);
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    isLoading.value = false;
    checkScrollbar();
  }
});

const emit = defineEmits(["openEditModal"]);

const openEditModal = (id) => {
  emit("openEditModal", id);
};

// Define colorMap if not passed as prop
const colorMap = {
  green: '#7CFC00',
  yellow: '#FFFF00',
  red: '#FF0000',
  // Add other colors as needed
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