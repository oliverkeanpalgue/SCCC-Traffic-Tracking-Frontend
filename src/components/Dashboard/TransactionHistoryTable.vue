<script setup>
import { onMounted, onUnmounted, ref, computed } from "vue";
import axiosClient from "../../axios";

const API_KEY = import.meta.env.VITE_API_KEY;

const transactionHistories = ref([]);

const searchQuery = ref("");

const filteredTransactions = computed(() => {
  if (!transactionHistories.value.borrow_transactions) return [];

  const searchTerm = searchQuery.value.toLowerCase();

  return transactionHistories.value.borrow_transactions.filter(transaction => {
    const borrowerName = transaction.borrowers?.borrowers_name?.toLowerCase() || '';
    const transactionId = transaction.id?.toString().toLowerCase() || '';
    const lender = transactionHistories.value.users?.find(
      user => user.id === transaction.lender_id
    )?.firstName?.toLowerCase() || '';
    const returnDate = transaction.return_date ? transaction.return_date.toLowerCase() : '';
    const borrowDate = transaction.borrow_date ? transaction.borrow_date.toLowerCase() : '';

    return borrowerName.includes(searchTerm) ||
           transactionId.includes(searchTerm) ||
           lender.includes(searchTerm) ||
           returnDate.includes(searchTerm) ||
           borrowDate.includes(searchTerm);
  });
});

const openDropdownId = ref(null);

const dropdownRefs = ref([]);

const closeDropdown = () => {
  openDropdownId.value = null;
};

onMounted(() => {
  document.addEventListener("click", (event) => {
    if (
      openDropdownId.value !== null &&
      !dropdownRefs.value[openDropdownId.value]?.contains(event.target)
    ) {
      closeDropdown();
    }
  });

  axiosClient
    .get("/api/transaction_history", {
      headers: {
        "x-api-key": API_KEY,
      },
    })
    .then((response) => {
      transactionHistories.value = response.data;
      console.log("Transaction histories:", transactionHistories.value);
    })
    .catch((error) => {
      console.error("Error fetching transactions:", error);
    });
});

const toggleDropdown = (transactionId) => {
  openDropdownId.value = openDropdownId.value === transactionId ? null : transactionId;
};

const officeDropDownFilter = ref(false);
const officeDropDownButtonRef = ref(null);
const officeDropDownMenuRef = ref(null); // Reference to officeDropDown menu

const officeDropDownItems = ref([
  { id: 1, type: "911 Office", isActive: true },
  { id: 2, type: "MITD Office", isActive: true },
  { id: 3, type: "Library Office", isActive: true },
  { id: 4, type: "Convention Office", isActive: true },
  { id: 5, type: "Public Information Office", isActive: true },
]);

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

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div class="w-full mt-5">
    <section class="bg-gray-50 dark:bg-gray-900 w-full">
      <div class="px-4 w-full">
        <!-- Start coding here -->
        <div
          class="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden"
        >
          <div
            class="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4"
          >
          <div class="w-full md:w-1/2">
              <form class="flex items-center" @submit.prevent>
                <label for="simple-search" class="sr-only">Search</label>
                <div class="relative w-full">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      aria-hidden="true"
                      class="w-5 h-5 text-gray-500 dark:text-gray-400"
                      fill="currentColor"
                      viewbox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    v-model="searchQuery"
                    type="text"
                    id="simple-search"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    placeholder="Search transactions..."
                  />
                </div>
              </form>
            </div>
            <div
              class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0"
            >
              <button
                type="button"
                class="flex items-center justify-center text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800"
              >
                <svg
                  class="h-3.5 w-3.5 mr-2"
                  fill="currentColor"
                  viewbox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    clip-rule="evenodd"
                    fill-rule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  />
                </svg>
                Add Items
              </button>
              <div class="flex items-center space-x-3 w-full md:w-auto">
                <button
                  id="actionsDropdownButton"
                  data-dropdown-toggle="actionsDropdown"
                  class="w-full md:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                  type="button"
                >
                  <svg
                    class="-ml-1 mr-1.5 w-5 h-5"
                    fill="currentColor"
                    viewbox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      clip-rule="evenodd"
                      fill-rule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    />
                  </svg>
                  Actions
                </button>
                <div
                  id="actionsDropdown"
                  class="hidden z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600"
                >
                  <ul
                    class="py-1 text-sm text-gray-700 dark:text-gray-200"
                    aria-labelledby="actionsDropdownButton"
                  >
                    <li>
                      <a
                        href="#"
                        class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        >Mass Edit</a
                      >
                    </li>
                  </ul>
                  <div class="py-1">
                    <a
                      href="#"
                      class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                      >Delete all</a
                    >
                  </div>
                </div>

                <!--OFFICE DROPDOWN -->
                <section class="">
                  <div class="container">
                    <div class="">
                      <div ref="domNode" class="">
                        <div class="text-center">
                          <div class="relative inline-block text-left">
                            <button
                              @click="toggleofficeDropDown"
                              ref="officeDropDownButtonRef"
                              class="flex items-center rounded-[5px] px-5 py-[13px] bg-dark dark:bg-dark-2 text-base font-medium text-white"
                            >
                              <span class="material-icons pl-4">filter_alt</span>
                              Filter
                              <span class="material-icons pl-4">arrow_drop_down</span>
                            </button>
                            <div
                              v-show="officeDropDownFilter"
                              ref="officeDropDownMenuRef"
                              class="shadow-1 dark:shadow-box-dark absolute border border-gray-500 w-3xs right-0 z-40 mt-2 rounded-md bg-gray-200 dark:bg-gray-900 px-4 pt-2 transition-all"
                              :class="{
                                'top-full visible': officeDropDownFilter,
                                'top-[110%] invisible': !officeDropDownFilter,
                              }"
                            >
                              <label
                                class="flex items-center cursor-pointer select-none text-dark dark:text-white mb-2"
                                v-for="item in officeDropDownItems"
                                :key="item.id"
                              >
                                <div class="relative">
                                  <input
                                    type="checkbox"
                                    class="sr-only"
                                    :checked="item.isActive"
                                    @change="handleCheckboxChange(item.id, $event)"
                                  />
                                  <div
                                    class="box mr-4 flex h-5 w-5 items-center justify-center rounded border border-stroke dark:border-dark-3"
                                  >
                                    <span
                                      :class="{
                                        'opacity-100': item.isActive,
                                        'opacity-0': !item.isActive,
                                      }"
                                    >
                                      <svg
                                        width="11"
                                        height="8"
                                        viewBox="0 0 11 8"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M10.0915 0.951972L10.0867 0.946075L10.0813 0.940568C9.90076 0.753564 9.61034 0.753146 9.42927 0.939309L4.16201 6.22962L1.58507 3.63469C1.40401 3.44841 1.11351 3.44879 0.932892 3.63584C0.755703 3.81933 0.755703 4.10875 0.932892 4.29224L0.932878 4.29225L0.934851 4.29424L3.58046 6.95832C3.73676 7.11955 3.94983 7.2 4.1473 7.2C4.36196 7.2 4.55963 7.11773 4.71406 6.9584L10.0468 1.60234C10.2436 1.4199 10.2421 1.1339 10.0915 0.951972ZM4.2327 6.30081L4.2317 6.2998C4.23206 6.30015 4.23237 6.30049 4.23269 6.30082L4.2327 6.30081Z"
                                          fill="#3056D3"
                                          stroke="#3056D3"
                                          strokeWidth="0.4"
                                        ></path>
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
          <div class="">
            <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" class="px-4 py-3">Transaction ID</th>
                  <th scope="col" class="px-4 py-3">Borrower</th>
                  <th scope="col" class="px-4 py-3">Lender</th>
                  <th scope="col" class="px-4 py-3">Return Date & Time</th>
                  <th scope="col" class="px-4 py-3">Borrow Date & Time</th>
                  <th scope="col" class="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  class="border-b dark:border-gray-700"
                  v-for="transaction in filteredTransactions"
                  :key="transaction.id"
                >
                  <th scope="row" class="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {{ transaction.id }}
                  </th>
                  <td class="px-4 py-3">
                    {{ transaction.borrowers.borrowers_name }}
                  </td>
                  <td class="px-4 py-3">
                    {{
                      transactionHistories.users?.find(
                        (user) => user.id === transaction.lender_id
                      )?.firstName
                    }}
                  </td>
                  <td class="px-4 py-3">{{ transaction.return_date }}</td>
                  <td class="px-4 py-3">{{ transaction.borrow_date }}</td>
                  <td class="px-4 py-3 flex items-center justify-end relative">
                    <button
                      @click.stop="toggleDropdown(transaction.id)"
                      class="inline-flex items-center p-0.5 text-sm font-medium text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100"
                      type="button"
                    >
                      <svg
                        class="w-5 h-5"
                        aria-hidden="true"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                      </svg>
                    </button>

                    <div
                      v-if="openDropdownId === transaction.id"
                      ref="dropdownRefs"
                      class="absolute z-[10] bg-white divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 right-10 mt-2"
                    >
                      <ul class="py-2 text-sm text-gray-700 dark:text-gray-200">
                        <li>
                          <a
                            href="#"
                            class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                          >Edit</a>
                        </li>
                        <li>
                          <a
                            href="#"
                            class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                          >Delete</a>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <nav
            class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4"
            aria-label="Table navigation"
          >
            <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
              Showing
              <span class="font-semibold text-gray-900 dark:text-white">1-10</span>
              of
              <span class="font-semibold text-gray-900 dark:text-white">1000</span>
            </span>
            <ul class="inline-flex items-stretch -space-x-px">
              <li>
                <a
                  href="#"
                  class="flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <span class="sr-only">Previous</span>
                  <svg
                    class="w-5 h-5"
                    aria-hidden="true"
                    fill="currentColor"
                    viewbox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  class="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  >1</a
                >
              </li>
              <li>
                <a
                  href="#"
                  class="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  >2</a
                >
              </li>
              <li>
                <a
                  href="#"
                  aria-current="page"
                  class="flex items-center justify-center text-sm z-10 py-2 px-3 leading-tight text-primary-600 bg-primary-50 border border-primary-300 hover:bg-primary-100 hover:text-primary-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                  >3</a
                >
              </li>
              <li>
                <a
                  href="#"
                  class="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  >...</a
                >
              </li>
              <li>
                <a
                  href="#"
                  class="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  >100</a
                >
              </li>
              <li>
                <a
                  href="#"
                  class="flex items-center justify-center h-full py-1.5 px-3 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <span class="sr-only">Next</span>
                  <svg
                    class="w-5 h-5"
                    aria-hidden="true"
                    fill="currentColor"
                    viewbox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </section>
  </div>
</template>

<style></style>
