<script setup>
import { ref, onMounted, onUnmounted, defineEmits, defineProps, computed, watch } from 'vue'
import { ClAddPlus } from '@kalimahapps/vue-icons';
import UpdateEquipmentCopy from '../Modals/AddEquipmentCopy.vue';

const isOpenUpdateEquipmentCopyModal = ref(false);

const OpenUpdateEquipmentCopyModal = () => {
    isOpenUpdateEquipmentCopyModal.value = true;
}

const props = defineProps({
    selectedItem: Object,
    equipmentCopies: Object,
})

const searchQuery = ref("");

const filteredEquipmentCopies = computed(() => {
    const searchTerm = searchQuery.value.toLowerCase();

    return props.equipmentCopies
        .filter(copy => copy.item_id === props.selectedItem.id)
        .filter(copy => {
            // Search by copy number
            const copyId = copy.copy_num?.toString().toLowerCase() || "";

            // Search by equipment name + copy number combined
            const equipmentWithCopy = `${props.selectedItem.equipment_name} #${copy.copy_num}`.toLowerCase();

            // Search by availability status
            const status = copy.is_available ? "available" : "not available";

            // Return true if any field matches the search term
            return copyId.includes(searchTerm) ||
                equipmentWithCopy.includes(searchTerm) ||
                status.includes(searchTerm);
        });
});

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(5);

// Compute total pages based on filtered transactions
const totalPages = computed(() => {
    return Math.ceil(filteredEquipmentCopies.value.length / itemsPerPage.value);
});

// Get paginated transactions
const paginatedTransactions = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;

    return filteredEquipmentCopies.value.slice(start, end);
});

// Pagination controls
const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++;
    }
};

const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--;
    }
};

const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
};

// Reset to first page when searching
watch(searchQuery, () => {
    currentPage.value = 1;
});

</script>

<template>
    <div class="bg-black px-6 p-4 rounded-xl">
        <div class=" items-center ">
            <p class="ml-2 mb-4 w-full text-xl font-semibold rounded-lg">Copies of {{ selectedItem.equipment_name }}:
            </p>
        </div>
        <div class="overflow-x-auto rounded-lg dark:bg-gray-800 ">
            <div class="grid grid-cols-6 p-4    flex justify-center">
                <!-- Search Box -->
                <div class="w-full col-span-5">
                    <form class="flex items-center" @submit.prevent>
                        <label for="simple-search" class="sr-only">Search</label>
                        <div class="relative w-full">
                            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg aria-hidden="true" class="w-5 h-5 text-gray-500 dark:text-gray-400"
                                    fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd"
                                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                        clip-rule="evenodd" />
                                </svg>
                            </div>
                            <input v-model="searchQuery" type="text" id="simple-search"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                placeholder="Search equipment copies..." />
                        </div>
                    </form>
                </div>
                <!-- ADD COPY BUTTON -->
                <button @click.stop="OpenUpdateEquipmentCopyModal()"
                    class="flex items-center justify-center mx-auto px-6 py-1 rounded-lg dark:border-gray-600 dark:bg-green-800 dark:hover:bg-green-700">
                    <ClAddPlus class="w-8 h-6" />
                    <p class="ml-1">Add a Copy</p>
                </button>
            </div>
            <table class="w-full border-collapse text-sm text-gray-300 rounded-lg dark:bg-gray-900">
                <thead>
                    <tr class="bg-gray-700 text-gray-200 uppercase text-left text-xs rounded-lg">
                        <th class="px-4 py-2 border-b border-gray-600">Copy ID</th>
                        <th class="px-4 py-2 border-b border-gray-600">Available</th>
                        <th class="px-4 py-2 border-b border-gray-600">Borrow History</th>
                        <th class="px-4 py-2 border-b border-gray-600">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="equipmentCopy in paginatedTransactions" :key="equipmentCopy.id"
                        class="odd:bg-gray-800 even:bg-gray-750 hover:bg-gray-700 transition">
                        <td class="px-4 py-3 border-b border-gray-700">{{ selectedItem.equipment_name ||
                            selectedItem.supply_name }} #{{ equipmentCopy.copy_num }}</td>
                        <td class="px-4 py-3 border-b border-gray-700">
                            {{ equipmentCopy.is_available ? 'Available' : 'Not Available' }}
                        </td>
                        <td class="px-4 py-3 border-b border-gray-700">...</td>
                        <td class="px-4 py-3 border-b border-gray-700">...</td>
                    </tr>
                </tbody>
            </table>
            <nav class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4"
                aria-label="Table navigation">
                <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
                    Showing
                    <span class="font-semibold text-gray-900 dark:text-white">
                        {{ (currentPage - 1) * itemsPerPage + 1 }} -
                        {{ Math.min(currentPage * itemsPerPage, filteredEquipmentCopies.length) }}
                    </span>
                    of
                    <span class="font-semibold text-gray-900 dark:text-white">{{ filteredEquipmentCopies.length
                        }}</span>
                </span>

                <ul class="inline-flex items-stretch -space-x-px">
                    <li>
                        <button @click="prevPage" :disabled="currentPage === 1" class="flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white rounded-l-lg border border-gray-300 
                     hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 
                     dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
                            <span class="sr-only">Previous</span>
                            <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd"
                                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                    clip-rule="evenodd" />
                            </svg>
                        </button>
                    </li>

                    <li v-for="page in totalPages" :key="page">
                        <button @click="goToPage(page)"
                            :class="['flex items-center justify-center text-sm py-2 px-3 leading-tight border',
                                page === currentPage
                                    ? 'text-primary-600 bg-primary-50 border-primary-300 hover:bg-primary-100 hover:text-primary-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white'
                                    : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white']">
                            {{ page }}
                        </button>
                    </li>

                    <li>
                        <button @click="nextPage" :disabled="currentPage === totalPages" class="flex items-center justify-center h-full py-1.5 px-3 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 
                     hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 
                     dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
                            <span class="sr-only">Next</span>
                            <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clip-rule="evenodd" />
                            </svg>
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
        <UpdateEquipmentCopy v-if="isOpenUpdateEquipmentCopyModal" v-model="isOpenUpdateEquipmentCopyModal"
            :selectedItems="selectedItem" :equipmentCopies="filteredEquipmentCopies" @click.stop />
    </div>
</template>