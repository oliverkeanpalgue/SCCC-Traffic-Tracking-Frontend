<script setup>
import { ref, onMounted, onUnmounted, defineEmits, defineProps, computed, watch } from 'vue'
import { useDatabaseStore } from '../../stores/databaseStore'
import axiosClient from "../../axios";
import { ClAddPlus } from '@kalimahapps/vue-icons';
import { ChMenuMeatball } from "@kalimahapps/vue-icons";
import AddCategoryModal from './Modals/AddCategoryModal.vue';
import UpdateCategoryModal from './Modals/UpdateCategoryModal.vue';
import DeleteConfirmationModal from '../ConfirmationModal.vue';
import emitter from '../../eventBus';
const API_KEY = import.meta.env.VITE_API_KEY;

// FOR THE ADD CATEGORY MODAL
const isOpenAddCategoryModal = ref(false);

const OpenAddCategoryModal = () => {
    isOpenAddCategoryModal.value = true;

}

// fetching data
const databaseStore = useDatabaseStore()

onMounted(() => {
  databaseStore.fetchData()
})

// for search function
const searchQuery = ref("");

const filteredCategories = computed(() => {
    return databaseStore.categoryList
        .filter((category) => !category.is_deleted) 
        .filter(category =>
            category.category_name.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
});

// Reset to first page when searching
watch(searchQuery, () => {
    currentPage.value = 1;
});

// for pagination
const currentPage = ref(1);
const itemsPerPage = ref(5);

const totalPages = computed(() => {
    return Math.ceil(filteredCategories.value.length / itemsPerPage.value);
});

// Get paginated transactions
const paginatedCategories = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;

    return filteredCategories.value.slice(start, end);
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

// Action Dropdown
const openDropdownId = ref(null);

const toggleDropdown = (transactionId) => {
    openDropdownId.value = openDropdownId.value === transactionId ? null : transactionId;
};

// FOR THE UPDATE CATEGORY MODAL
const isOpenUpdateCategoryModal = ref(false);

const OpenUpdateCategoryModal = () => {
    isOpenUpdateCategoryModal.value = true;
}

// FOR DELETE
const showDeleteConfirmationModal = ref(false)

const confirmDeleteCategory = async (confirmed, categoryId) => {
    if (confirmed) {
        try {
            const deleteCategory = {
                is_deleted: 1
            }

            const response = await axiosClient.put(`api/categories/${categoryId}`, deleteCategory,
                {
                    headers: { 'x-api-key': API_KEY },
                });

            console.log('Delete Category API response:', response);

            databaseStore.categoryList = databaseStore.categoryList.filter(category => category.id !== categoryId);

            console.log(`Category deleted successfully.`);
            emitter.emit("show-toast", { message: "Category deleted successfully!", type: "success" });
        } catch (error) {
            console.error('Error deleting category:', error);
            emitter.emit("show-toast", { message: "Error deleting category. Please try again.", type: "error" });
        } finally {
            showDeleteConfirmationModal.value = false; // Close the modal
        }
    }
}

</script>

<template>
    <div class="overflow-x-auto">
        <div class="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
            <!-- Search Box -->
            <div class="w-full md:w-8/9">
                <form class="flex items-center">
                    <label for="simple-search" class="sr-only">Search</label>
                    <div class="relative w-full">
                        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg aria-hidden="true" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor"
                                viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd"
                                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                    clip-rule="evenodd" />
                            </svg>
                        </div>
                        <input v-model="searchQuery" type="text" id="simple-search"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                            placeholder="Search categories..." />
                    </div>
                </form>
            </div>

            <button @click.stop="OpenAddCategoryModal()"
                class="flex items-center justify-center border w-1/9 px-2 py-1 rounded-lg dark:border-gray-600 dark:bg-green-800 dark:hover:bg-green-700">
                <ClAddPlus class="w-8 h-8" />
                <p class="ml-1">Add Category</p>
            </button>
        </div>
        <table class="w-full border-collapse text-sm text-gray-300 rounded-lg">
            <thead>
                <tr class="bg-gray-700 text-gray-200 uppercase text-center text-xs rounded-lg">
                    <th class="px-4 py-2 border-b border-gray-600">ID</th>
                    <th class="px-4 py-2 border-b border-gray-600">Category Name</th>
                    <th class="px-4 py-2 border-b border-gray-600">Items</th>
                    <th class="px-4 py-2 border-b border-gray-600">Actions</th>
                </tr>
            </thead>
            <tbody class='overflow-auto text-center'>
                <tr v-for="category in paginatedCategories" :key="category.id"
                    class="odd:bg-gray-800 even:bg-gray-750 hover:bg-gray-700 transition">
                    <td class="px-4 py-3 ">{{ category.id }}</td>
                    <td class="px-4 py-3">
                        {{ category.category_name }}
                    </td>
                    <td class="px-4 py-3 ">
                        Napipindot na button
                    </td>
                    <td class="px-4 py-3 flex items-center justify-center relative">
                        <button @click.stop="toggleDropdown(category.id)"
                            class="inline-flex items-center p-0.5 text-sm font-medium text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100"
                            type="button">
                            <ChMenuMeatball class="w-5 h-5" />
                        </button>

                        <div v-if="openDropdownId === category.id" ref="dropdownRefs"
                            class="absolute z-[10] bg-white divide-gray-100 rounded-lg right-42 shadow-sm w-44 border-2 dark:border-gray-600 dark:bg-gray-800">
                            <ul class="text-sm text-gray-700 dark:text-gray-200">
                                <li class="block hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                    <button @click.stop="OpenUpdateCategoryModal()" class="w-full text-start px-4 py-2">
                                        Update
                                    </button>

                                    <UpdateCategoryModal v-if="isOpenUpdateCategoryModal"
                                        v-model="isOpenUpdateCategoryModal" :category="category" @click.stop />
                                </li>
                                <li class="block hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                    <button @click="showDeleteConfirmationModal = true"
                                        class="w-full text-start px-4 py-2">
                                        Delete
                                    </button>

                                    <!-- Delete Confirmation Modal -->
                                    <DeleteConfirmationModal v-model="showDeleteConfirmationModal"
                                        title="Confirm Deletion" :message="`You are about to delete this category.`"
                                        :messageData="`\nCategory Name: ${category.category_name}`" cancelText="Cancel"
                                        confirmText="Confirm Deleting"
                                        @confirm="() => confirmDeleteCategory(true, category.id)" />
                                </li>
                            </ul>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        <nav class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4"
            aria-label="Table navigation">
            <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
                Showing
                <span class="font-semibold text-gray-900 dark:text-white">
                    {{ (currentPage - 1) * itemsPerPage + 1 }} -
                    {{ Math.min(currentPage * itemsPerPage, filteredCategories.length) }}
                </span>
                of
                <span class="font-semibold text-gray-900 dark:text-white">{{ filteredCategories.length
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

        <AddCategoryModal v-if="isOpenAddCategoryModal" v-model="isOpenAddCategoryModal" @click. stop />
    </div>
</template>