<script setup>
import { onMounted, onUnmounted, ref, computed, watch, toRaw } from "vue";
import axiosClient from "../../axios";
import UpdateModal from "./Modal/UpdateTransactionModal.vue";
import DeleteModal from "./Modal/DeleteTransactionModal.vue";
import { ClListOrdered } from "@kalimahapps/vue-icons";
import { ChMenuMeatball } from "@kalimahapps/vue-icons";
import { FlFilledClipboardBulletList } from "@kalimahapps/vue-icons";
import { CaDotMark } from "@kalimahapps/vue-icons";
import { GlQuestion } from "@kalimahapps/vue-icons";
import { IcSolidFilter } from '@kalimahapps/vue-icons';
import { MdOutlinedArrowDropDown } from '@kalimahapps/vue-icons';
import { AkCheck } from '@kalimahapps/vue-icons';
import { AkCross } from '@kalimahapps/vue-icons';
import { BsQuestion } from '@kalimahapps/vue-icons';
import { BsCheck } from '@kalimahapps/vue-icons';
import { BsX } from '@kalimahapps/vue-icons';
import { AkPlus } from '@kalimahapps/vue-icons';
import CreateTransactionModal from './Modal/CreateTransactionModal.vue';

const API_KEY = import.meta.env.VITE_API_KEY;

// const transactionHistories = ref([]);
const officeSupplies = ref([]);
const officeEquipments = ref([]);
const equipmentCopies = ref([]);
// const officeList = ref([]);
const categoryList = ref([]);

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
})

const openUpdateModal = (transaction) => {
  const lender =
    props.users?.find((user) => user.id === transaction.lender_id)
      ?.firstName || "Unknown";

  selectedTransaction.value = {
    ...transaction,
    lenderName: lender, // Add lender name
  };

  isUpdateModalOpen.value = true;
  console.log("🚀 ~ openDeleteModal ~ isUpdateModalOpen:", isUpdateModalOpen.value);
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

const getActiveOfficeIds = () => {
  return officeDropDownItems.value
    .filter((item) => item.isActive)
    .map((item) => item.id);
};

const filteredTransactions = computed(() => {
  if (!props.transactionHistory) return [];

  const searchTerm = searchQuery.value.toLowerCase();
  const activeOfficeIds = getActiveOfficeIds();

  return props.transactionHistory.filter((transaction) => {
    // DELETED
    if (transaction.is_deleted) return false;
    // BORROWER NAME
    const borrowerName =
      props.borrowers
        ?.find((borrower) => borrower.id === transaction.borrower_id)
        ?.borrowers_name?.toLowerCase() || "";
    // TRANSACTION ID
    const transactionId = transaction.id?.toString().toLowerCase() || "";
    // LENDER NAME
    const lender =
      props.users
        ?.find((user) => user.id === transaction.lender_id)
        ?.firstName?.toLowerCase() || "";
    // RETURN DATE
    const returnDate = transaction.return_date
      ? transaction.return_date.toLowerCase()
      : "";
    // BORROW DATE
    const borrowDate = transaction.borrow_date
      ? transaction.borrow_date.toLowerCase()
      : "";

    // FETCH ITEMS OF THE TRANSACTION
    const selectedTransactionItems = props.transactionItems?.filter(item => item.transaction_id === transaction.id) || [];

    if (!selectedTransactionItems.length) {
      console.log("NO ITEMS, RETURNING FALSE")
      return false;
    }

    // ITEMS MATCH
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
    }) || false;

    const borrowerOfficeId =
      props.borrowers
        ?.find((borrower) => borrower.id === transaction.borrower_id)
        ?.office_id || "";

    const officeMatch =
      props.officeList
        ?.find((office) => office.id === borrowerOfficeId)
        ?.office_name?.toLowerCase() || "";

    return (
      officeMatch &&
      (borrowerName.includes(searchTerm) ||
        transactionId.includes(searchTerm) ||
        lender.includes(searchTerm) ||
        returnDate.includes(searchTerm) ||
        borrowDate.includes(searchTerm) ||
        itemsMatch)
    );
  });
});

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Compute total pages based on filtered transactions
const totalPages = computed(() => {
  return Math.ceil(filteredTransactions.value.length / itemsPerPage.value);
});

// Get paginated transactions
const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;

  return filteredTransactions.value.slice(start, end);
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

const toggleofficeDropDown = () => {
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

                <button @click.stop="OpenCreateTransactionModal()"
                  class="flex border items-center rounded-lg px-10 py-2 text-base font-medium border-gray-400 bg-gray-100 text-gray-800 dark:bg-green-700 dark:text-white dark:border-green-800 dark:hover:bg-green-800 dark:hover:text-white">
                  <AkPlus class="w-5 h-5 mr-1" />
                  New Transaction
                </button>       

                <!--CREATE TRANSACTION MODAL -->
                <CreateTransactionModal v-if="isOpenCreateTransactionModal" v-model="isOpenCreateTransactionModal"
                  @click.stop />

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
                              class="shadow-1 dark:shadow-box-dark absolute border border-gray-500 w-3xs right-0 z-40 mt-2 rounded-md bg-gray-200 dark:bg-gray-900 px-4 pt-2 transition-all"
                              :class="{
                                'top-full visible': officeDropDownFilter,
                                'top-[110%] invisible': !officeDropDownFilter,
                              }">
                              <label class="flex items-center cursor-pointer select-none text-dark dark:text-white mb-2"
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
              </div>
            </div>
          </div>
          <div class="dark:bg-gray-900 ">
            <table class="w-full text-sm text-center text-gray-500 dark:text-gray-400">
              <thead class="text-xs text-gray-800 uppercase bg-gray-300 dark:bg-gray-700 dark:text-gray-300">
                <tr>
                  <th scope="col" class="">ID</th>
                  <th scope="col" class="py-3">Borrower</th>
                  <th scope="col" class="py-3">Office</th>
                  <th scope="col" class="py-3">Lender</th>
                  <th scope="col" class="py-3">AREE/ISC</th>
                  <th scope="col" class="py-3">Items</th>
                  <th scope="col" class="py-3">Return Date & Time</th>
                  <th scope="col" class="py-3">Borrow Date & Time</th>
                  <th scope="col" class="py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="paginatedTransactions.length">
                  <tr class="border-b font-medium text-gray-700 dark:border-gray-700 dark:text-gray-300"
                    v-for="transaction in paginatedTransactions" :key="transaction.id">
                    <th scope="row" class="px-4 py-3 whitespace-nowrap ">
                      {{ transaction.id }}
                    </th>
                    <td class="px-4 py-3">
                      {{ transaction.borrowers?.borrowers_name || 'No data found' }}
                    </td>
                    <td class="px-4 py-3">
                      {{
                        props.officeList?.find(
                          (office) => office.id === transaction.borrowers?.office_id
                        )?.office_name || 'No data found'
                      }}
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
                    <td class="px-4 py-3 flex items-center justify-center relative">
                      <button @click.stop="toggleDropdown(transaction.id)"
                        class="inline-flex items-center p-0.5 text-sm font-medium text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100"
                        type="button">
                        <ChMenuMeatball class="w-5 h-5" />
                      </button>

                      <div v-if="openDropdownId === transaction.id" ref="dropdownRefs"
                        class="absolute z-[10] bg-white divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 right-10 mt-2">
                        <ul class="py-2 text-sm text-gray-700 dark:text-gray-200">
                          <li class="block hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                            <button @click.stop="openUpdateModal(transaction)" class="w-full text-start px-4 py-2">
                              Update
                            </button>
                            <UpdateModal v-if="isUpdateModalOpen" v-model="isUpdateModalOpen"
                              :transaction="selectedTransaction" :officeEquipments="officeEquipments"
                              :officeSupplies="officeSupplies" :equipmentCopies="equipmentCopies"
                              :officeList="officeList" :categoryList="categoryList" @click.stop />
                          </li>
                          <li class="block hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                            <button @click.stop="openDeleteModal(transaction)" class="w-full text-start px-4 py-2">
                              Delete
                            </button>
                            <DeleteModal v-if="isDeleteModalOpen" v-model="isDeleteModalOpen"
                              :transaction="selectedTransaction" :officeSupplies="officeSupplies" @click.stop />
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
