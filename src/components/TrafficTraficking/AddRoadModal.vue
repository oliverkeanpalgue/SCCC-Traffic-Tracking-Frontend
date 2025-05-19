<template>
  <teleport to="body">
    <!-- Main modal -->
    <div v-if="show" class="modal-backdrop fixed inset-0 flex items-center justify-center z-50"
      style="background-color: rgba(0, 0, 0, 0.7);" @click="handleBackdropClick">
      <div @click.stop
        class="bg-[#1b1a1a] text-white rounded-lg shadow-xl w-full max-w-[1000px] mx-4 overflow-hidden animate-modal-in">
        <!-- Header -->
        <header class="bg-[#252424] px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h3 class="text-lg font-semibold">Add New Road</h3>
          <button @click="handleClose" class="text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <!-- Form -->
        <div class="p-6">
          <form @submit.prevent="handleFormSubmit">
            <!-- Two-column layout -->
            <div class="grid grid-cols-2 gap-6">
              <!-- Left column: Road details -->
              <div>
                <!-- Road Name -->
                <div class="mb-4">
                  <label for="roadName" class="block text-sm font-medium mb-1">Road Name <span
                      class="text-red-500">*</span></label>
                  <input id="roadName" v-model="roadName" type="text" required
                    class="w-full px-4 py-2 bg-[#2d2c2c] rounded border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none" />
                </div>

                <!-- Road Type -->
                <div class="mb-4">
                  <label for="roadType" class="block text-sm font-medium mb-1">Road Type <span
                      class="text-red-500">*</span></label>
                  <select id="roadType" v-model="roadTypeId" required
                    class="w-full px-4 py-2 bg-[#2d2c2c] rounded border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none">
                    <option disabled value="">Select Road Type</option>
                    <option v-for="type in ROAD_TYPES" :key="type.id" :value="String(type.id)">{{ type.name }}</option>
                  </select>
                </div>

                <!-- ditoy image uploadingss  -->
                <div class="mb-4">
                  <label for="roadImage" class="block text-sm font-medium mb-2">Upload Image</label>

                  <div class="flex items-center justify-center w-full">
                    <label for="roadImage"
                      class="flex flex-col items-center justify-center w-full h-38 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                      <div v-if="!imagePreview" class="flex flex-col items-center justify-center pt-5 pb-6">
                        <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span class="font-semibold">Click to upload</span> or drag and drop
                        </p>
                      </div>

                      <!-- image preview -->
                      <div v-else class="w-full h-full bg-gray-200 rounded-lg">
                        <img :src="imagePreview" alt="Road Image Preview" class="object-cover w-full h-full rounded-lg" />
                      </div>
                    </label>
                    <input id="roadImage" @change="handleImageChange" type="file" class="hidden" />
                  </div>

                </div>
              </div>

              <!-- Right column: Coordinates with toggle -->
              <div class="flex flex-col h-full">
                <!-- Direction Toggle -->
                <div class="mb-4">
                  <label class="block text-sm font-medium mb-2">Direction</label>
                  <div class="relative h-10 w-full">
                    <!-- Background track -->
                    <div class="absolute inset-0 bg-gray-800 rounded-full shadow-inner"></div>

                    <!-- Sliding indicator -->
                    <div class="absolute top-0 bottom-0 w-1/2 transition-all duration-200 ease-in-out"
                      :class="selectedDirection === DIRECTION_OUTBOUND ? 'left-0' : 'left-1/2'">
                      <div class="h-full w-full bg-green-600 rounded-full shadow-md flex items-center justify-center">
                        <span class="text-sm font-medium text-white">
                          {{ selectedDirection === DIRECTION_OUTBOUND ? 'Outbound' : 'Inbound' }}
                        </span>
                      </div>
                    </div>

                    <!-- Clickable areas -->
                    <button type="button" class="absolute left-0 top-0 w-1/2 h-full opacity-0 z-10 focus:outline-none"
                      @click="selectedDirection = DIRECTION_OUTBOUND">
                    </button>
                    <button type="button" class="absolute right-0 top-0 w-1/2 h-full opacity-0 z-10 focus:outline-none"
                      @click="selectedDirection = DIRECTION_INBOUND">
                    </button>

                    <!-- Text labels -->
                    <div class="absolute inset-0 flex pointer-events-none">
                      <div class="w-1/2 flex items-center justify-center">
                        <span class="text-sm"
                          :class="selectedDirection === DIRECTION_OUTBOUND ? 'text-white' : 'text-gray-400'">
                          Outbound
                        </span>
                      </div>
                      <div class="w-1/2 flex items-center justify-center">
                        <span class="text-sm"
                          :class="selectedDirection === DIRECTION_INBOUND ? 'text-white' : 'text-gray-400'">
                          Inbound
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Coordinates editor -->
                <div class="flex-1">
                  <label class="block text-sm font-medium mb-1 flex justify-between items-center">
                    <span>{{ capitalizeFirstLetter(selectedDirection) }} Coordinates</span>
                    <span v-if="!isCurrentDirectionValid && getCurrentCoordinatesText.trim()"
                      class="text-xs text-red-400">Invalid format</span>
                  </label>
                  <div class="w-full rounded relative h-[230px]" :class="['border',
                    isCurrentDirectionValid || !getCurrentCoordinatesText.trim() ? 'border-gray-700' : 'border-red-500',
                    'bg-[#2d2c2c]']">
                    <textarea v-model="getCurrentCoordinatesText"
                      class="w-full h-full px-4 py-2 bg-[#2d2c2c] text-sm text-gray-300 focus:outline-none font-mono"
                      :class="isCurrentDirectionValid || !getCurrentCoordinatesText.trim() ? 'focus:ring-green-500' : 'focus:ring-red-500'"
                      placeholder="Enter coordinates as JSON array [[lng, lat], [lng, lat], ...] or nested array"
                      spellcheck="false"></textarea>

                    <!-- Validation Error -->
                    <div v-if="!isCurrentDirectionValid && getCurrentCoordinatesText.trim()"
                      class="absolute bottom-0 left-0 right-0 bg-red-900 bg-opacity-90 text-white text-xs p-2 border-t border-red-700">
                      {{ getCurrentValidationError }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Error Display -->
            <div v-if="saveError" class="mt-4 p-3 bg-red-900 bg-opacity-50 text-red-100 rounded-md">
              {{ saveError }}
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-end space-x-3 mt-6">
              <button type="button" @click="handleClose"
                class="px-4 py-2 rounded-md border border-gray-600 hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              <button type="submit" :disabled="isSaving || isFormInvalid" :class="[
                'px-4 py-2 rounded-md transition-colors flex items-center',
                isSaving || isFormInvalid ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              ]">
                <span v-if="isSaving"
                  class="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                {{ isSaving ? 'Creating...' : 'Create Road' }}
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
        <h3 class="text-lg font-semibold mb-4">Confirm Road Creation</h3>
        <p class="mb-6">Are you sure you want to create this road?</p>

        <div class="flex justify-end space-x-3">
          <button @click="showConfirmation = false"
            class="px-4 py-2 rounded-md border border-gray-600 hover:bg-gray-700 transition-colors">
            Cancel
          </button>
          <button @click="createRoad" :disabled="isSaving" :class="[
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

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useDatabaseStore } from '../../stores/databaseStore'

async function handleImageChange(img) {
  const file = img.target.files[0];
  if (file) {
    imagePreview.value = URL.createObjectURL(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      roadImage.value = e.target.result; // This will be a base64 string
    };
    reader.readAsDataURL(file);
  }
}

// Configuration
const ROAD_TYPES = [
  { id: 1, name: 'Intersection' },
  { id: 2, name: 'Street' },
  { id: 3, name: 'Rotunda' },
  { id: 4, name: 'Entry Point' },
  { id: 5, name: 'Road' }
]
const DIRECTION_INBOUND = 'inbound'
const DIRECTION_OUTBOUND = 'outbound'
const RESET_DELAY = 800
const ERROR_MESSAGES = {
  EMPTY_ROAD_NAME: 'Road name cannot be empty',
  NO_ROAD_TYPE: 'Road type must be selected',
  NO_COORDINATES: 'At least one direction (Inbound or Outbound) must have coordinates',
  INVALID_JSON: 'Invalid JSON format',
  NOT_ARRAY: 'Coordinates must be an array',
  INVALID_COORD_PAIR: 'Each coordinate must be a pair of numbers [lng, lat]',
  INVALID_NESTED_COORD: 'Each coordinate must be a pair of numbers [lng, lat] within nested arrays',
  INVALID_FORMAT: 'Coordinates must be array of [lng, lat] pairs or nested coordinate arrays',
  CREATE_FAILED: 'Failed to create road'
}

// Data retrieval
const databaseStore = useDatabaseStore()
const props = defineProps({ show: Boolean })
const emit = defineEmits(['close', 'roadAdded'])

// Data modification
async function createRoad() {
  try {
    showConfirmation.value = false;
    isSaving.value = true;
    saveError.value = '';

    const validationError = validateForm();
    if (validationError) {
      saveError.value = validationError;
      return;
    }

    const roadData = {
      road_name: roadName.value.trim(),
      road_type_id: parseInt(roadTypeId.value),
      image_path: roadImage.value
    };

    console.log('Road Data:', roadData)

    const inboundCoords = inboundCoordinatesText.value.trim()
      ? JSON.parse(inboundCoordinatesText.value)
      : null

    const outboundCoords = outboundCoordinatesText.value.trim()
      ? JSON.parse(outboundCoordinatesText.value)
      : null

    const response = await databaseStore.createRoad(roadData)

    if (!response.success) {
      throw new Error(response.message || ERROR_MESSAGES.CREATE_FAILED)
    }

    const newRoadId = response.data.road.id

    if (newRoadId) {
      await saveCoordinates(newRoadId, inboundCoords, outboundCoords)
    }

    await databaseStore.fetchData(`?_=${Date.now()}`)

    emit('roadAdded', {
      id: newRoadId,
      roadName: roadName.value,
      __refresh: true,
      __timestamp: Date.now()
    })

    setTimeout(handleClose, RESET_DELAY)
  } catch (error) {
    saveError.value = `Error: ${error.message || ERROR_MESSAGES.CREATE_FAILED}`
  } finally {
    isSaving.value = false
  }
}

// Save coordinates for both directions
async function saveCoordinates(roadId, inboundCoords, outboundCoords) {
  const updatePromises = []

  if (inboundCoords) {
    updatePromises.push(
      databaseStore.updateRoadCoordinates(roadId, DIRECTION_INBOUND, inboundCoords)
    )
  }

  if (outboundCoords) {
    updatePromises.push(
      databaseStore.updateRoadCoordinates(roadId, DIRECTION_OUTBOUND, outboundCoords)
    )
  }

  if (updatePromises.length > 0) {
    await Promise.all(updatePromises)
  }
}

// Helper functions
function resetForm() {
  roadName.value = ''
  roadTypeId.value = ''
  roadImage.value = null
  imagePreview.value = ''
  inboundCoordinatesText.value = ''
  outboundCoordinatesText.value = ''
  inboundValidationError.value = ''
  outboundValidationError.value = ''
  saveError.value = ''
  showConfirmation.value = false
  selectedDirection.value = DIRECTION_INBOUND
}

// Validate form input
function validateForm() {
  if (!roadName.value.trim()) {
    return ERROR_MESSAGES.EMPTY_ROAD_NAME
  }

  if (!roadTypeId.value) {
    return ERROR_MESSAGES.NO_ROAD_TYPE
  }

  if (!inboundCoordinatesText.value.trim() && !outboundCoordinatesText.value.trim()) {
    return ERROR_MESSAGES.NO_COORDINATES
  }

  if (inboundCoordinatesText.value.trim() && !inboundCoordinatesValid.value) {
    return `Invalid inbound coordinates: ${inboundValidationError.value}`
  }

  if (outboundCoordinatesText.value.trim() && !outboundCoordinatesValid.value) {
    return `Invalid outbound coordinates: ${outboundValidationError.value}`
  }

  return null
}

// Validate coordinate structure
function validateCoordinates(coordinatesText, errorRef) {
  try {
    const parsed = JSON.parse(coordinatesText)

    if (!Array.isArray(parsed)) {
      errorRef.value = ERROR_MESSAGES.NOT_ARRAY
      return false
    }

    if (parsed.length === 0) return true

    return isSimpleCoordinateArray(parsed, errorRef) ||
      isNestedCoordinateArray(parsed, errorRef) ||
      setCoordinateFormatError(errorRef)
  } catch (e) {
    errorRef.value = ERROR_MESSAGES.INVALID_JSON
    return false
  }
}

// Check for simple coordinate array
function isSimpleCoordinateArray(arr, errorRef) {
  if (!Array.isArray(arr[0]) || arr[0].length !== 2 ||
    typeof arr[0][0] !== 'number' || typeof arr[0][1] !== 'number') {
    return false
  }

  const invalid = arr.some(coord =>
    !Array.isArray(coord) ||
    coord.length !== 2 ||
    typeof coord[0] !== 'number' ||
    typeof coord[1] !== 'number'
  )

  if (invalid) {
    errorRef.value = ERROR_MESSAGES.INVALID_COORD_PAIR
    return false
  }

  return true
}

// Check for nested coordinate array
function isNestedCoordinateArray(arr, errorRef) {
  if (!Array.isArray(arr[0]) || !Array.isArray(arr[0][0])) return false

  const invalid = arr.some(subArray => {
    if (!Array.isArray(subArray)) return true

    return subArray.some(coord =>
      !Array.isArray(coord) ||
      coord.length !== 2 ||
      typeof coord[0] !== 'number' ||
      typeof coord[1] !== 'number'
    )
  })

  if (invalid) {
    errorRef.value = ERROR_MESSAGES.INVALID_NESTED_COORD
    return false
  }

  return true
}

// Set format error
function setCoordinateFormatError(errorRef) {
  errorRef.value = ERROR_MESSAGES.INVALID_FORMAT
  return false
}

// Capitalize string
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

// Event handlers
function handleFormSubmit() {
  showConfirmation.value = true
}

function handleClose() {
  resetForm()
  emit('close')
}

function handleBackdropClick(e) {
  if (e.target.classList.contains('modal-backdrop') && !showConfirmation.value) {
    handleClose()
  }
}

// State initialization
const roadName = ref('')
const roadTypeId = ref('')
const inboundCoordinatesText = ref('')
const outboundCoordinatesText = ref('')
const inboundValidationError = ref('')
const outboundValidationError = ref('')
const selectedDirection = ref(DIRECTION_INBOUND)
const isSaving = ref(false)
const saveError = ref('')
const showConfirmation = ref(false)
const roadImage = ref(null)
const imagePreview = ref('')

// Computed properties
const getCurrentCoordinatesText = computed({
  get: () => selectedDirection.value === DIRECTION_INBOUND
    ? inboundCoordinatesText.value
    : outboundCoordinatesText.value,
  set: (value) => {
    if (selectedDirection.value === DIRECTION_INBOUND) {
      inboundCoordinatesText.value = value
    } else {
      outboundCoordinatesText.value = value
    }
  }
})

const getCurrentValidationError = computed(() =>
  selectedDirection.value === DIRECTION_INBOUND
    ? inboundValidationError.value
    : outboundValidationError.value
)

const inboundCoordinatesValid = computed(() =>
  !inboundCoordinatesText.value.trim() ||
  validateCoordinates(inboundCoordinatesText.value, inboundValidationError)
)

const outboundCoordinatesValid = computed(() =>
  !outboundCoordinatesText.value.trim() ||
  validateCoordinates(outboundCoordinatesText.value, outboundValidationError)
)

const isCurrentDirectionValid = computed(() =>
  selectedDirection.value === DIRECTION_INBOUND
    ? inboundCoordinatesValid.value
    : outboundCoordinatesValid.value
)

const isFormInvalid = computed(() => {
  const hasInvalidCoords = (!inboundCoordinatesValid.value && inboundCoordinatesText.value.trim()) ||
    (!outboundCoordinatesValid.value && outboundCoordinatesText.value.trim())
  const hasNoCoords = !inboundCoordinatesText.value.trim() && !outboundCoordinatesText.value.trim()
  const missingRequiredFields = !roadName.value.trim() || !roadTypeId.value

  return hasInvalidCoords || hasNoCoords || missingRequiredFields
})

// Watchers
watch(() => props.show, isVisible => {
  if (isVisible) {
    resetForm()
  }
})
</script>