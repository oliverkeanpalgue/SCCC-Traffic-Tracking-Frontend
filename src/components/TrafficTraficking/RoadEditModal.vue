<script setup>
import { ref, defineProps, defineEmits, onMounted, watch } from 'vue';
import defaultRoadImage from '../../assets/1.png';

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    road: {
        type: Object,
        required: true,
        default: () => ({
            roadId: null,
            roadName: '',
            directionText: '',
            trafficStatus: '',
            roadType: 'Street',
            roadImage: defaultRoadImage
        })
    }
});

const emit = defineEmits(['close', 'save']);

// Form data refs
const roadName = ref('');
const directionText = ref('');
const trafficStatus = ref('');
const roadType = ref('');
const roadImage = ref('');

// Reset form with road data
const resetForm = () => {
    roadName.value = props.road.roadName;
    directionText.value = props.road.directionText;
    trafficStatus.value = props.road.trafficStatus;
    roadType.value = props.road.roadType;
    roadImage.value = props.road.roadImage;
};

// Initialize form when modal opens
watch(() => props.show, (newVal) => {
    if (newVal) {
        resetForm();
    }
}, { immediate: true });

// Save changes
const handleSave = () => {
    const updatedRoad = {
        roadId: props.road.roadId,
        roadName: roadName.value,
        directionText: directionText.value,
        trafficStatus: trafficStatus.value,
        roadType: roadType.value,
        roadImage: roadImage.value
    };

    emit('save', updatedRoad);
};

// Close modal
const handleClose = () => {
    emit('close');
};

// Handle clicking outside the modal
const handleOutsideClick = (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
        handleClose();
    }
};
</script>

<template>
    <teleport to="body">
        <div v-if="show" class="modal-backdrop fixed inset-0 flex items-center justify-center z-50"
            style="background-color: rgba(0, 0, 0, 0.7);" @click="handleOutsideClick">
            <div @click.stop
                class="bg-[#1b1a1a] text-white rounded-lg shadow-xl w-full max-w-4xl mx-4 overflow-hidden animate-modal-in">
                <!-- Header -->
                <div class="bg-[#252424] px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 class="text-lg font-semibold">Edit Road Information</h3>
                    <button @click="handleClose" class="text-gray-400 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Body -->
                <div class="p-6">
                    <form @submit.prevent="handleSave">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Left Column -->
                            <div>
                                <!-- Road Name -->
                                <div class="mb-4">
                                    <label for="roadName" class="block text-sm font-medium mb-1">Road Name</label>
                                    <input id="roadName" v-model="roadName" type="text"
                                        class="w-full px-4 py-2 bg-[#2d2c2c] rounded border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                                        required />
                                </div>

                                <!-- Direction -->
                                <div class="mb-4">
                                    <label for="direction" class="block text-sm font-medium mb-1">Direction</label>
                                    <input id="direction" v-model="directionText" type="text"
                                        class="w-full px-4 py-2 bg-[#2d2c2c] rounded border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none" />
                                </div>

                                <!-- Traffic Status -->
                                <div class="mb-4">
                                    <label for="status" class="block text-sm font-medium mb-1">Traffic Status</label>
                                    <select id="status" v-model="trafficStatus"
                                        class="w-full px-4 py-2 bg-[#2d2c2c] rounded border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none">
                                        <option value="">Select status</option>
                                        <option value="Heavy">Heavy</option>
                                        <option value="Moderate">Moderate</option>
                                        <option value="Light">Light</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Right Column -->
                            <div>
                                <!-- Road Type -->
                                <div class="mb-4">
                                    <label for="roadType" class="block text-sm font-medium mb-1">Road Type</label>
                                    <input id="roadType" v-model="roadType" type="text"
                                        class="w-full px-4 py-2 bg-[#2d2c2c] rounded border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none" />
                                </div>

                                <!-- Road Image URL -->
                                <div class="mb-4">
                                    <label for="imageUrl" class="block text-sm font-medium mb-1">Image URL</label>
                                    <input id="imageUrl" v-model="roadImage" type="text"
                                        class="w-full px-4 py-2 bg-[#2d2c2c] rounded border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none" />
                                </div>

                                <!-- Image Preview -->
                                <div class="mb-4">
                                    <p class="text-sm font-medium mb-1">Preview</p>
                                    <div class="w-full h-[148px] bg-gray-800 rounded overflow-hidden">
                                        <img :src="roadImage" alt="Road Preview" class="w-full h-full object-cover" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Action Buttons - Full Width -->
                        <div class="flex justify-end space-x-3 mt-6">
                            <button type="button" @click="handleClose"
                                class="px-4 py-2 rounded-md border border-gray-600 hover:bg-gray-700 transition-colors">
                                Cancel
                            </button>
                            <button type="submit"
                                class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md transition-colors">
                                Save Changes
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
    from {
        opacity: 0;
        transform: translateY(-20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>