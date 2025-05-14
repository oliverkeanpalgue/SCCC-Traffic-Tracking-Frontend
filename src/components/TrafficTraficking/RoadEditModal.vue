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
            roadName: '',
            directionText: '',
            trafficStatus: '',
            roadType: 'Street',
            roadImage: defaultRoadImage
        })
    }
});

const emit = defineEmits(['close', 'save']);

// Form field refs
const roadName = ref('');
const directionText = ref('');
const trafficStatus = ref('');
const roadType = ref('');
const roadImage = ref('');

// Reset form when modal opens
watch(() => props.show, visible => visible && resetForm(), { immediate: true });

// Populate form with road data
const resetForm = () => {
    Object.entries({ roadName, directionText, trafficStatus, roadType, roadImage })
        .forEach(([key, ref]) => ref.value = props.road[key]);
};

// Save changes and emit updated road
const handleSave = () => emit('save', {
    roadId: props.road.roadId,
    roadName: roadName.value,
    directionText: directionText.value,
    trafficStatus: trafficStatus.value,
    roadType: roadType.value,
    roadImage: roadImage.value
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
                class="bg-[#1b1a1a] text-white rounded-lg shadow-xl w-full max-w-4xl mx-4 overflow-hidden animate-modal-in">
                <!-- Modal header -->
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

                <!-- Form content -->
                <div class="p-6">
                    <form @submit.prevent="handleSave">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Left Column -->
                            <div>
                                <!-- Form fields: name, direction, status -->
                                <div v-for="(field, idx) in [
                                    {id: 'roadName', label: 'Road Name', model: roadName, type: 'text', required: true},
                                    {id: 'direction', label: 'Direction', model: directionText, type: 'text'},
                                    {id: 'status', label: 'Traffic Status', model: trafficStatus, type: 'select', 
                                        options: [{value: '', text: 'Select status'}, 
                                                 {value: 'Heavy', text: 'Heavy'},
                                                 {value: 'Moderate', text: 'Moderate'}, 
                                                 {value: 'Light', text: 'Light'}]}
                                ]" :key="idx" class="mb-4">
                                    <label :for="field.id" class="block text-sm font-medium mb-1">{{ field.label }}</label>
                                    
                                    <select v-if="field.type === 'select'" :id="field.id" v-model="field.model"
                                        class="w-full px-4 py-2 bg-[#2d2c2c] rounded border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none">
                                        <option v-for="opt in field.options" :key="opt.value" :value="opt.value">{{ opt.text }}</option>
                                    </select>
                                    
                                    <input v-else :id="field.id" v-model="field.model" :type="field.type" :required="field.required"
                                        class="w-full px-4 py-2 bg-[#2d2c2c] rounded border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none" />
                                </div>
                            </div>

                            <!-- Right Column -->
                            <div>
                                <!-- Road type field -->
                                <div class="mb-4">
                                    <label for="roadType" class="block text-sm font-medium mb-1">Road Type</label>
                                    <input id="roadType" v-model="roadType" type="text"
                                        class="w-full px-4 py-2 bg-[#2d2c2c] rounded border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none" />
                                </div>

                                <!-- Image URL field -->
                                <div class="mb-4">
                                    <label for="imageUrl" class="block text-sm font-medium mb-1">Image URL</label>
                                    <input id="imageUrl" v-model="roadImage" type="text"
                                        class="w-full px-4 py-2 bg-[#2d2c2c] rounded border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none" />
                                </div>

                                <!-- Image preview -->
                                <div class="mb-4">
                                    <p class="text-sm font-medium mb-1">Preview</p>
                                    <div class="w-full h-[148px] bg-gray-800 rounded overflow-hidden">
                                        <img :src="roadImage" alt="Road Preview" class="w-full h-full object-cover" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Action buttons -->
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
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>