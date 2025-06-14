<script setup>
import { ref, onMounted, onUnmounted, defineEmits, defineProps, computed, watch } from 'vue'
import axiosClient from "../../axios";
import { ChMenuMeatball } from "@kalimahapps/vue-icons";
import { ClAddPlus } from '@kalimahapps/vue-icons';
import UpdateUsersModal from "./Modals/UpdateUsersModal.vue";
import UpdateUsersPasswordModal from "./Modals/UpdateUsersPasswordModal.vue";
import DeleteConfirmationModal from '../ConfirmationModal.vue';
import emitter from '../../eventBus';
import { useDatabaseStore } from '../../stores/databaseStore'
import Loading from '../../components/Loading.vue';
import baguioLogo from '../../assets/baguio-logo.png';
import { AnFilledPrinter } from '@kalimahapps/vue-icons';
// import ViewTransactionHistoryModal from '../../components/ViewTransactionHistoryModal.vue';
import AccessCheckbox from './AccessCheckbox.vue';
import { useRouter } from 'vue-router';

const API_KEY = import.meta.env.VITE_API_KEY;

// fetching data
const databaseStore = useDatabaseStore()

let refreshInterval = null;

onMounted(() => {
    databaseStore.fetchData()
    refreshInterval = setInterval(() => {
        databaseStore.fetchData()
    }, 30000)
})

onUnmounted(() => {
    clearInterval(refreshInterval)
})

// for search function 
const searchQuery = ref("")

const filteredUsers = computed(() => {
    return databaseStore.users
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
const itemsPerPage = ref(7);

const totalPages = computed(() => {
    return Math.ceil(filteredUsers.value.length / itemsPerPage.value);
});


const sortedUsers = computed(() => {
    const users = [...filteredUsers.value];

    return users.sort((a, b) => {
        const getFieldValue = (user, field) => {
            switch (field) {
                case 'id':
                    return user.id;

                case 'first_name':
                    return user.firstName?.toLowerCase() || '';

                case 'middle_name':
                    return user.middleName?.toLowerCase() || '';

                case 'last_name':
                    return user.lastName?.toLowerCase() || '';

                case 'email':
                    return user.email?.toLowerCase() || '';

                default:
                    return '';
            }
        };

        const aVal = getFieldValue(a, sortBy.value);
        const bVal = getFieldValue(b, sortBy.value);

        if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1;
        return 0;
    });
});

const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return sortedUsers.value.slice(start, end);
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
            // emitter.emit("show-toast", { message: "User deleted successfully!", type: "success" });
        } catch (error) {
            console.error('Error deleting user:', error);
            emitter.emit("show-toast", { message: "Error deleting user. Please try again.", type: "error" });
        } finally {
            await databaseStore.fetchData();
            emitter.emit("show-toast", { message: "User deleted successfully!", type: "success" });
            showDeleteConfirmationModal.value = false; // Close the modal
        }
    }
}

const sortBy = ref("id");
const sortDirection = ref("asc");

const sortByField = (field) => {
    currentPage.value = 1;
    if (sortBy.value === field) {
        sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
    } else {
        sortBy.value = field;
        sortDirection.value = "asc";
    }
};

const isLoading = computed(() => {
    return (
        databaseStore.transactionItems.length === 0 ||
        databaseStore.transactionHistory.length === 0 ||
        databaseStore.officeEquipments.length === 0 ||
        databaseStore.officeSupplies.length === 0 ||
        databaseStore.officeList.length === 0 ||
        databaseStore.users.length === 0 ||
        databaseStore.borrowers.length === 0 ||
        databaseStore.equipmentCopies.length === 0 ||
        databaseStore.categoryList.length === 0 ||
        databaseStore.inventoryAccesses.length === 0
    );
});

// for printing reports
const handlePrint = async () => {


    const printWindow = window.open('', '_blank', 'width=800,height=600');

    // Wait for the image to load
    await new Promise((resolve) => {
        const img = new Image();
        img.src = baguioLogo;
        img.onload = resolve;
        img.onerror = resolve; // Avoid hanging if image fails
    });

    // Wait for the reports data to be fully available
    await new Promise((resolve) => {
        setTimeout(resolve, 100); // Small delay to ensure data is processed
    });

    printWindow.document.write(`
    <html>
        <head>
            <title>Printed Borrowers Reports</title>
            <style>
                body { font-family: Arial, sans-serif; }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-bottom: 20px; 
                }
                th, td { 
                    border: 1px solid #ddd; 
                    padding: 8px; 
                    text-align: left; 
                }
                th { 
                    background-color: #f2f2f2; 
                    font-weight: bold; 
                }
                .print-header {
                    text-align: center;
                    margin-bottom: 20px;
                }
            </style>
        </head>
        <body>
            <div class="print-header">
                <img src="${baguioLogo}" alt="Logo" style="width: 100px; height: auto; display: block; margin: 20px auto;">
                <h1>Borrowers Management - Printed Report</h1>
                <p>Printed on: ${new Date().toLocaleString()}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Borrower Name</th>
                        <th>Email</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredUsers.value.map(report => `
                        <tr>
                            <td>${report.id}</td>
                            <td>${report.firstName} ${report.middleName} ${report.lastName}</td>
                            <td>${report.email}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="print-footer">
                <p>Total Users: ${filteredUsers.value.length}</p>
            </div>
        </body>
    </html>
`);

    printWindow.document.close();

    // Wait for the new window to finish rendering before printing
    await new Promise((resolve) => setTimeout(resolve, 500));

    printWindow.print();

    printWindow.onafterprint = () => {
        printWindow.close();
    };
};

const unreturnedCount = (userId) =>
    databaseStore.transactionHistory.filter(t =>
        t.lender_id === userId && t.return_date === null
    ).length;

const isOpenViewTransactionHistoryPage = ref(false);
const selectedUser = ref(null);

const router = useRouter();

const OpenViewTransactionHistoryPage = (user) => {
    selectedUser.value = user;

    router.push({
        name: 'Transactions',
        query: {
            user_id: selectedUser.value.id
        }
    });
}

const toggleCheckbox = (user, accessId, type) => {
    const access = databaseStore.inventoryAccesses.find(
        (inv) => inv.id === accessId && inv.user_id === user.id
    );

    if (!access) return;

    // Optimistically toggle the permission value
    access[type] = access[type] === 1 ? 0 : 1;

    const updateInventoryAccess = {
        id: accessId,
        user_id: user.id,
        for_dashboard: access.for_dashboard,
        for_inventory: access.for_inventory,
        for_categories: access.for_categories,
        for_borrowers: access.for_borrowers,
        for_offices: access.for_offices,
        for_users: access.for_users,
    };

    // Fire-and-forget async update
    axiosClient.put(
        `/api/inventory_access/${accessId}`,
        updateInventoryAccess,
        {
            headers: {
                "x-api-key": API_KEY,
            },
        }
    )
        .then(() => {

        })
        .catch((error) => {
            console.error('Error updating inventory access:', error);
            console.error('Error details:', error.response?.data);
            emitter.emit("show-toast", { message: "Error updating access. Please try again.", type: "error" });
        });
};

const permissionTypes = [
    'for_dashboard',
    'for_inventory',
    'for_categories',
    'for_borrowers',
    'for_offices',
    'for_users',
];
</script>

<template>
    <div>
        <div v-if="isLoading" class="h-[62vh] flex flex-col items-center justify-center">
            <Loading />
            <p class="text-gray-500 dark:text-gray-400">Fetching data...</p>
        </div>
        <div v-else class="overflow-x-auto">
            <div class="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                <!-- Search Box -->
                <div class="w-full md:w-8/9">
                    <form class="flex items-center">
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
                <button @click="handlePrint"
                    class="flex items-center justify-center border w-1/9 px-2 py-1 rounded-lg dark:border-gray-600 dark:bg-green-800 dark:hover:bg-green-700">
                    <AnFilledPrinter class="w-8 h-8" />
                    <p class="ml-1">Print Users</p>
                </button>
            </div>
            <div class="rounded-lg  min-h-[62vh] max-h-[62vh] dark:bg-gray-900">
                <table class="w-full text-sm text-center text-gray-500 dark:text-gray-400">
                    <thead class=" dark:bg-gray-600 dark:text-gray-300">
                        <tr class="bg-gray-700 text-gray-200 uppercase text-center text-xs rounded-lg">
                            <th class="py-3" @click="sortByField('id')">
                                ID
                                <span v-if="sortBy === 'id'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
                            </th>
                            <th class="py-3" @click="sortByField('first_name')">
                                First Name
                                <span v-if="sortBy === 'first_name'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
                            </th>
                            <th class="py-3" @click="sortByField('middle_name')">
                                Middle Name
                                <span v-if="sortBy === 'middle_name'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
                            </th>
                            <th class="py-3" @click="sortByField('last_name')">
                                Last Name
                                <span v-if="sortBy === 'last_name'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
                            </th>
                            <th class="py-3" @click="sortByField('email')">
                                Email
                                <span v-if="sortBy === 'email'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
                            </th>
                            <th class="py-3 ">Transactions</th>
                            <th class="py-3 ">Dashboard</th>
                            <th class="py-3 ">Inventory</th>
                            <th class="py-3 ">Categories</th>
                            <th class="py-3 ">Borrower</th>
                            <th class="py-3 ">Offices</th>
                            <th class="py-3 ">Users</th>
                            <th class="py-3 ">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in paginatedUsers" :key="user.id"
                            class="border-b font-medium text-gray-700 dark:border-gray-700 dark:text-gray-300 odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white">
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

                            <td class="px-4 py-3">
                                <button @click.stop="OpenViewTransactionHistoryPage(user)" class="items-center justify-center gap-2 mx-auto px-8 py-1.5 rounded-lg 
               border border-gray-300 hover:border-gray-400 
               dark:border-gray-600 dark:hover:border-gray-400 
               text-gray-700 dark:text-gray-200 transition duration-150 ease-in-out">
                                    <div class="flex items-center gap-2">
                                        <span>
                                            {{(databaseStore.transactionHistory.filter(transaction =>
                                                transaction.lender_id === user.id)?.length || 0)}}
                                        </span>
                                        <span class="text-gray-400">transactions</span>
                                    </div>
                                    <div class="flex justify-center items-center gap-2"
                                        :class="(databaseStore.transactionHistory.filter(transaction =>
                                            transaction.lender_id === user.id)?.length || 0) > 0 ? 'text-gray-400' : 'text-gray-700'">
                                        <span
                                            :class="{ 'text-red-500': unreturnedCount(user.id) > 0, 'text-green-500': unreturnedCount(user.id) === 0 }">
                                            ( {{ unreturnedCount(user.id) }} Unreturned )
                                        </span>
                                    </div>
                                </button>
                            </td>
                            <td v-for="perm in permissionTypes" :key="perm" class="px-4 py-3">
                                <AccessCheckbox v-for="invAccess in databaseStore.inventoryAccesses" :key="invAccess.id"
                                    :invAccess="invAccess" :userId="user.id" :user="user" :type="perm"
                                    :onToggle="toggleCheckbox" />
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
                                        <li
                                            class="block hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                            <button @click.stop="OpenUpdateUsersModal()"
                                                class="w-full text-start px-4 py-2">
                                                Update
                                            </button>

                                            <UpdateUsersModal v-if="isOpenUpdateUsersModal"
                                                v-model="isOpenUpdateUsersModal" :user="user" @click.stop />
                                        </li>
                                        <li
                                            class="block hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                            <button @click.stop="OpenUpdateUsersPasswordModal()"
                                                class="w-full text-start px-4 py-2">
                                                Change Password
                                            </button>

                                            <UpdateUsersPasswordModal v-if="isOpenUpdateUsersPasswordModal"
                                                v-model="isOpenUpdateUsersPasswordModal" :user="user" @click.stop />
                                        </li>
                                        <li
                                            class="block hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                            <button @click="showDeleteConfirmationModal = true"
                                                class="w-full text-start px-4 py-2">
                                                Delete
                                            </button>

                                            <!-- Delete Confirmation Modal -->
                                            <DeleteConfirmationModal v-model="showDeleteConfirmationModal"
                                                title="Confirm Deletion" :message="`You are about to delete this user.`"
                                                :messageData="`\nName: ${user.firstName} ${user.middleName} ${user.lastName}\nEmail: ${user.email}`"
                                                cancelText="Cancel" confirmText="Confirm Deleting"
                                                @confirm="() => confirmDeleteUser(true, user.id)" />
                                        </li>
                                    </ul>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
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

        <ViewTransactionHistoryModal v-if="isOpenViewTransactionHistoryPage" v-model="isOpenViewTransactionHistoryPage"
            :selectedUser="selectedUser" @click.stop />
    </div>
</template>