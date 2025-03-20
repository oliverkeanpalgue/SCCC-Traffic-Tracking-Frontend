<script setup>
import { ref, onMounted, onUnmounted, defineEmits, defineProps, computed, watch } from 'vue'
import axiosClient from "../../axios";

const API_KEY = import.meta.env.VITE_API_KEY;

// fetching users
const userList = ref([])

const fetchUsers = async () => {
    console.log('Fetching users...');
    try {
        const response = await axiosClient.get('api/users', {
            headers: {
                'x-api-key': API_KEY,
            },
        });
        console.log('Users fetched:', response.data);
        userList.value = response.data
    } catch (error) {
        console.error('Error fetching users:', error);
    }
};

onMounted(() => {
    fetchUsers();
});

// for search function 
const searchQuery = ref("")

const filteredUsers = computed(() => {
    return userList.value
        .filter((user) => !user.is_deleted)
        .filter(user =>
            user?.fistName?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            user?.middleName?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            user?.lastName?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            user?.email?.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
});

watch(searchQuery, () => {
    currentPage.value = 1;
});

// for pagination
const currentPage = ref(1);
const itemsPerPage = ref(5);

const totalPages = computed(() => {
    return Math.ceil(filteredUsers.value.length / itemsPerPage.value);
});

// Get paginated transactions
const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;

    return filteredUsers.value.slice(start, end);
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

</script>

<template>
    <div class="overflow-x-auto">
        <div class="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
            <!-- Search Box -->
            <div class="w-full md:w-4/5">
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
                            placeholder="Search equipment copies..." />
                    </div>
                </form>
            </div>
        </div>
        <table class="w-full border-collapse text-sm text-gray-300 rounded-lg">
            <thead>
                <tr class="bg-gray-700 text-gray-200 uppercase text-left text-xs rounded-lg">
                    <th class="px-4 py-2 border-b border-gray-600">ID</th>
                    <th class="px-4 py-2 border-b border-gray-600">First Name</th>
                    <th class="px-4 py-2 border-b border-gray-600">Middle Name</th>
                    <th class="px-4 py-2 border-b border-gray-600">Last Name</th>
                    <th class="px-4 py-2 border-b border-gray-600">Email</th>
                    <th class="px-4 py-2 border-b border-gray-600">Transactions</th>
                    <th class="px-4 py-2 border-b border-gray-600">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="users in paginatedUsers" :key="users.id"
                    class="odd:bg-gray-800 even:bg-gray-750 hover:bg-gray-700 transition">
                    <td class="px-4 py-3 border-b border-gray-700">{{ users.id }}</td>
                    <td class="px-4 py-3 border-b border-gray-700">
                        {{ users.fistName }}
                    </td>
                    <td class="px-4 py-3 border-b border-gray-700">
                        {{ users.middleName }}
                    </td>
                    <td class="px-4 py-3 border-b border-gray-700">
                        {{ users.lastName }}
                    </td>
                    <td class="px-4 py-3 border-b border-gray-700">
                        {{ users.email }}
                    </td>
                    <td class="px-4 py-3 border-b border-gray-700">
                        Napipindot na button
                    </td>
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
                    {{ Math.min(currentPage * itemsPerPage, filteredUsers.length) }}
                </span>
                of
                <span class="font-semibold text-gray-900 dark:text-white">{{ filteredUsers.length
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

</template>