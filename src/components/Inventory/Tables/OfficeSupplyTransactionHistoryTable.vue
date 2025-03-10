<script setup>
import { ref, onMounted, onUnmounted, defineEmits, defineProps, computed, watch } from 'vue'
import IncreaseSupplyQty from '../Modals/IncreaseSupplyQty.vue';
import { ClAddPlus } from '@kalimahapps/vue-icons';

const props = defineProps({
    selectedItem: Object,
    transactionItems: Object,
    transactionHistory: Object,
    users: Object,
    officeList: Object,
    borrowers: Object,
})


const isOpenIncreaseSupplyQtyModal = ref(false);

const OpenIncreaseSupplyQtyModal = () => {
    isOpenIncreaseSupplyQtyModal.value = true;
}

const searchQuery = ref("");

const filteredTransactionItems = computed(() => {
    const searchTerm = searchQuery.value.toLowerCase();

    return props.transactionItems
        .filter(item =>
            item.item_type === "Office Supply" && item.item_copy_id === props.selectedItem.id
        )
        .filter(item => {
            // Search by transaction ID
            const transactionId = item.id?.toString().toLowerCase() || "";

            // Get transaction details
            const transaction = props.transactionHistory.find(t => t.id === item.transaction_id);
            const borrower = props.borrowers.find(u => u.id === transaction?.borrower_id);
            const office = props.officeList.find(o => o.id === borrower?.office_id);
            const lender = props.users.find(u => u.id === transaction?.lender_id);

            // Search by borrower name
            const borrowerName = borrower?.borrowers_name?.toLowerCase() || "";

            // Search by office name
            const officeName = office?.office_name?.toLowerCase() || "";

            // Search by lender name
            const lenderName = lender?.firstName?.toLowerCase() || "";

            // Return true if any field matches the search term
            return transactionId.includes(searchTerm) ||
                borrowerName.includes(searchTerm) ||
                officeName.includes(searchTerm) ||
                lenderName.includes(searchTerm);
        })
        .reverse(); // Reverse to show the latest transaction first
});

// Reset to first page when searching
watch(searchQuery, () => {
    currentPage.value = 1;
});

const formatDate = (dateString) => {
    if (!dateString) return "N/A"; // Handle null values
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
};

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(5);

// Compute total pages based on filtered transactions
const totalPages = computed(() => {
    return Math.ceil(filteredTransactionItems.value.length / itemsPerPage.value);
});

// Get paginated transactions
const paginatedTransactions = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;

    return filteredTransactionItems.value.slice(start, end);
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
            <div class="w-full md:w-1/2">
                <form class="flex items-center" @submit.prevent>
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
                            placeholder="Search supply transaction..." />
                    </div>
                </form>
            </div>

            <button @click.stop="OpenIncreaseSupplyQtyModal()"
            :selectedItems="selectedItem"
                class="flex items-center justify-center mx-auto w-fit px-8 py-1 rounded-lg dark:border-gray-600 dark:bg-green-800 dark:hover:bg-green-700">
                <ClAddPlus class="w-8 h-6" />
                <p class="ml-1">Increase Quantity</p>
            </button>
        </div>
        <table class="w-full border-collapse text-sm text-gray-300">
            <thead>
                <tr class="bg-gray-700 text-gray-200 uppercase text-left text-xs">
                    <th class="px-4 py-2 border-b border-gray-600">ID</th>
                    <th class="px-4 py-2 border-b border-gray-600">Borrower</th>
                    <th class="px-4 py-2 border-b border-gray-600">Office</th>
                    <th class="px-4 py-2 border-b border-gray-600">Lender</th>
                    <th class="px-4 py-2 border-b border-gray-600">Return Date & Time</th>
                    <th class="px-4 py-2 border-b border-gray-600">Borrow Date & Time</th>
                    <th class="px-4 py-2 border-b border-gray-600">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="transactionItem in paginatedTransactions" :key="transactionItem.id"
                    class="odd:bg-gray-800 even:bg-gray-750 hover:bg-gray-700 transition">
                    <td class="px-4 py-3 border-b border-gray-700">{{ transactionItem.id }}</td>
                    <td class="px-4 py-3 border-b border-gray-700">
                        {{borrowers.find(u => u.id === transactionHistory.find(t => t.id ===
                            transactionItem.transaction_id)?.borrower_id)?.borrowers_name || 'N/A'}}
                    </td>
                    <td class="px-4 py-3 border-b border-gray-700">
                        {{officeList.find(o => o.id === borrowers.find(u => u.id === transactionHistory.find(t => t.id
                            === transactionItem.transaction_id).borrower_id).office_id)?.office_name || 'N/A'}}
                    </td>
                    <td class="px-4 py-3 border-b border-gray-700">
                        {{users.find(u => u.id === transactionHistory.find(t => t.id ===
                            transactionItem.transaction_id)?.lender_id)?.firstName || 'N/A'}}
                    </td>
                    <td class="px-4 py-3 border-b border-gray-700">
                        {{ formatDate(transactionHistory?.returned_date) ?? 'N/A' }}
                    </td>
                    <td class="px-4 py-3 border-b border-gray-700">
                        {{formatDate(transactionHistory.find(t => t.id ===
                            transactionItem.transaction_id)?.borrow_date) || 'N/A'}}
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
                    {{ Math.min(currentPage * itemsPerPage, filteredTransactionItems.length) }}
                </span>
                of
                <span class="font-semibold text-gray-900 dark:text-white">{{ filteredTransactionItems.length }}</span>
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

        <IncreaseSupplyQty v-if="isOpenIncreaseSupplyQtyModal" v-model="isOpenIncreaseSupplyQtyModal"
            :selectedItems="selectedItem" @click.stop />
    </div>
</template>