<script setup>
import { defineProps, defineEmits, ref } from 'vue';
import RoadEditModal from './RoadEditModal.vue';
import RoadDeleteModal from './RoadDeleteModal.vue';
import defaultRoadImage from '../../assets/1.png';

// Define component props with defaults for optional fields
const props = defineProps({
    roadId: { type: [String, Number], required: true },
    roadName: { type: String, required: true },
    directionText: { type: String, default: '' },
    trafficStatus: { type: String, default: '' },
    roadImage: { type: String, default: defaultRoadImage },
    roadType: { type: String, default: 'Street' }
});

// Event handlers
const emit = defineEmits(['edit', 'delete', 'update']);
const showEditModal = ref(false);
const showDeleteModal = ref(false);

// Action handlers - using compact arrow functions
const handleEdit = () => showEditModal.value = true;
const handleDelete = () => showDeleteModal.value = true;
const handleSaveRoad = (updatedRoad) => {
    emit('update', updatedRoad);
    showEditModal.value = false;
};
const handleCloseModal = () => showEditModal.value = false;
</script>

<template>
    <div class="bg-[#1b1a1a] text-white rounded-2xl overflow-hidden shadow-lg w-full max-w-[320px]">
        <!-- Road image preview -->
        <div class="w-full h-[200px] overflow-hidden">
            <img :src="roadImage" :alt="roadName" class="w-full h-full object-cover" />
        </div>

        <!-- Road information -->
        <div class="p-3">
            <h3 class="text-base font-bold mb-1">{{ roadName }}</h3>
            <p class="text-sm mb-1">{{ directionText }}</p>
            <p class="text-sm text-gray-400">Type: {{ roadType }}</p>
        </div>

        <!-- Action buttons -->
        <div class="w-full flex py-2">
            <!-- Edit button -->
            <div class="w-1/2 flex flex-col items-center">
                <button @click="handleEdit" 
                    class="w-12 h-12 rounded-full border border-green-500 flex items-center justify-center text-green-500 hover:bg-green-500/20 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-10 10a2 2 0 01-1.414.586H3a1 1 0 01-1-1v-2a2 2 0 01.586-1.414l10-10z" />
                    </svg>
                </button>
                <span class="text-green-500 text-sm mt-1">Edit</span>
            </div>
            
            <!-- Delete button -->
            <div class="w-1/2 flex flex-col items-center">
                <button @click="handleDelete"
                    class="w-12 h-12 cursor-pointer rounded-full border border-red-500 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                </button>
                <span class="text-red-500 text-sm mt-1">Delete</span>
            </div>
        </div>

        <!-- Edit modal - appears when showEditModal is true -->
        <RoadEditModal 
            :show="showEditModal" 
            :road="{ roadId, roadName, directionText, trafficStatus, roadType, roadImage }"
            @close="handleCloseModal"
            @save="handleSaveRoad"
        />

        <RoadDeleteModal 
            :show="showDeleteModal" 
            :road="{ roadId, roadName }"
            @close="showDeleteModal = false"
            @delete="emit('delete', roadId)"
        />
    </div>
</template>