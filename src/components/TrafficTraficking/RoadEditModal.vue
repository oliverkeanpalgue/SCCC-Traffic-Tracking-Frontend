<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useDatabaseStore } from '../../stores/databaseStore';

// Configuration
const ROAD_TYPES = [
  { id: 1, name: 'Intersection' },
  { id: 2, name: 'Rotunda' },
  { id: 3, name: 'Street' },
  { id: 4, name: 'Entry Point' },
  { id: 5, name: 'Road' }
];
const REFRESH_DELAY = 100;

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Data retrieval
const databaseStore = useDatabaseStore();
const emit = defineEmits(['close', 'save']);
const props = defineProps({
  show: Boolean,
  road: {
    type: Object,
    required: true,
    default: () => ({
      roadId: null,
      roadName: '',
      road_type_id: null,
      roadImage: ''
    })
  }
});

// Form state
const roadName = ref('');
const roadTypeId = ref('');
const selectedDirection = ref('inbound');
const coordinatesText = ref('');
const roadImage = ref('');
const imagePreview = computed(() => {
  if (roadImage.value) {
    if (roadImage.value.startsWith('data:')) {
      // For newly uploaded images
      return roadImage.value;
    } else {
      // For existing images from database
      return `${VITE_API_BASE_URL}/storage/road_images/${roadImage.value}`;
    }
  }
  return null;
});

// UI state
const isSaving = ref(false);
const isLoadingCoordinates = ref(false);
const saveSuccess = ref(false);
const saveError = ref('');
const validationError = ref('');
const showConfirmation = ref(false);

// Get road ID consistently
function getRoadId() {
  return props.road.roadId || props.road.id;
}

async function handleImageChange(img) {
  const file = img.target.files[0];
  if (file) {
    imagePreview.value = URL.createObjectURL(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      roadImage.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}


// Fetch road coordinates
async function loadCoordinates() {
  if (!props.show) return;

  const roadId = getRoadId();
  if (!roadId) return;

  isLoadingCoordinates.value = true;
  validationError.value = '';

  try {
    // Try cache first, then API
    let coords = databaseStore.getRoadCoordinates(roadId, selectedDirection.value);

    if (!coords?.length) {
      coords = await databaseStore.fetchRoadCoordinates(roadId, selectedDirection.value);
    }

    coordinatesText.value = coords?.length ? JSON.stringify(coords, null, 2) : '';
  } catch (error) {
    saveError.value = `Error loading coordinates: ${error.message}`;
    coordinatesText.value = '';
  } finally {
    isLoadingCoordinates.value = false;
  }
}

// Form submission
function handleFormSubmit() {
  // First validate
  if (!roadName.value.trim()) {
    saveError.value = 'Road name cannot be empty';
    return;
  }

  if (!coordinatesValid.value && coordinatesText.value.trim()) {
    saveError.value = `Cannot save invalid coordinates: ${validationError.value}`;
    return;
  }

  // Show confirmation dialog
  showConfirmation.value = true;
}

// Data modification
async function handleSave() {
  try {
    showConfirmation.value = false;
    isSaving.value = true;
    saveError.value = '';
    validationError.value = '';

    const roadId = getRoadId();

    const roadData = {
      road_name: roadName.value.trim(),
      ...(roadTypeId.value && { road_type_id: parseInt(roadTypeId.value) }),
      ...(roadImage.value && { image_path: roadImage.value }) // Add image data
    };

    // Update road info
    const updateResult = await databaseStore.updateRoadInfo(roadId, roadData);

    // Update coordinates if provided
    const coordinatesUpdated = await updateCoordinatesIfNeeded(roadId);
    if (saveError.value) return;

    // Verify success
    const isSuccessful = updateResult.success ||
      (updateResult.message?.includes("Successfully Updated"));

    if (isSuccessful) {
      handleSuccessfulSave(roadId, coordinatesUpdated);
    } else {
      saveError.value = updateResult.error || updateResult.message || "Update failed - unknown error";
    }
  } catch (error) {
    handleSaveError(error);
  } finally {
    isSaving.value = false;
  }
}

// Update coordinates if needed
async function updateCoordinatesIfNeeded(roadId) {
  if (!coordinatesText.value.trim()) return false;

  if (!coordinatesValid.value) {
    saveError.value = `Cannot save invalid coordinates: ${validationError.value}`;
    return false;
  }

  try {
    const coordinatesData = JSON.parse(coordinatesText.value);
    await databaseStore.updateRoadCoordinates(
      roadId,
      selectedDirection.value,
      coordinatesData
    );
    return true;
  } catch (error) {
    saveError.value = `Coordinates update failed: ${error.message}`;
    return false;
  }
}

// Handle successful save
function handleSuccessfulSave(roadId, coordinatesUpdated) {
  saveSuccess.value = true;

  const savedData = {
    roadId,
    roadName: roadName.value,
    roadTypeId: roadTypeId.value || null,
    roadImage: roadImage.value,
    coordinatesUpdated,
    __refresh: true,
    __closeAllPopups: true,
    __timestamp: Date.now()
  };

  emit('save', savedData);
  handleClose();

  // Refresh page to ensure state consistency
  //setTimeout(() => window.location.reload(), REFRESH_DELAY);
}

// Process save errors
function handleSaveError(error) {
  if (error.response) {
    saveError.value = `Server error: ${error.response.status} - ${error.response.data.error ||
      error.response.data.message || 'Unknown error'}`;
  } else if (error.request) {
    saveError.value = "Network error: No response from server";
  } else {
    saveError.value = `Error: ${error.message || 'Failed to save changes'}`;
  }
}

// Helper functions
function resetForm() {
  const road = props.road;
  roadName.value = road.roadName || road.road_name || '';
  roadTypeId.value = extractRoadTypeId(road);
  roadImage.value = road.roadImage || ''; 
  selectedDirection.value = 'inbound';
  saveSuccess.value = false;
  saveError.value = '';
  showConfirmation.value = false;

  if (props.show) {
    loadCoordinates();
  }
}

// Extract road type ID
function extractRoadTypeId(road) {
  // Direct ID access - first priority
  if (road.road_type_id) return String(road.road_type_id);
  if (road.roadTypeId) return String(road.roadTypeId);
  if (road.properties?.road_type_id) return String(road.properties.road_type_id);

  // Try to match by name if ID isn't available
  const roadTypeName = road.roadType || road.road_type_name || road.properties?.roadType;
  if (roadTypeName && roadTypeName !== 'Unknown') {
    const matchedType = ROAD_TYPES.find(type => type.name === roadTypeName);
    return matchedType ? String(matchedType.id) : '';
  }

  // Default to empty if nothing found
  return '';
}

// Event handlers
function handleClose() {
  showConfirmation.value = false;
  emit('close');
}

function handleOutsideClick(e) {
  if (e.target.classList.contains('modal-backdrop') && !showConfirmation.value) {
    handleClose();
  }
}

// Validate coordinates
const coordinatesValid = computed(() => {
  if (!coordinatesText.value.trim()) return true;

  try {
    const parsed = JSON.parse(coordinatesText.value);

    if (!Array.isArray(parsed)) {
      validationError.value = 'Coordinates must be an array';
      return false;
    }

    return validateSimpleCoordinates(parsed) ||
      validateNestedCoordinates(parsed) ||
      setFormatError();
  } catch (e) {
    validationError.value = 'Invalid JSON format';
    return false;
  }
});

// Validate simple coordinate array
function validateSimpleCoordinates(parsed) {
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
  return false;
}

// Validate nested coordinate array
function validateNestedCoordinates(parsed) {
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
  return false;
}

// Set format error message
function setFormatError() {
  validationError.value = 'Coordinates must be either a simple array of [lng, lat] pairs or a nested array of coordinate arrays';
  return false;
}

// Lifecycle setup
watch(() => props.show, visible => visible && resetForm(), { immediate: true });
watch(selectedDirection, loadCoordinates);

onMounted(() => {
  if (props.show) {
    loadCoordinates();
  }

  console.log(roadImage.value);
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
          <button @click="handleClose" class="cursor-pointer text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form content -->
        <div class="p-6">
          <form @submit.prevent="handleFormSubmit">
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
                  <label for="roadImage" class="block text-sm font-medium mb-2">Road Image</label>

                  <div class="flex items-center justify-center w-full">
                    <label for="roadImage"
                      class="flex flex-col items-center justify-center w-full h-38 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                      <div v-if="!imagePreview" class="flex flex-col items-center justify-center pt-5 pb-6">
                        <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span class="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        
                      </div>

                      <!-- image preview -->
                      <div v-else class="w-full h-full">
                        <img :src="imagePreview" class="w-full h-full object-cover rounded-lg" 
                             alt="Road image preview" />
                      </div>
                    </label>
                    <input id="roadImage" @change="handleImageChange" type="file" class="hidden" />
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
                    <button type="button" class="cursor-pointer absolute left-0 top-0 w-1/2 h-full opacity-0 z-10 focus:outline-none"
                      @click="selectedDirection = 'outbound'">
                    </button>
                    <button type="button" class="cursor-pointer absolute right-0 top-0 w-1/2 h-full opacity-0 z-10 focus:outline-none"
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
                        <span class="text-sm" :class="selectedDirection === 'inbound' ? 'text-white' : 'text-gray-400'">
                          Inbound
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Coordinates editor -->
                <div class="flex-1">
                  <label class="block text-sm font-medium mb-1 flex justify-between items-center">
                    <span>{{ selectedDirection.charAt(0).toUpperCase() + selectedDirection.slice(1) }}
                      Coordinates</span>
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
                class="cursor-pointer px-4 py-2 rounded-md border border-gray-600 hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              <button type="submit" :disabled="isSaving || (!coordinatesValid && coordinatesText.trim() !== '')" :class="[
                'px-4 py-2 rounded-md transition-colors flex items-center',
                (isSaving || (!coordinatesValid && coordinatesText.trim() !== ''))
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 cursor-pointer'
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

    <!-- Confirmation Modal -->
    <div v-if="showConfirmation" class="modal-backdrop fixed inset-0 flex items-center justify-center z-[60]"
      style="background-color: rgba(0, 0, 0, 0.8);">
      <div class="bg-[#1b1a1a] text-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <h3 class="text-lg font-semibold mb-4">Confirm Road Update</h3>
        <p class="mb-6">Are you sure you want to update this road?</p>

        <div class="flex justify-end space-x-3">
          <button @click="showConfirmation = false"
            class="px-4 py-2 rounded-md border border-gray-600 hover:bg-gray-700 transition-colors">
            Cancel
          </button>
          <button @click="handleSave" :disabled="isSaving" :class="[
            'px-4 py-2 rounded-md transition-colors',
            isSaving ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
          ]">
            Confirm
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>