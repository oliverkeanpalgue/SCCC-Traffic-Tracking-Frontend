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

const API_KEY = import.meta.env.VITE_API_KEY;

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

onMounted(() => {
  fetchData();
  refreshInterval = setInterval(fetchData, 5000);
});

onUnmounted(() => {
  clearInterval(refreshInterval);
});

const allInventory = computed(() => {
  return [...officeEquipments.value, ...officeSupplies.value].map((item, index) => ({
    ...item,
    newId: `INV-${index + 1}`, // Generate a unique ID
  }));
});

const filteredInventory = computed(() => {
  if (!searchQuery.value) return allInventory.value;

  const searchTerm = searchQuery.value.toLowerCase();
  return allInventory.value.filter((item) => {
    // Search in equipment properties
    const equipmentName = item.equipment_name?.toLowerCase() || "";
    const equipmentDescription = item.equipment_description?.toLowerCase() || "";
    const serialNumber = item.serial_number?.toString().toLowerCase() || "";
    const equipmentType = item.type?.toLowerCase() || "";

    // Search in supply properties
    const supplyName = item.supply_name?.toLowerCase() || "";
    const supplyDescription = item.supply_description?.toLowerCase() || "";
    const supplyType = item.type?.toLowerCase() || "";

    // Search in common properties
    const id = item.id?.toString().toLowerCase() || "";
    const newId = item.newId?.toLowerCase() || "";

    return (
      equipmentName.includes(searchTerm) ||
      equipmentDescription.includes(searchTerm) ||
      serialNumber.includes(searchTerm) ||
      equipmentType.includes(searchTerm) ||
      supplyName.includes(searchTerm) ||
      supplyDescription.includes(searchTerm) ||
      supplyType.includes(searchTerm) ||
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
</script>

<template>
  <div class="">
    <!-- HEADER -->
    <header class="shadow">
      <div class="p-4 md:px-6 md:py-6 sm:px-6">
        <h1 class="text-3xl font-bold tracking-tight dark:text-gray-200">Inventory</h1>
      </div>
    </header>

    <div class="grid grid-cols-12 flex items-center mb-2">
      <div class="col-span-11 pr-3">
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
      <div v-if="isLoading" class="h-[74vh] flex items-center justify-center">
        <Loading />
      </div>
      <div class="" :class="selectedItem ? 'grid grid-cols-5 gap-4' : 'grid grid-cols-1'">
        <!-- IMAGE LIST -->
        <div v-if="!isLoading"
          class="grid gap-4 max-h-[73vh] overflow-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden col-span-1"
          :class="selectedItem ? 'grid grid-cols-2' : 'grid grid-cols-5'">
          <div v-for="item in filteredInventory" :key="item.newId" @click="selectImage(item)"
            class="cursor-pointer p-2 border rounded-lg hover:shadow-lg  transition duration-300 ease-in-out dark:bg-gray-900"
            :class="selectedItem && selectedItem.newId === item.newId ? 'bg-blue-200 dark:bg-gray-200 dark:text-gray-900' : ''
              ">
            <img :src="item.image_url || image" class="w-full h-32 object-cover rounded-lg" />
            <p class="text-center mt-2 font-medium">
              {{ item.equipment_name || item.supply_name }}
            </p>
          </div>
        </div>

        <!-- IMAGE DETAILS (Shown when an image is clicked) -->
        <div v-if="selectedItem"
          class="relative max-h-[73vh] overflow-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-4 border rounded-lg transition duration-300 ease-in-out dark:bg-gray-900 col-span-4">
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
            <div class="grid grid-cols-5 gap-4">
              <!-- Image -->
              <img :src="selectedItem.image_url || image" class="w-full h-[90%] object-cover rounded-lg" />

              <div class="col-span-4">
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
                  <div class="rounded-lg">
                  </div>

                  <button @click.stop="OpenUpdateSelectedSupplyModal()"
                    class="flex col-span-2 text-center items-center justify-center mx-auto w-full px-8 py-1 rounded-lg dark:border-gray-600 dark:bg-green-800 dark:hover:bg-green-700">
                    <ClAddPlus class="w-8 h-6" />
                    <p class="ml-1">Update Supply</p>
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
                <div v-if="selectedItem.type === 'Office Equipment'" class="mt-2 grid grid-cols-4 gap-4">
                  <div class="rounded-lg">
                  </div>

                  <button @click.stop="OpenUpdateSelectedEquipmentModal()"
                    class="flex col-span-2 text-center items-center justify-center mx-auto w-full px-8 py-1 rounded-lg dark:border-gray-600 dark:bg-green-800 dark:hover:bg-green-700">
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
            <div v-if="selectedItem.type === 'Office Supply'" class="mt-4 ">
              <p class="ml-2 text-xl font-semibold rounded-lg">Transaction History for {{ selectedItem.supply_name }}:
              </p>
              <div class="bg-gray-800 rounded-lg w-full shadow-md">
                <OfficeSupplyTransactionHistoryTable :selectedItem="selectedItem" :transactionItems="transactionItems"
                  :transactionHistory="transactionHistory" :users="users" :officeList="officeList"
                  :borrowers="borrowers" />
              </div>
            </div>

            <!-- OFFICE EQUIPMENT TABLE TRANSACTION HISTORY -->
            <div v-if="selectedItem.type === 'Office Equipment'" class="mt-4 ">
              <p class="ml-2 text-xl font-semibold rounded-lg">Transaction History for {{ selectedItem.equipment_name
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

    <AddItemModal v-if="isOpenAddItemModal" v-model="isOpenAddItemModal" @click.stop />
    <UpdateSelectedSupply v-if="isOpenUpdateSelectedSupplyModal" v-model="isOpenUpdateSelectedSupplyModal"
      :selectedItems="selectedItem" @click.stop />
    <UpdateSelectedEquipment v-if="isOpenUpdateSelectedEquipmentModal" v-model="isOpenUpdateSelectedEquipmentModal"
      :selectedItems="selectedItem" @click.stop />
  </div>
</template>

<style scoped>
/* Additional styling if needed */
</style>
