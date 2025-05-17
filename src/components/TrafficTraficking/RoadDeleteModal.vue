<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useDatabaseStore } from '../../stores/databaseStore';
import axiosClient from '../../axios.js';

// Core state management
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
    })
  }
});

// Form state
const roadName = ref('');

// UI state
const isSaving = ref(false);
const saveSuccess = ref(false);
const saveError = ref('');
const validationError = ref('');
const isDeleting = ref(false);
const deleteError = ref('');

// Reset form when modal opens and reload coordinates when direction changes
watch(() => props.show, visible => visible && resetForm(), { immediate: true });

// Reset form with road data
function resetForm() {
  const road = props.road;
}

// Delete road data
async function handleDelete() {
  try {
    isDeleting.value = true;
    deleteError.value = '';

    const roadId = props.road.roadId || props.road.id;

    axiosClient.delete(`/api/traffic-tracking/soft-delete/${roadId}`, {
        headers: {
            'x-api-key': import.meta.env.VITE_API_KEY,
        }
    })
      .then(response => {
          console.log('road deleted')
      })
      .catch(error => {
        saveError.value = error.message || 'Failed to delete road';
      });

   
  } catch (error) {
    deleteError.value = error.message || 'Failed to delete road';
  } finally {
    isDeleting.value = false;
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
    //
  }
});
</script>

<template>
  <teleport to="body">
    <div v-if="show" class="modal-backdrop fixed inset-0 flex items-center justify-center z-50 "
      style="background-color: rgba(0, 0, 0, 0.7);" @click="handleOutsideClick">
      <div @click.stop
        class="bg-[#1b1a1a] text-white rounded-lg shadow-xl w-96 mx-4 overflow-hidden animate-modal-in">
        <!-- Modal header -->
        <div class="bg-[#252424] px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h3 class="text-lg font-semibold">Delete Road</h3>
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
              <p class="text-gray-300 mb-4">Are you sure you want to delete this road (<span class="font-bold">{{ props.road.roadName }}</span>) ?</p>
              <!-- Action buttons -->
          <div class="flex justify-end space-x-3 mt-6">
            <button type="button" @click="handleClose"
              class="px-4 py-2 cursor-pointer rounded-md border border-gray-600 hover:bg-gray-700 transition-colors">
              Cancel
            </button>
            <button @click="handleDelete" :disabled="isDeleting"
              class="px-4 py-2 cursor-pointer rounded-md bg-red-600 hover:bg-red-700 transition-colors flex items-center">
              <span v-if="isDeleting"
                class="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              {{ isDeleting ? 'Deleting...' : 'Delete Road' }}
            </button>
          </div>
          </form>          
        </div>
      </div>
    </div>
  </teleport>
</template>