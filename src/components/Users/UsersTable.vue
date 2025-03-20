<script setup>
import { ref, onMounted, onUnmounted, defineEmits, defineProps, computed, watch } from 'vue'
import axiosClient from "../../axios";
import { ChMenuMeatball } from "@kalimahapps/vue-icons";
import { ClAddPlus } from '@kalimahapps/vue-icons';
import UpdateUsersModal from "./Modals/UpdateUsersModal.vue";
import UpdateUsersPasswordModal from "./Modals/UpdateUsersPasswordModal.vue";
import DeleteConfirmationModal from '../ConfirmationModal.vue';
import emitter from '../../eventBus';

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

// Action Dropdown
const openDropdownId = ref(null);

const toggleDropdown = (userId) => {
    openDropdownId.value = openDropdownId.value === userId ? null : userId;
};

// FOR THE UPDATE USER MODAL
const isOpenUpdateUsersModal = ref(false);

const OpenUpdateUsersModal = () => {
    isOpenUpdateUsersModal.value = true;
}

// FOR THE UPDATE USER PASSWORD MODAL
const isOpenUpdateUsersPasswordModal = ref(false);

const OpenUpdateUsersPasswordModal = () => {
    isOpenUpdateUsersPasswordModal.value = true;
}

// FOR DELETE
const showDeleteConfirmationModal = ref(false)

const confirmDeleteUser = async (confirmed, userId) => {
    if (confirmed) {
        try {
            const deleteUser = {
                is_deleted: 1
            }

            const response = await axiosClient.put(`api/users/${userId}`, deleteUser,
                {
                    headers: { 'x-api-key': API_KEY },
                });

            console.log('Delete User API response:', response);

            userList.value = userList.value.filter(user => user.id !== userId);

            console.log(`User deleted successfully.`);
            emitter.emit("show-toast", { message: "User deleted successfully!", type: "success" });
        } catch (error) {
            console.error('Error deleting user:', error);
            emitter.emit("show-toast", { message: "Error deleting user. Please try again.", type: "error" });
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
            <div class="w-full md:w-9/9">
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
        <table class="w-full border-collapse text-sm text-center text-gray-300 rounded-lg">
            <thead>
                <tr class="bg-gray-700 text-gray-200 uppercase text-center text-xs rounded-lg">
                    <th class="px-4 py-2 ">ID</th>
                    <th class="px-4 py-2 ">First Name</th>
                    <th class="px-4 py-2 ">Middle Name</th>
                    <th class="px-4 py-2 ">Last Name</th>
                    <th class="px-4 py-2 ">Email</th>
                    <th class="px-4 py-2 ">Transactions</th>
                    <th class="px-4 py-2 ">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="user in paginatedUsers" :key="user.id"
                    class="odd:bg-gray-800 even:bg-gray-750 hover:bg-gray-700 transition">
                    <td class="px-4 py-3 ">{{ user.id }}</td>
                    <td class="px-4 py-3 ">
                        {{ user.firstName }}
                    </td>
                    <td class="px-4 py-3 ">
                        {{ user.middleName }}
                    </td>
                    <td class="px-4 py-3 ">
                        {{ user.lastName }}
                    </td>
                    <td class="px-4 py-3 ">
                        {{ user.email }}
                    </td>
                    <td class="px-4 py-3 ">
                        Napipindot na button
                    </td>
                    <td class="px-4 py-3 flex items-center justify-center relative">
                        <button @click.stop="toggleDropdown(user.id)"
                            class="inline-flex items-center p-0.5 text-sm font-medium text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100"
                            type="button">
                            <ChMenuMeatball class="w-5 h-5" />
                        </button>

                        <div v-if="openDropdownId === user.id" ref="dropdownRefs"
                            class="absolute z-[10] bg-white divide-gray-100 rounded-lg right-23 shadow-sm w-44 border-2 dark:border-gray-600 dark:bg-gray-800">
                            <ul class="text-sm text-gray-700 dark:text-gray-200">
                                <li class="block hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                    <button @click.stop="OpenUpdateUsersModal()" class="w-full text-start px-4 py-2">
                                        Update
                                    </button>

                                    <UpdateUsersModal v-if="isOpenUpdateUsersModal"
                                        v-model="isOpenUpdateUsersModal" :user="user" @click.stop />
                                </li>
                                <li class="block hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                    <button @click.stop="OpenUpdateUsersPasswordModal()" class="w-full text-start px-4 py-2">
                                        Change Password
                                    </button>

                                    <UpdateUsersPasswordModal v-if="isOpenUpdateUsersPasswordModal"
                                        v-model="isOpenUpdateUsersPasswordModal" :user="user" @click.stop />
                                </li>
                                <li class="block hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                    <button @click="showDeleteConfirmationModal = true"
                                        class="w-full text-start px-4 py-2">
                                        Delete
                                    </button>

                                    <!-- Delete Confirmation Modal -->
                                    <DeleteConfirmationModal v-model="showDeleteConfirmationModal"
                                        title="Confirm Deletion" :message="`You are about to delete this user.`"
                                        :messageData="`\nName: ${user.firstName} ${user.middleName} ${user.lastName}\nEmail: ${user.email}`" cancelText="Cancel"
                                        confirmText="Confirm Deleting"
                                        @confirm="() => confirmDeleteUser(true, user.id)" />
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