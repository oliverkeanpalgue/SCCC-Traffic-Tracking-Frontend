<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useDatabaseStore } from '../../stores/databaseStore';

// Core state management
const databaseStore = useDatabaseStore();
const emit = defineEmits(['close', 'save']);

// Road type configuration
const ROAD_TYPES = [
  { id: 1, name: 'Intersection' },
  { id: 2, name: 'Rotunda' },
  { id: 3, name: 'Street' },
  { id: 4, name: 'Entry Point' },
  { id: 5, name: 'Road' }
];

// Mapping to convert road type names to their corresponding IDs
const ROAD_TYPE_NAME_TO_ID = {
  'Intersection': '1',
  'Rotunda': '2',
  'Street': '3',
  'Entry Point': '4',
  'Road': '5'
};

const props = defineProps({
  show: Boolean,
  road: {
    type: Object,
    required: true,
    default: () => ({
      roadId: null,
      roadName: '',
      road_type_id: null
    })
  }
});

// Form state
const roadName = ref('');
const roadTypeId = ref('');
const selectedDirection = ref('inbound');
const coordinatesText = ref('');
const roadImage = ref('');

// UI state
const isSaving = ref(false);
const isLoadingCoordinates = ref(false);
const saveSuccess = ref(false);
const saveError = ref('');
const validationError = ref('');

// Validate if the coordinates are in the correct format
const coordinatesValid = computed(() => {
  if (!coordinatesText.value.trim()) return true;

  try {
    const parsed = JSON.parse(coordinatesText.value);

    if (!Array.isArray(parsed)) {
      validationError.value = 'Coordinates must be an array';
      return false;
    }

    // Simple coordinate pairs validation
    if (parsed.length > 0 && Array.isArray(parsed[0]) && parsed[0].length === 2 &&
      typeof parsed[0][0] === 'number' && typeof parsed[0][1] === 'number') {
      
      for (const coord of parsed) {
        if (!Array.isArray(coord) || coord.length !== 2 ||
          typeof coord[0] !== 'number' || typeof coord[1] !== 'number') {
          validationError.value = 'Each coordinate must be a pair of numbers [lng, lat]';
          return false;
        }
      }
      return true;
    }

    // Nested coordinate arrays validation
    if (parsed.length > 0 && Array.isArray(parsed[0]) && Array.isArray(parsed[0][0])) {
      for (const subArray of parsed) {
        if (!Array.isArray(subArray)) {
          validationError.value = 'Each element must be an array of coordinates';
          return false;
        }

        for (const coord of subArray) {
          if (!Array.isArray(coord) || coord.length !== 2 ||
            typeof coord[0] !== 'number' || typeof coord[1] !== 'number') {
            validationError.value = 'Each coordinate must be a pair of numbers [lng, lat]';
            return false;
          }
        }
      }
      return true;
    }

    validationError.value = 'Coordinates must be either a simple array of [lng, lat] pairs or a nested array of coordinate arrays';
    return false;
  } catch (e) {
    validationError.value = 'Invalid JSON format';
    return false;
  }
});

// Reset form when modal opens and reload coordinates when direction changes
watch(() => props.show, visible => visible && resetForm(), { immediate: true });
watch(selectedDirection, loadCoordinates);

// Reset form with road data
function resetForm() {
  const road = props.road;
  roadName.value = road.roadName || road.road_name || '';
  roadTypeId.value = extractRoadTypeId(road);
  selectedDirection.value = 'inbound';
  saveSuccess.value = false;
  saveError.value = '';

  if (props.show) {
    loadCoordinates();
  }
}

// Extract road type ID from various possible sources
function extractRoadTypeId(road) {
  // Direct ID properties
  if (road.road_type_id) {
    return String(road.road_type_id);
  }
  
  if (road.roadTypeId) {
    return String(road.roadTypeId);
  }
  
  // String name properties
  if (road.roadType && typeof road.roadType === 'string') {
    return ROAD_TYPE_NAME_TO_ID[road.roadType] || '';
  }
  
  // Nested properties
  if (road.properties?.roadType) {
    return ROAD_TYPE_NAME_TO_ID[road.properties.roadType] || '';
  }
  
  return '';
}

// Load coordinates for selected direction
async function loadCoordinates() {
  if (!props.show) return;

  const roadId = props.road.roadId || props.road.id;
  if (!roadId) return;

  isLoadingCoordinates.value = true;
  validationError.value = '';
  
  try {
    // Try cache first, then API
    let coords = databaseStore.getRoadCoordinates(roadId, selectedDirection.value);

    if (!coords || coords.length === 0) {
      coords = await databaseStore.fetchRoadCoordinates(roadId, selectedDirection.value);
    }

    coordinatesText.value = coords && coords.length
      ? JSON.stringify(coords, null, 2)
      : '';
  } catch (error) {
    saveError.value = `Error loading coordinates: ${error.message}`;
    coordinatesText.value = '';
  } finally {
    isLoadingCoordinates.value = false;
  }
}

// Save road data with coordinate updates
async function handleSave() {
  try {
    isSaving.value = true;
    saveError.value = '';
    validationError.value = '';

    const roadId = props.road.roadId || props.road.id;

    // Input validation
    if (!roadName.value.trim()) {
      saveError.value = 'Road name cannot be empty';
      return;
    }

    // Prepare road data update
    const roadData = {
      road_name: roadName.value.trim()
    };

    if (roadTypeId.value) {
      roadData.road_type_id = parseInt(roadTypeId.value);
    }

    // Update basic road information
    const updateResult = await databaseStore.updateRoadInfo(roadId, roadData);

    // Handle coordinate updates if needed
    let coordinatesUpdated = false;
    if (coordinatesText.value.trim()) {
      if (!coordinatesValid.value) {
        saveError.value = `Cannot save invalid coordinates: ${validationError.value}`;
        return;
      }

      try {
        const coordinatesData = JSON.parse(coordinatesText.value);
        await databaseStore.updateRoadCoordinates(
          roadId,
          selectedDirection.value,
          coordinatesData
        );
        coordinatesUpdated = true;
      } catch (error) {
        saveError.value = `Coordinates update failed: ${error.message}`;
        return;
      }
    }

    // Check if update was successful
    if (updateResult.success || 
        (updateResult.message && updateResult.message.includes("Successfully Updated"))) {
      
      saveSuccess.value = true;

      // Prepare data for emit
      const savedData = {
        roadId: roadId,
        roadName: roadName.value,
        roadTypeId: roadTypeId.value || null,
        coordinatesUpdated,
        __refresh: true,
        __closeAllPopups: true,
        __timestamp: Date.now()
      };

      emit('save', savedData);
      handleClose();

      // Refresh page to ensure state consistency
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } else {
      saveError.value = updateResult.error || updateResult.message || "Update failed - unknown error";
    }
  } catch (error) {
    // Error handling with detailed messages
    if (error.response) {
      saveError.value = `Server error: ${error.response.status} - ${error.response.data.error || error.response.data.message || 'Unknown error'}`;
    } else if (error.request) {
      saveError.value = "Network error: No response from server";
    } else {
      saveError.value = `Error: ${error.message || 'Failed to save changes'}`;
    }
  } finally {
    isSaving.value = false;
  }
}

// Modal control functions
function handleClose() {
  emit('close');
}

function handleOutsideClick(e) {
  if (e.target.classList.contains('modal-backdrop')) {
    handleClose();
  }
}

// Initialize on mount
onMounted(() => {
  if (props.show) {
    loadCoordinates();
  }
});
</script>

<template>
  <teleport to="body">
    <div v-if="show" class="modal-backdrop fixed inset-0 flex items-center justify-center z-50 "
      style="background-color: rgba(0, 0, 0, 0.7);" @click="handleOutsideClick">
      <div @click.stop
        class="bg-[#1b1a1a] text-white rounded-lg shadow-xl w-full max-w-[1000px] mx-4 overflow-hidden animate-modal-in">
        <!-- Modal header -->
        <div class="bg-[#252424] px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h3 class="text-lg font-semibold">Edit Road Information</h3>
          <button @click="handleClose" class="text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form content -->
        <div class="p-6">
          <form @submit.prevent="handleSave">
            <!-- Two-column layout -->
            <div class="grid grid-cols-2 gap-6">
              <!-- Left column: Road details -->
              <div>
                <!-- Road Name -->
                <div class="mb-4">
                  <label for="roadName" class="block text-sm font-medium mb-1">Road Name</label>
                  <input id="roadName" v-model="roadName" type="text" required
                    class="w-full px-4 py-2 bg-[#2d2c2c] rounded border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none" />
                </div>

                <!-- Road Type Dropdown -->
                <div class="mb-4">
                  <label for="roadType" class="block text-sm font-medium mb-1">Road Type</label>
                  <select id="roadType" v-model="roadTypeId"
                    class="w-full px-4 py-2 bg-[#2d2c2c] rounded border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none">
                    <option disabled value="">Select Road Type</option>
                    <option v-for="type in ROAD_TYPES" :key="type.id" :value="String(type.id)">
                      {{ type.name }}
                    </option>
                  </select>
                </div>
                
                <!-- Preview Image -->
                <div class="mb-4">
                  <p class="text-sm font-medium mb-1">Preview</p>
                  <div
                    class="w-full h-[148px] bg-gray-800 rounded overflow-hidden flex items-center justify-center">
                    <img v-if="roadImage" :src="roadImage" alt="Road Preview" class="w-full h-full object-cover" />
                    <span v-else class="text-gray-500 text-sm">No image available</span>
                  </div>
                </div>
              </div>

              <!-- Right column: Coordinates editor -->
              <div class="flex flex-col h-full justify-between">
                <!-- Direction Toggle -->
                <div class="mb-4">
                  <label class="block text-sm font-medium mb-2">Direction</label>
                  <div class="relative h-10 w-full">
                    <!-- Background track -->
                    <div class="absolute inset-0 bg-gray-800 rounded-full shadow-inner"></div>

                    <!-- Sliding indicator -->
                    <div class="absolute top-0 bottom-0 w-1/2 transition-all duration-200 ease-in-out"
                      :class="selectedDirection === 'outbound' ? 'left-0' : 'left-1/2'">
                      <div class="h-full w-full bg-green-600 rounded-full shadow-md flex items-center justify-center">
                        <span class="text-sm font-medium text-white">
                          {{ selectedDirection === 'outbound' ? 'Outbound' : 'Inbound' }}
                        </span>
                      </div>
                    </div>

                    <!-- Clickable areas -->
                    <button type="button"
                      class="absolute left-0 top-0 w-1/2 h-full opacity-0 z-10 focus:outline-none"
                      @click="selectedDirection = 'outbound'">
                    </button>
                    <button type="button"
                      class="absolute right-0 top-0 w-1/2 h-full opacity-0 z-10 focus:outline-none"
                      @click="selectedDirection = 'inbound'">
                    </button>

                    <!-- Text labels -->
                    <div class="absolute inset-0 flex pointer-events-none">
                      <div class="w-1/2 flex items-center justify-center">
                        <span class="text-sm"
                          :class="selectedDirection === 'outbound' ? 'text-white' : 'text-gray-400'">
                          Outbound
                        </span>
                      </div>
                      <div class="w-1/2 flex items-center justify-center">
                        <span class="text-sm"
                          :class="selectedDirection === 'inbound' ? 'text-white' : 'text-gray-400'">
                          Inbound
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Coordinates editor -->
                <div class="flex-1">
                  <label class="block text-sm font-medium mb-1 flex justify-between items-center">
                    <span>{{ selectedDirection.charAt(0).toUpperCase() + selectedDirection.slice(1) }} Coordinates</span>
                    <span v-if="isLoadingCoordinates" class="text-xs text-gray-400">Loading...</span>
                    <span v-else-if="!coordinatesValid" class="text-xs text-red-400">Invalid format</span>
                  </label>
                  <div class="w-full rounded relative" :class="[
                    'border',
                    coordinatesValid ? 'border-gray-700' : 'border-red-500',
                    'bg-[#2d2c2c]',
                    'h-[230px]'
                  ]">
                    <textarea v-model="coordinatesText"
                      class="w-full h-full px-4 py-2 bg-[#2d2c2c] text-sm text-gray-300 focus:outline-none font-mono"
                      :class="coordinatesValid ? 'focus:ring-green-500' : 'focus:ring-red-500'"
                      :placeholder="isLoadingCoordinates ? 'Loading coordinates...' : 'No coordinates available'"
                      spellcheck="false"></textarea>

                    <!-- Validation error message -->
                    <div v-if="!coordinatesValid"
                      class="absolute bottom-0 left-0 right-0 bg-red-900 bg-opacity-90 text-white text-xs p-2 border-t border-red-700">
                      {{ validationError }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Status messages -->
            <div class="mt-4">
              <div v-if="saveSuccess" class="px-4 py-2 bg-green-800 bg-opacity-50 text-green-200 rounded mb-2">
                Changes saved successfully!
              </div>
              <div v-if="saveError" class="px-4 py-2 bg-red-800 bg-opacity-50 text-red-200 rounded mb-2">
                {{ saveError }}
              </div>
            </div>

            <!-- Action buttons -->
            <div class="flex justify-end space-x-3 mt-6">
              <button type="button" @click="handleClose"
                class="px-4 py-2 rounded-md border border-gray-600 hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              <button type="submit" :disabled="isSaving || (!coordinatesValid && coordinatesText.trim() !== '')" 
                :class="[
                  'px-4 py-2 rounded-md transition-colors flex items-center',
                  (isSaving || (!coordinatesValid && coordinatesText.trim() !== ''))
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                ]">
                <span v-if="isSaving"
                  class="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                {{ isSaving ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </teleport>
</template>