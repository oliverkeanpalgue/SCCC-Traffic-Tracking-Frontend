<script setup>
import { ref, watch } from 'vue';
import defaultRoadImage from '../../assets/1.png';

// Component props with simplified defaults
const props = defineProps({
    show: Boolean,
    road: {
        type: Object,
        required: true,
        default: () => ({
            roadId: null,
        })
    }
});

const emit = defineEmits(['close', 'save']);

// Form field refs
const roadId = ref('');
const roadName = ref('');


// Reset form when modal opens
watch(() => props.show, visible => visible && resetForm(), { immediate: true }, console.log(props.road.roadId));

// Populate form with road data
const resetForm = () => {
    Object.entries({ roadId, roadName })
        .forEach(([key, ref]) => ref.value = props.road[key]);
};

// Save changes and emit updated road
const handleSave = () => emit('save', {
    roadId: props.road.roadId,
});

// Modal control functions
const handleClose = () => emit('close');
const handleOutsideClick = e => e.target.classList.contains('modal-backdrop') && handleClose();
</script>

<template>
    <teleport to="body">
        <div v-if="show" class="modal-backdrop fixed inset-0 flex items-center justify-center z-50"
            style="background-color: rgba(0, 0, 0, 0.7);" @click="handleOutsideClick">
            <div @click.stop
                class="bg-[#1b1a1a] text-white rounded-lg shadow-xl w-96 mx-4 overflow-hidden animate-modal-in">
                <!-- Modal header -->
                <div class="bg-[#252424] px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 class="text-lg font-semibold">Delete This Road ? <br> <span class="font-normal text-sm">{{ roadName }}</span></h3>
                    <button @click="handleClose" class="text-gray-400 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Form content -->
                <div class="p-6">
                    <form @submit.prevent="handleSave">
                        <div>
                            <p class="text-sm text-gray-400 mb-4">
                                Are you sure you want to delete this road?
                            </p>
                        </div>

                        <!-- Action buttons -->
                        <div class="flex justify-end space-x-3 mt-6">
                            <button type="button" @click="handleClose"
                                class="px-4 py-2 cursor-pointer rounded-md border border-gray-700 hover:bg-gray-700 transition-colors">
                                Cancel
                            </button>
                            <button type="submit"
                                class="px-4 py-2 cursor-pointer bg-red-600 hover:bg-red-700 rounded-md transition-colors">
                                Delete Road
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </teleport>
</template>

<style scoped>
.animate-modal-in {
    animation: modal-in 0.3s ease-out forwards;
}

@keyframes modal-in {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>