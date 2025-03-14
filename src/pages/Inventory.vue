<script setup>
import { onMounted, onUnmounted, ref, computed, watch } from "vue";
import axiosClient from "../axios";
import image from "./../../src/assets/baguio-logo.png";
import Loading from "../components/Loading.vue";
import AddItemModal from "../components/Inventory/Modals/AddItemModal.vue";
import { ClAddPlus } from '@kalimahapps/vue-icons';
import { FlSearch } from '@kalimahapps/vue-icons';
import OfficeSupplyTransactionHistoryTable from "../components/Inventory/Tables/OfficeSupplyTransactionHistoryTable.vue";
import OfficeEquipmentTransactionHistoryTable from "../components/Inventory/Tables/OfficeEquipmentTransactionHistoryTable.vue";
import EquipmentCopiesTable from "../components/Inventory/Tables/EquipmentCopiesTable.vue";
import { GlCloseXs } from '@kalimahapps/vue-icons';
import UpdateSelectedEquipment from "../components/Inventory/Modals/UpdateSelectedEquipment.vue";
import UpdateSelectedSupply from "../components/Inventory/Modals/UpdateSelectedSupply.vue";
import IncreaseSupplyQty from "../components/Inventory/Modals/IncreaseSupplyQty.vue";

const API_KEY = import.meta.env.VITE_API_KEY;

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const isOpenAddItemModal = ref(false);

const OpenAddItemModal = () => {
  isOpenAddItemModal.value = true;
}

const isOpenUpdateSelectedEquipmentModal = ref(false);

const OpenUpdateSelectedEquipmentModal = () => {
  isOpenUpdateSelectedEquipmentModal.value = true;
}

const isOpenUpdateSelectedSupplyModal = ref(false);

const OpenUpdateSelectedSupplyModal = () => {
  isOpenUpdateSelectedSupplyModal.value = true;
}

const isOpenIncreaseSupplyQtyModal = ref(false);

const OpenIncreaseSupplyQtyModal = () => {
  isOpenIncreaseSupplyQtyModal.value = true;
}
// Sample images (Replace with actual data)
const transactionItems = ref([]);
const transactionHistory = ref([]);
const officeEquipments = ref([]);
const officeSupplies = ref([]);
const officeList = ref([]);
const users = ref([]);
const borrowers = ref([]);
const equipmentCopies = ref([]);
const selectedItem = ref(null);
const searchQuery = ref("");
const categoryList = ref([]);
const isLoading = ref(true);

const inventoryFilter = ref(false);
const filterButtonRef = ref(null);
const filterMenuRef = ref(null);


const filterItems = ref([
  { id: 1, type: "Office Equipment", isActive: true },
  { id: 2, type: "Office Supply", isActive: true },
]);

// Add these methods
const toggleFilter = () => {
  inventoryFilter.value = !inventoryFilter.value;
};

const handleCheckboxChange = (id, event) => {
  event.stopPropagation();
  const item = filterItems.value.find((item) => item.id === id);
  if (item) {
    item.isActive = !item.isActive;
  }
};

let refreshInterval = null;

const fetchData = () => {
  Promise.all([
    axiosClient
      .get("/api/office_equipments", {
        headers: {
          "x-api-key": API_KEY,
        },
      })
      .then((response) => {
        officeEquipments.value = response.data.map((equipment_item) => ({
          ...equipment_item, // Spread existing data
          serial_number: equipment_item.serial_number || null,
          quantity: equipment_item.quantity || null,
          type: equipment_item.type || "Office Equipment",
        }));

        // console.log("Office Equipments:", officeEquipments.value);
      })
      .catch((error) => {
        console.error("Error fetching office eqipments:", error);
      }),

    axiosClient
      .get("/api/office_supplies", {
        headers: {
          "x-api-key": API_KEY,
        },
      })
      .then((response) => {
        officeSupplies.value = response.data.map((supply_item) => ({
          ...supply_item, // Spread existing data
          type: supply_item.type || "Office Supply",
        }));

        // console.log("Office Supplies:", officeSupplies.value);
      })
      .catch((error) => {
        console.error("Error fetching Office Supplies:", error);
      }),

    axiosClient
      .get("/api/equipment_copies", {
        headers: {
          "x-api-key": API_KEY,
        },
      })
      .then((response) => {
        equipmentCopies.value = response.data;
      })
      .catch((error) => {
        console.error("Error fetching office names:", error);
      }),

    axiosClient
      .get("/api/categories", {
        headers: {
          "x-api-key": API_KEY,
        },
      })
      .then((response) => {
        categoryList.value = response.data;
        // console.log("Office Names:", categoryList.value);
      })
      .catch((error) => {
        console.error("Error fetching office names:", error);
      }),

    axiosClient
      .get("/api/borrow_transaction_items", {
        headers: {
          "x-api-key": API_KEY,
        },
      })
      .then((response) => {
        transactionItems.value = response.data;
        // console.log("Transaction History:", transactionItems.value);
      })
      .catch((error) => {
        console.error("Error fetching office names:", error);
      }),

    axiosClient
      .get("/api/borrow_transactions", {
        headers: {
          "x-api-key": API_KEY,
        },
      })
      .then((response) => {
        transactionHistory.value = response.data;
      })
      .catch((error) => {
        console.error("Error fetching office names:", error);
      }),

    axiosClient
      .get("/api/users", {
        headers: {
          "x-api-key": API_KEY,
        },
      })
      .then((response) => {
        users.value = response.data;
      })
      .catch((error) => {
        console.error("Error fetching office names:", error);
      }),

    axiosClient
      .get("/api/borrowers", {
        headers: {
          "x-api-key": API_KEY,
        },
      })
      .then((response) => {
        borrowers.value = response.data;
      })
      .catch((error) => {
        console.error("Error fetching office names:", error);
      }),

    axiosClient
      .get("/api/offices", {
        headers: {
          "x-api-key": API_KEY,
        },
      })
      .then((response) => {
        officeList.value = response.data;
      })
      .catch((error) => {
        console.error("Error fetching office names:", error);
      }),
  ])
    .catch((error) => {
      console.error("Error fetching data:", error);
    })
    .finally(() => {
      isLoading.value = false; // Set loading to false after all requests finish
    });
};

const handleClickOutside = (event) => {
  if (
    inventoryFilter.value &&
    !filterButtonRef.value?.contains(event.target) &&
    !filterMenuRef.value?.contains(event.target)
  ) {
    inventoryFilter.value = false;
  }
};

onMounted(() => {
  fetchData();
  refreshInterval = setInterval(fetchData, 30000);

  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  clearInterval(refreshInterval);
  document.removeEventListener('click', handleClickOutside);
});

const allInventory = computed(() => {
  return [...officeEquipments.value, ...officeSupplies.value].map((item, index) => ({
    ...item,
    newId: `INV-${index + 1}`, // Generate a unique ID
  }));
});

// Update the filteredInventory computed property
const filteredInventory = computed(() => {
  const activeFilters = filterItems.value
    .filter(item => item.isActive)
    .map(item => item.type);

  let filtered = allInventory.value.filter(item =>
    activeFilters.includes(item.type)
  );

  if (!searchQuery.value) return filtered;

  const searchTerm = searchQuery.value.toLowerCase();
  return filtered.filter((item) => {
    const equipmentName = item.equipment_name?.toLowerCase() || "";
    const equipmentDescription = item.equipment_description?.toLowerCase() || "";
    const serialNumber = item.serial_number?.toString().toLowerCase() || "";
    const supplyName = item.supply_name?.toLowerCase() || "";
    const supplyDescription = item.supply_description?.toLowerCase() || "";
    const id = item.id?.toString().toLowerCase() || "";
    const newId = item.newId?.toLowerCase() || "";

    return (
      equipmentName.includes(searchTerm) ||
      equipmentDescription.includes(searchTerm) ||
      serialNumber.includes(searchTerm) ||
      supplyName.includes(searchTerm) ||
      supplyDescription.includes(searchTerm) ||
      id.includes(searchTerm) ||
      newId.includes(searchTerm)
    );
  });
});

watch(searchQuery, (newQuery) => {
  // console.log("Search Query:", newQuery);
});

watch(allInventory, (newVal) => {
  // console.log("Updated allInventory:", newVal);
});

const selectImage = (image) => {
  selectedItem.value = selectedItem.value?.newId === image.newId ? null : image;
};

// Function to close image details
const closeDetails = () => {
  selectedItem.value = null;
};

const totalCopies = computed(() => {
  if (!selectedItem.value) return 0;
  return equipmentCopies.value.filter(copy => copy.item_id === selectedItem.value.id).length;
});

const selectedCopies = computed(() => {
  if (!selectedItem.value) return [];
  return equipmentCopies.value.filter(copy => copy.item_id === selectedItem.value.id);
})

</script>

<template>
  <div class="">
    <!-- HEADER -->
    <header class="shadow">
      <div class="p-4 md:px-6 md:py-6 sm:px-6">
        <h1 class="text-3xl font-bold tracking-tight dark:text-gray-200">Inventory</h1>
      </div>
    </header>

    <div class="grid grid-cols-2 md:grid-cols-6 xl:grid-cols-8 flex items-center px-1 mb-2">
      <!-- SEARCH BAR -->
      <div class="col-span-2 mb-2 md:mb-0 md:col-span-4 xl:col-span-6 pr-2 md:pr-3">
        <form class="flex items-center" @submit.prevent>
          <label for="simple-search" class="sr-only">Search</label>
          <div class="relative w-full">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FlSearch class="w-5 h-5 text-gray-300" />
            </div>
            <input v-model="searchQuery" type="text" id="simple-search"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              placeholder="Search inventory..." />
          </div>
        </form>
      </div>

      <!-- FILTER BUTTON -->
      <div class="relative inline-block rounded-lg text-left dark:bg-slate-700 mr-3 justify-center items-center">
        <button @click="toggleFilter" ref="filterButtonRef"
          class="flex items-center justify-center w-full p-2 bg-dark dark:bg-dark-2 dark:text-gray-200">
          <span class="material-icons pr-2">filter_alt</span>
          Filter
          <span class="material-icons pl-4">arrow_drop_down</span>
        </button>
        <div v-show="inventoryFilter" ref="filterMenuRef"
          class="shadow-1 dark:shadow-box-dark absolute border border-gray-500 w-3xs right-0 z-40 mt-2 rounded-md bg-gray-200 dark:bg-gray-900 px-4 pt-2 transition-all"
          :class="{
            'top-full visible': inventoryFilter,
            'top-[110%] invisible': !inventoryFilter,
          }">
          <label class="flex items-center cursor-pointer select-none text-dark dark:text-white mb-2"
            v-for="item in filterItems" :key="item.id">
            <div class="relative">
              <input type="checkbox" class="sr-only" :checked="item.isActive"
                @change="handleCheckboxChange(item.id, $event)" />
              <div
                class="box mr-4 flex h-5 w-5 items-center justify-center rounded border border-stroke dark:border-dark-3">
                <span :class="{
                  'opacity-100': item.isActive,
                  'opacity-0': !item.isActive,
                }">
                  <svg width="11" height="8" viewBox="0 0 11 8" fill="none" xmlns="http://www.w3.org/2000/svg">
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

      <!-- ADD ITEM BUTTON -->
      <div class="mr-2">
        <button @click.stop="OpenAddItemModal()"
          class="flex items-center justify-center border w-full px-2 py-1 rounded-lg dark:border-gray-600 dark:bg-green-800 dark:hover:bg-green-700">
          <ClAddPlus class="w-8 h-8" />
          <p class="ml-1">Add Item</p>
        </button>
      </div>
    </div>

    <!-- MAIN CONTAINER -->
    <div class="border border-2 p-4 border-gray-300 dark:border-gray-800 dark:bg-black rounded-xl">
      <div v-if="isLoading" class="h-[72vh] flex items-center justify-center">
        <Loading />
      </div>
      <div class="" :class="selectedItem ? 'grid grid-cols-5 gap-4' : 'grid grid-cols-1'">
        <!-- IMAGE LIST -->
        <div v-if="!isLoading"
          class="grid gap-4 max-h-[71vh] overflow-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden col-span-1"
          :class="selectedItem ? 'hidden md:grid md:grid-cols-1 xl:grid-cols-2' : 'grid grid-cols-3 md:grid-cols-4 xl:grid-cols-5'">
          <div v-for="item in filteredInventory" :key="item.newId" @click="selectImage(item)"
            class="cursor-pointer p-2 border rounded-lg hover:shadow-lg transition duration-300 ease-in-out dark:font-bold"
            :class="selectedItem && selectedItem.newId === item.newId ? 'bg-blue-200 dark:bg-gray-300 dark:text-gray-950' : ' dark:bg-gray-900'
              ">
            <img :src="item.image_path ? `${VITE_API_BASE_URL}/storage/${item.image_path}` : image" class="w-full h-32 object-cover rounded-lg" />
            <p class="text-center mt-2 font-medium">
              {{ item.equipment_name || item.supply_name }}
            </p>
          </div>
        </div>

        <!-- IMAGE DETAILS (Shown when an image is clicked) -->
        <div v-if="selectedItem"
          class="relative max-h-[71vh] overflow-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-4 border rounded-lg transition duration-300 ease-in-out dark:bg-gray-900 col-span-5 md:col-span-4">
          <!-- CLOSE BUTTON -->
          <button @click="closeDetails"
            class="absolute top-2 right-2 bg-gray-200 text-gray-700 px-1 py-1 rounded-full hover:bg-gray-300 transition">
            <GlCloseXs class="w-8 h-8" />
          </button>
          <div class="">
            <h2 class="text-2xl font-semibold mb-4">
              {{ selectedItem.equipment_name || selectedItem.supply_name }}
            </h2>

            <!-- INFORMATION OF ITEMS -->
            <div class="grid grid-cols-3 md:grid-cols-12 xl:grid-cols-5 gap-4">
              <!-- Image -->
              <img :src="selectedItem.image_path ? `${VITE_API_BASE_URL}/storage/${selectedItem.image_path}` : image" 
                class="w-full h-[90%] object-cover rounded-lg md:col-span-4 xl:col-span-1" />

              <div class="col-span-2 md:col-span-8 xl:col-span-4">
                <!-- Description -->
                <div class="mt-4 bg-gray-800 px-4 py-2 rounded-lg">
                  <p class="text-xl font-semibold">Description:</p>
                  <p class="ml-4 text-gray-400">
                    {{ selectedItem.equipment_description || selectedItem.supply_description }}
                  </p>
                </div>

                <!-- OFFICE SUPPLY DESCRIPTION -->
                <div v-if="selectedItem.type === 'Office Supply'" class="grid grid-cols-3 gap-4">
                  <div class="mt-2 bg-gray-800 px-4 py-2 rounded-lg">
                    <p class="text-center text-gray-400">Serial Number</p>
                    <p class="text-xl text-center font-semibold text-gray-200">
                      {{ selectedItem.serial_number }}
                    </p>
                  </div>
                  <div class="mt-2 bg-gray-800 px-4 py-2 rounded-lg">
                    <p class="text-center text-gray-400">Category</p>
                    <p class="text-xl text-center font-semibold text-gray-200">
                      {{categoryList.find(category => Number(category.id) ===
                        Number(selectedItem.category_id))?.category_name || 'Unknown Category'}}
                    </p>
                  </div>
                  <div class="mt-2 bg-gray-800 px-4 py-2 rounded-lg">
                    <p class="text-center text-gray-400">Available Quantity</p>
                    <p class="text-xl text-center font-semibold text-gray-200">
                      {{ selectedItem.supply_quantity }}
                    </p>
                  </div>
                </div>

                <!-- OFFICE SUPPLY UPDATE BUTTON -->
                <div v-if="selectedItem.type === 'Office Supply'" class="mt-2 grid grid-cols-4 gap-4">
                  <button @click.stop="OpenUpdateSelectedSupplyModal()"
                    class="flex col-span-2 text-center items-center justify-center mx-auto w-full px-8 py-1 rounded-lg dark:border-gray-600 dark:bg-green-800 dark:hover:bg-green-700">
                    <ClAddPlus class="w-8 h-6" />
                    <p class="ml-1">Update Supply</p>
                  </button>

                  <button @click.stop="OpenIncreaseSupplyQtyModal()"
                    class="flex col-span-2 text-center items-center justify-center mx-auto w-full px-8 py-1 rounded-lg dark:border-gray-600 dark:bg-green-800 dark:hover:bg-green-700">
                    <ClAddPlus class="w-8 h-6" />
                    <p class="ml-1">Increase Quantity</p>
                  </button>
                </div>

                <!-- OFFICE EQUIPMENT DESCRIPTION -->
                <div v-if="selectedItem.type === 'Office Equipment'" class="grid grid-cols-2 gap-4">
                  <div class="mt-2 bg-gray-800 px-4 py-2 rounded-lg">
                    <p class="text-center text-gray-400">Category</p>
                    <p class="text-xl text-center font-semibold text-gray-200">
                      {{categoryList.find(category => Number(category.id) ===
                        Number(selectedItem.category_id))?.category_name || 'Unknown Category'}}
                    </p>
                  </div>
                  <div class="mt-2 bg-gray-800 px-4 py-2 rounded-lg">
                    <p class="text-center text-gray-400">Total Copies</p>
                    <p class="text-xl text-center font-semibold text-gray-200">
                      {{ totalCopies }}
                    </p>
                  </div>
                </div>

                <!-- OFFICE EQUIPMENT UPDATE BUTTON -->
                <div v-if="selectedItem.type === 'Office Equipment'"
                  class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2 ">
                  <div class="rounded-lg hidden md:block">
                  </div>

                  <button @click.stop="OpenUpdateSelectedEquipmentModal()"
                    class="flex col-span-2 mb-4 text-center items-center justify-center mx-auto w-full px-8 py-1 rounded-lg dark:border-gray-600 dark:bg-green-800 dark:hover:bg-green-700">
                    <ClAddPlus class="w-8 h-6" />
                    <p class="ml-1">Update Equipment</p>
                  </button>
                </div>
              </div>
            </div>

            <!-- EQUIPMENT COPIES TABLE -->
            <div v-if="selectedItem.type === 'Office Equipment'" class="">
              <EquipmentCopiesTable :selectedItem="selectedItem" :equipmentCopies="equipmentCopies" />
            </div>

            <!-- OFFICE SUPPLY TABLE TRANSACTION HISTORY -->
            <div v-if="selectedItem.type === 'Office Supply'" class=" dark:bg-black rounded-xl p-4 px-6">
              <p class="ml-2 mb-4 text-xl font-semibold rounded-lg">Transaction History for {{ selectedItem.supply_name
              }}:
              </p>
              <div class="bg-gray-800 rounded-lg w-full shadow-md">
                <OfficeSupplyTransactionHistoryTable :selectedItem="selectedItem" :transactionItems="transactionItems"
                  :transactionHistory="transactionHistory" :users="users" :officeList="officeList"
                  :borrowers="borrowers" />
              </div>
            </div>

            <!-- OFFICE EQUIPMENT TABLE TRANSACTION HISTORY -->
            <div v-if="selectedItem.type === 'Office Equipment'" class="mt-4 dark:bg-black rounded-xl p-4 px-6">
              <p class="ml-2 mb-4 text-xl font-semibold rounded-lg">Transaction History for {{
                selectedItem.equipment_name
              }}:
              </p>
              <div class="bg-gray-800 rounded-lg w-full shadow-md">
                <OfficeEquipmentTransactionHistoryTable :selectedItem="selectedItem"
                  :transactionItems="transactionItems" :transactionHistory="transactionHistory" :users="users"
                  :officeList="officeList" :borrowers="borrowers" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <AddItemModal v-if="isOpenAddItemModal" v-model="isOpenAddItemModal" :categories="categoryList" @click.stop />
    <UpdateSelectedSupply v-if="isOpenUpdateSelectedSupplyModal" v-model="isOpenUpdateSelectedSupplyModal"
      :selectedItems="selectedItem" :categories="categoryList" @click.stop />
    <UpdateSelectedEquipment v-if="isOpenUpdateSelectedEquipmentModal" v-model="isOpenUpdateSelectedEquipmentModal"
      :selectedItems="selectedItem" :categories="categoryList" :selectedCopy="selectedCopies" @click.stop />

    <IncreaseSupplyQty v-if="isOpenIncreaseSupplyQtyModal" v-model="isOpenIncreaseSupplyQtyModal"
      :selectedItems="selectedItem" @click.stop />
  </div>
</template>

<style scoped>
/* Additional styling if needed */
</style>
