<script setup>
import { onMounted, onUnmounted, ref, computed, watch, toRaw } from "vue";
import UpdateModal from "./Modal/UpdateTransactionModal.vue";
import DeleteModal from "./Modal/DeleteTransactionModal.vue";
import { ChMenuMeatball } from "@kalimahapps/vue-icons";
import { IcSolidFilter } from '@kalimahapps/vue-icons';
import { MdOutlinedArrowDropDown } from '@kalimahapps/vue-icons';
import { BsCheck } from '@kalimahapps/vue-icons';
import { BsX } from '@kalimahapps/vue-icons';
import { AkPlus } from '@kalimahapps/vue-icons';
import CreateTransactionModal from './Modal/CreateTransactionModal.vue';
import baguioLogo from '../../assets/baguio-logo.png';
import { AnFilledPrinter } from '@kalimahapps/vue-icons';

const API_KEY = import.meta.env.VITE_API_KEY;

// const transactionHistories = ref([]);
const officeSupplies = ref([]);

const searchQuery = ref("");

const selectedTransaction = ref(null);

const isUpdateModalOpen = ref(false);

// FETCH DATA FROM PROPS
const props = defineProps({
  transactionItems: Array,
  transactionHistory: Array,
  officeEquipments: Array,
  officeSupplies: Array,
  officeList: Array,
  users: Array,
  borrowers: Array,
  equipmentCopies: Array,
  categoryList: Array,
  transactionHistories: Array,
  selectedDateRange: Object,
})

watch(() => props.selectedDateRange, () => {
  console.log("🚀 ~ watch ~ props.transactionHistory:", props.transactionHistory)
  console.log("🚀 ~ watch ~ props.selectedDateRange.start:", props.selectedDateRange.start)
  console.log("🚀 ~ watch ~ props.selectedDateRange.end:", props.selectedDateRange.end)
})

const openUpdateModal = (transaction) => {
  console.log("🚀 ~ openUpdateModal ~ transaction:", transaction)
  const lender =
    props.users?.find((user) => user.id === transaction.lender_id)
      ?.firstName || "Unknown";

  selectedTransaction.value = {
    ...transaction,
    lenderName: lender, // Add lender name
  };

  isUpdateModalOpen.value = true;
};

const isDeleteModalOpen = ref(false);

const openDeleteModal = (transaction) => {
  const lender =
    props.users?.find((user) => user.id === transaction.lender_id)
      ?.firstName || "Unknown";

  selectedTransaction.value = {
    ...transaction,
    lenderName: lender, // Add lender name
  };

  isDeleteModalOpen.value = true;
  console.log("🚀 ~ openDeleteModal ~ isDeleteModalOpen:", isDeleteModalOpen.value);
};

const filteredTransactions = computed(() => {
  if (!props.transactionHistory || !props.selectedDateRange.start || !props.selectedDateRange.end) return [];

  const startDate = new Date(props.selectedDateRange.start);
  const endDate = new Date(props.selectedDateRange.end);

  endDate.setHours(23, 59, 59, 999);
  startDate.setHours(0, 0, 0, 0);

  // Get active office IDs
  const activeOfficeIds = officeDropDownItems.value
    .filter(item => item.isActive)
    .map(item => item.id);

  return props.transactionHistory.filter(transaction => {
    const borrowDate = new Date(transaction.borrow_date);

    if (borrowDate < startDate || borrowDate > endDate) {
      return false;
    }

    if (transaction.is_deleted) return false;

    const searchTerm = searchQuery.value.toLowerCase();
    const borrower = props.borrowers?.find((b) => b.id === transaction.borrower_id);
    const borrowerOfficeId = borrower?.office_id;

    // If there are active filters, check if the transaction's office is in the active list
    if (activeOfficeIds.length > 0 && !activeOfficeIds.includes(borrowerOfficeId)) {
      return false;
    }

    const borrowerName = borrower?.borrowers_name?.toLowerCase() || "";
    const transactionId = transaction.id?.toString().toLowerCase() || "";
    const lender = props.users?.find((user) => user.id === transaction.lender_id)?.firstName?.toLowerCase() || "";
    const returnDate = transaction.return_date?.toLowerCase() || "";
    const borrowDateStr = transaction.borrow_date?.toLowerCase() || "";

    // Fetch transaction items
    const selectedTransactionItems = props.transactionItems?.filter(item => item.transaction_id === transaction.id) || [];
    if (!selectedTransactionItems.length) return false;

    const itemsMatch = selectedTransactionItems.some(item => {
      if (item.item_type === 'Office Supply') {
        const supplyName = props.officeSupplies.find(
          (supply) => Number(supply.id) === Number(item.item_copy_id)
        )?.supply_name?.toLowerCase() || "";
        return supplyName.includes(searchTerm);
      } else if (item.item_type === 'Equipment Copy') {
        const equipmentName = props.officeEquipments.find(
          (equipment) =>
            Number(equipment.id) ===
            Number(
              props.equipmentCopies.find(
                (equipment_copy) =>
                  Number(equipment_copy.id) === Number(item.item_copy_id)
              )?.item_id
            )
        )?.equipment_name?.toLowerCase() || "";

        const equipmentId = props.equipmentCopies.find(
          (equipment_copy) => Number(equipment_copy.id) === Number(item.item_copy_id)
        )?.item_id?.toString()?.toLowerCase() || "";

        return equipmentName.includes(searchTerm) || equipmentId.includes(searchTerm);
      }
      return false;
    });

    return (
      borrowerName.includes(searchTerm) ||
      transactionId.includes(searchTerm) ||
      lender.includes(searchTerm) ||
      returnDate.includes(searchTerm) ||
      borrowDateStr.includes(searchTerm) ||
      itemsMatch
    );
  });
});

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(7);

// Compute total pages based on filtered transactions
const totalPages = computed(() => {
  return Math.ceil(filteredTransactions.value.length / itemsPerPage.value);
});

const sortedTransactions = computed(() => {
  const transactions = [...filteredTransactions.value];

  return transactions.sort((a, b) => {
    const getFieldValue = (transaction, field) => {
      switch (field) {
        case 'id':
          return transaction.id;

        case 'borrower':
          return props.borrowers.find(b => b.id === transaction.borrower_id)?.borrowers_name?.toLowerCase() || '';

        case 'borrow_date':
          return new Date(transaction.borrow_date);

        case 'return_date':
          return transaction.return_date ? new Date(transaction.return_date) : new Date(0);

        case 'lender':
          return props.users.find(u => u.id === transaction.lender_id)?.firstName?.toLowerCase() || '';

        case 'isc':
          return transaction.isc;

        case 'office':
          const borrower = props.borrowers.find(b => b.id === transaction.borrower_id);
          return props.officeList.find(o => o.id === borrower?.office_id)?.office_name?.toLowerCase() || '';

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

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return sortedTransactions.value.slice(start, end);
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

const openDropdownId = ref(null);

const dropdownRefs = ref([]);

watch(() => props.officeList, () => {
  officeDropDownItems.value = props.officeList.map((office) => ({
    id: office.id,
    type: office.office_name,
    isActive: true,
  }));
});

const toggleDropdown = (transactionId) => {
  openDropdownId.value = openDropdownId.value === transactionId ? null : transactionId;
};

const officeDropDownFilter = ref(false);
const officeDropDownButtonRef = ref(null);
const officeDropDownMenuRef = ref(null); // Reference to officeDropDown menu

const officeDropDownItems = ref([]);

const resetOfficeFilters = () => {
  officeDropDownItems.value = props.officeList.map((office) => ({
    id: office.id,
    type: office.office_name,
    isActive: false, // Set initial state to false
  }));
};

const toggleofficeDropDown = () => {
  if (!officeDropDownFilter.value) {
    resetOfficeFilters(); // Reset when opening the dropdown
  }
  officeDropDownFilter.value = !officeDropDownFilter.value;
};

// Function to handle checkbox toggle
const handleCheckboxChange = (id, event) => {
  event.stopPropagation(); // Prevent event from closing the officeDropDown
  const item = officeDropDownItems.value.find((item) => item.id === id);
  if (item) {
    item.isActive = !item.isActive;
  }
};

// Custom function to handle click outside
const handleClickOutside = (event) => {
  if (
    officeDropDownButtonRef.value &&
    !officeDropDownButtonRef.value.contains(event.target) &&
    officeDropDownMenuRef.value &&
    !officeDropDownMenuRef.value.contains(event.target)
  ) {
    officeDropDownFilter.value = false;
  }
  openDropdownId.value = null;
};

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

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

// FOR CREATE TRANSACTION MODAL
const isOpenCreateTransactionModal = ref(false);

const OpenCreateTransactionModal = () => {
  isOpenCreateTransactionModal.value = true;
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
            <title>Printed Categories Reports</title>
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
                <h1>Categories Management - Printed Report</h1>
                <p>Printed on: ${new Date().toLocaleString()}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Borrower</th>
                        <th>Office</th>
                        <th>Lender</th>
                        <th>ISC/AREE</th>
                        <th>Item</th>
                        <th>Return Date</th>
                        <th>Borrow Date</th>
                    </tr>
                </thead>
                <tbody>
    ${filteredTransactions.value.map(report => `
        <tr>
            <td>${report.id}</td>
            <td>${props.borrowers.find(b => b.id === report.borrower_id)?.borrowers_name || 'Unknown'}</td>
            <td>${props.officeList.find(o => o.id === props.borrowers.find(b => b.id === report.borrower_id)?.office_id)?.office_name || 'Unknown'}</td>
            <td>${(props.users.find(u => u.id === report.lender_id)?.firstName || '') + ' ' + (props.users.find(u => u.id === report.lender_id)?.lastName || 'Unknown')}</td>
            <td>${report.isc || 'No data found'}</td>
            <td>${props.transactionItems
      .filter(item => item.transaction_id === report.id)
      .map(item => {
        if (item.item_type === 'Office Supply') {
          return props.officeSupplies.find(supply => supply.id === item.item_copy_id)?.supply_name || 'Unknown Supply';
        } else if (item.item_type === 'Equipment Copy') {
          const equipment = props.officeEquipments.find(eq =>
            eq.id === props.equipmentCopies.find(ec =>
              ec.id === item.item_copy_id
            )?.item_id
          );
          const copyNum = props.equipmentCopies.find(ec =>
            ec.id === item.item_copy_id
          )?.copy_num;
          return `${equipment?.equipment_name || 'Unknown Equipment'} #${copyNum || ''}`;
        }
        return '';
      }).join(', ')}</td>
            <td>${report.return_date ? new Date(report.return_date).toLocaleString() : 'Not yet returned'}</td>
            <td>${new Date(report.borrow_date).toLocaleString()}</td>
        </tr>
    `).join('')}
</tbody>
            </table>
            <div class="print-footer">
                <p>Total Categories: ${filteredTransactions.value.length}</p>
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
</script>

<template>
  <div class="w-full mt-3">
    <section class="bg-gray-200 dark:bg-gray-900 w-full">
      <div
        class="shadow-lg mx-4 px-3 py-2 border-2 rounded-lg bg-white border-gray-300 dark:bg-gray-950 dark:border-gray-700">
        <!-- Start coding here -->
        <div class="relative shadow-md sm:rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
          <div class="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
            <div class="w-full md:w-8/9">
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
                    placeholder="Search transactions..." />
                </div>
              </form>
            </div>
            <div
              class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
              <div class="flex items-center space-x-3 w-full md:w-auto">
                <div id="actionsDropdown"
                  class="hidden z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600">
                  <ul class="py-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="actionsDropdownButton">
                    <li>
                      <a href="#"
                        class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Mass
                        Edit</a>
                    </li>
                  </ul>
                  <div class="py-1">
                    <a href="#"
                      class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Delete
                      all</a>
                  </div>
                </div>

                <!--OFFICE DROPDOWN -->
                <section class="">
                  <div class="container">
                    <div class="">
                      <div ref="domNode" class="">
                        <div class="text-center">
                          <div class="relative inline-block text-left">
                            <button @click="toggleofficeDropDown" ref="officeDropDownButtonRef"
                              class="flex border items-center rounded-lg px-10 py-2 text-base font-medium border-gray-400 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white dark:border-gray-600">
                              <IcSolidFilter class="w-5 h-5 mr-1" />
                              Filter
                              <MdOutlinedArrowDropDown class="w-5 h-5" />
                            </button>
                            <div v-show="officeDropDownFilter" ref="officeDropDownMenuRef"
                              class="shadow-1 dark:shadow-box-dark absolute border border-gray-500 max-h-70 overflow-auto w-3xs right-0 z-40 mt-2 rounded-md bg-gray-200 dark:bg-gray-900 px-4 pt-2 transition-all"
                              :class="{
                                'top-full visible': officeDropDownFilter,
                                'top-[110%] invisible': !officeDropDownFilter,
                              }">
                              <label
                                class="flex items-center cursor-pointer select-none text-dark dark:text-white mb-2  "
                                v-for="item in officeDropDownItems" :key="item.id">
                                <div class="relative">
                                  <input type="checkbox" class="sr-only" :checked="item.isActive"
                                    @change="handleCheckboxChange(item.id, $event)" />
                                  <div
                                    class="box mr-4 flex h-5 w-5 items-center justify-center rounded border border-stroke dark:border-dark-3">
                                    <span :class="{
                                      'opacity-100': item.isActive,
                                      'opacity-0': !item.isActive,
                                    }">
                                      <svg width="11" height="8" viewBox="0 0 11 8" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                          d="M10.0915 0.951972L10.0867 0.946075L10.0813 0.940568C9.90076 0.753564 9.61034 0.753146 9.42927 0.939309L4.16201 6.22962L1.58507 3.63469C1.40401 3.44841 1.11351 3.44879 0.932892 3.63584C0.755703 3.81933 0.755703 4.10875 0.932892 4.29224L0.932878 4.29225L0.934851 4.29424L3.58046 6.95832C3.73676 7.11955 3.94983 7.2 4.1473 7.2C4.36196 7.2 4.55963 7.11773 4.71406 6.9584L10.0468 1.60234C10.2436 1.4199 10.2421 1.1339 10.0915 0.951972ZM4.2327 6.30081L4.2317 6.2998C4.23206 6.30015 4.23237 6.30049 4.23269 6.30082L4.2327 6.30081Z"
                                          fill="#3056D3" stroke="#3056D3" strokeWidth="0.4"></path>
                                      </svg>
                                    </span>
                                  </div>
                                </div>
                                {{ item.type }}
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <!-- End -->
                    </div>
                  </div>
                </section>

                <button @click.stop="OpenCreateTransactionModal()"
                  class="flex border items-center rounded-lg px-10 py-2 text-base font-medium border-gray-400 bg-gray-100 text-gray-800 dark:bg-green-700 dark:text-white dark:border-green-800 dark:hover:bg-green-800 dark:hover:text-white">
                  <AkPlus class="w-5 h-5 mr-1" />
                  New Transaction
                </button>

                <button @click="handlePrint"
                    class="flex border items-center rounded-lg px-10 py-2 text-base font-medium border-gray-400 bg-gray-100 text-gray-800 dark:bg-green-700 dark:text-white dark:border-green-800 dark:hover:bg-green-800 dark:hover:text-white">
                    <AnFilledPrinter class="w-5 h-5 mr-1" />
                    <p class="ml-1">Print Transaction</p>
                </button>

                <!--CREATE TRANSACTION MODAL -->
                <CreateTransactionModal v-if="isOpenCreateTransactionModal" v-model="isOpenCreateTransactionModal"
                  @click.stop />

                
              </div>
            </div>
          </div>
          <div class="min-h-125 dark:bg-gray-900 ">
            <table class="w-full text-sm text-center text-gray-500 dark:text-gray-400">
              <thead class=" dark:bg-gray-600 dark:text-gray-300">
                <tr>
                  <th class="py-3" @click="sortByField('id')">
                    ID
                    <span v-if="sortBy === 'id'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
                  </th>
                  <th @click="sortByField('borrower')">
                    Borrower
                    <span v-if="sortBy === 'borrower'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
                  </th>
                  <th @click="sortByField('office')">
                    Office
                    <span v-if="sortBy === 'office'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
                  </th>
                  <th @click="sortByField('lender')">
                    Lender
                    <span v-if="sortBy === 'lender'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
                  </th>
                  <th @click="sortByField('isc')">
                    ISC/AREE
                    <span v-if="sortBy === 'isc'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
                  </th>
                  <th>Item</th>
                  <th @click="sortByField('return_date')">
                    Return Date
                    <span v-if="sortBy === 'return_date'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
                  </th>
                  <th @click="sortByField('borrow_date')">
                    Borrow Date
                    <span v-if="sortBy === 'borrow_date'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody class="">
                <template v-if="paginatedTransactions.length">
                  <tr
                    class="border-b font-medium text-gray-700 dark:border-gray-700 dark:text-gray-300 odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white"
                    v-for="transaction in paginatedTransactions" :key="transaction.id">
                    <th scope="row" class="px-4 py-3 whitespace-nowrap ">
                      {{ transaction.id }}
                    </th>
                    <td class="px-4 py-3">
                      {{props.borrowers.find(borrower => Number(borrower.id) ===
                        Number(transaction.borrower_id))?.borrowers_name || 'Unknown First Name'}}
                    </td>
                    <td class="px-4 py-3">
                      {{props.officeList.find(office => Number(office.id) ===
                        (Number(props.borrowers.find(borrower => Number(borrower.id) ===
                          Number(transaction.borrower_id))?.office_id)))?.office_name || 'Unknown Office'}}
                    </td>
                    <td class="px-4 py-3">
                      {{
                        (props.users?.find(user => user.id === transaction.lender_id)?.firstName || '') +
                        " " +
                        (props.users?.find(user => user.id === transaction.lender_id)?.lastName || 'No data found')
                      }}
                    </td>
                    <td class="px-4 py-3">
                      {{ transaction.isc || 'No data found' }}
                    </td>
                    <td>
                      <ul>
                        <li v-for="item in props.transactionItems" :key="item.id"
                          class="flex flex-row pl-2 justify-start items-center font-bold dark:font-semibold ">
                          <div v-if="item.transaction_id === transaction.id">
                            <!-- OFFICE SUPPLY ITEM -->
                            <span v-if="item.item_type === 'Office Supply'"
                              class="flex flex-row justify-center items-center"
                              :class="item.returned_date ? 'text-green-700 dark:text-green-600' : 'text-red-700 dark:text-red-600'">
                              <BsCheck v-if="item.returned_date" class="w-7 h-7" />
                              <BsX v-else class="w-7 h-7" />
                              {{
                                props.officeSupplies.find(
                                  (supply) => Number(supply.id) === Number(item.item_copy_id)
                                )?.supply_name || "Unknown Supply"
                              }}
                            </span>
                            <!-- EQUIPMENT COPY ITEM -->
                            <span v-if="item.item_type === 'Equipment Copy'"
                              class="flex flex-row justify-center items-center"
                              :class="item.returned_date ? 'text-green-700 dark:text-green-600' : 'text-red-700 dark:text-red-600'">
                              <BsCheck v-if="item.returned_date" class="w-7 h-7" />
                              <BsX v-else class="w-7 h-7" />
                              {{
                                props.officeEquipments.find(equipment => Number(equipment.id) ===
                                  Number(props.equipmentCopies.find(equipment_copy => Number(equipment_copy.id) ===
                                    Number(item.item_copy_id))?.item_id))?.equipment_name || 'Unknown Equipment'
                              }}
                              #{{props.equipmentCopies.find(equipment_copy => Number(equipment_copy.id) ===
                                Number(item.item_copy_id))?.copy_num || 'Unknown Equipment'}}
                            </span>
                          </div>
                        </li>
                      </ul>
                    </td>

                    <td class="max-w-min"
                      :class="transaction.return_date ? 'text-green-700 dark:text-green-600' : 'text-red-700 dark:text-red-600'">
                      <div class="flex flex-row justify-start items-center">
                        <BsCheck v-if="transaction.return_date" class="w-7 h-7" />
                        <BsX v-else class="w-7 h-7" />
                        <span v-if="transaction.return_date">
                          {{ formatDate(transaction.return_date) }}
                        </span>
                        <span v-else>
                          Not yet returned
                        </span>
                      </div>
                    </td>

                    <td class="px-4 py-3">{{ formatDate(transaction.borrow_date) }}</td>
                    <td class="px-4 py-3">
                      <button @click.stop="toggleDropdown(transaction.id)"
                        class="inline-flex items-center p-0.5 text-sm font-medium text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100"
                        type="button">
                        <ChMenuMeatball class="w-5 h-5" />
                      </button>

                      <div v-if="openDropdownId === transaction.id" ref="dropdownRefs"
                        class="absolute z-[10] bg-white divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 right-12 -mt-15">
                        <ul class="py-2 text-sm text-gray-700 dark:text-gray-200">
                          <li class="block hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                            <button @click.stop="openUpdateModal(transaction)" class="w-full text-start px-4 py-2">
                              Update
                            </button>
                            <UpdateModal v-if="isUpdateModalOpen" v-model="isUpdateModalOpen"
                              :transaction="selectedTransaction" :officeEquipments="props.officeEquipments"
                              :officeSupplies="props.officeSupplies" :equipmentCopies="props.equipmentCopies"
                              :officeList="props.officeList" :categoryList="props.categoryList"
                              :transactionItems="props.transactionItems" :borrowers="props.borrowers"
                              :users="props.users" @click.stop />
                          </li>
                          <li class="block hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                            <button @click.stop="openDeleteModal(transaction)" class="w-full text-start px-4 py-2">
                              Delete
                            </button>
                            <DeleteModal v-if="isDeleteModalOpen" v-model="isDeleteModalOpen"
                              :transaction="selectedTransaction" :officeSupplies="props.officeSupplies"
                              :transactionItems="props.transactionItems" :borrowers="props.borrowers" @click.stop />
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                </template>

                <tr v-else>
                  <td colspan="9" class="text-center py-4 text-gray-500 dark:text-gray-400">
                    No data found
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
                {{ Math.min(currentPage * itemsPerPage, filteredTransactions.length) }}
              </span>
              of
              <span class="font-semibold text-gray-900 dark:text-white">{{ filteredTransactions.length }}</span>
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
      </div>
    </section>
  </div>
</template>

<style></style>
