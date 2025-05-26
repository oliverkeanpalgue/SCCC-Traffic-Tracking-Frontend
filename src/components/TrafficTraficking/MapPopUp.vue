<script setup>
import { defineProps, defineEmits, ref, watch, computed, onMounted } from 'vue';
import RoadEditModal from './RoadEditModal.vue';
import defaultRoadImage from '../../assets/1.png';
import { useDatabaseStore } from '../../stores/databaseStore';
import useUserStore from '../../stores/user';

// Get store instance
const databaseStore = useDatabaseStore();
const userStore = useUserStore();
const isLoggedIn = computed(() => userStore.isLoggedIn);
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 

// Access road types from store instead of hardcoding
const roadTypes = computed(() =>
  databaseStore.roadTypes.length > 0
    ? databaseStore.roadTypes
    : databaseStore.setDefaultRoadTypes()
);
import RoadDeleteModal from './RoadDeleteModal.vue';

// Props define the data the component receives from parent
const props = defineProps({
  roadId: {
    type: [String, Number],  // Accept both string and number types
    required: true
  },
  roadName: {
    type: String,
    required: true
  },
  directionText: {
    type: String,
    default: ''
  },
  trafficStatus: {
    type: String,
    default: ''
  },
  roadImage: {
    type: String,
  },
  roadType: {
    type: String,
    default: 'Street'
  },
});

// Events this component can trigger to communicate with parents
const emit = defineEmits(['edit', 'delete', 'update']);

// Reactive state for modal visibility
const showEditModal = ref(false);

// Fetch road types on component mount if needed
onMounted(async () => {
  if (databaseStore.roadTypes.length === 0) {
    try {
      await databaseStore.fetchRoadTypes();
    } catch (error) {
      console.error("Could not load road types:", error);
    }
  }
});
const showDeleteModal = ref(false);

// Watch for prop changes but take no action (deep watching for objects)
watch(() => props, () => { }, { deep: true });

// Event handler functions
const handleEdit = () => showEditModal.value = true;
const handleDelete = () => showDeleteModal.value = true;
const handleCloseModal = () => showEditModal.value = false;

const handleSaveRoad = (updatedRoad) => {
  // Ensure road type information is preserved
  const roadData = {
    ...updatedRoad,
    __refresh: true,
    __timestamp: Date.now(),
    __triggerSource: 'popup',
    __closeAllPopups: true
  };

  // Make sure road type is included properly
  if (props.roadType && !roadData.road_type_id && !roadData.roadTypeId) {
    // Try to find the road type ID by name using the dynamic roadTypes
    const matchedType = roadTypes.value ?
      roadTypes.value.find(type => type.name === props.roadType) : null;

    if (matchedType) {
      roadData.road_type_id = matchedType.id;
    }
  }

  emit('update', roadData);
  showEditModal.value = false;
};
</script>

<template>
  <!-- Main popup container with dark theme styling and extra bottom padding -->
  <div class="bg-[#1b1a1a] text-white rounded-2xl overflow-hidden shadow-lg w-full max-w-[320px] pb-6">
    <!-- Road image display area -->
    <div class="w-full h-[200px] overflow-hidden">
      <img 
        :src="roadImage ? `${VITE_API_BASE_URL}/storage/road_images/${roadImage}` : defaultRoadImage" 
        class="w-full h-full object-cover" 
      />
    </div>

    <!-- Road details section -->
    <div class="p-3">
      <h3 class="popup-road-name text-base font-bold mb-1">{{ roadName }}</h3>
      <p class="text-sm text-gray-400">Type: {{ roadType }}</p>
    </div>

    <!-- Action buttons row with flexbox layout -->
    <div class="w-full flex py-2" v-if="isLoggedIn">
      <div class="w-1/2 flex flex-col items-center">
        <button @click="handleEdit"
          class="w-12 h-12 rounded-full cursor-pointer border border-green-500 flex items-center justify-center text-green-500 hover:bg-green-500/20 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              d="M13.586 3.586a2 2 0 112.828 2.828l-10 10a2 2 0 01-1.414.586H3a1 1 0 01-1-1v-2a2 2 0 01.586-1.414l10-10z" />
          </svg>
        </button>
        <span class="text-green-500 text-sm mt-1">Edit</span>
      </div>

      <div class="w-1/2 flex flex-col items-center">
        <button @click="handleDelete"
          class="w-12 h-12 rounded-full cursor-pointer border border-red-500 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clip-rule="evenodd" />
          </svg>
        </button>
        <span class="text-red-500 text-sm mt-1">Delete</span>
      </div>
    </div>
    <!-- If not logged in, add a spacer for visual balance -->
    <div v-else class="pb-1"></div>

    <!-- Conditionally rendered modal component with props binding -->
    <RoadEditModal :show="showEditModal" :road="{ roadId, roadName, directionText, trafficStatus, roadType, roadImage }"
        :roadTypes="roadTypes" @close="handleCloseModal" @update="handleSaveRoad" />

    <RoadDeleteModal
        :show="showDeleteModal"
        :road="{ roadId, roadName }"
        @close="showDeleteModal = false"
    />
  </div>
</template>