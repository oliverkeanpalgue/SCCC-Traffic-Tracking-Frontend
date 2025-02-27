<script setup>
import { onMounted, ref, computed, watch } from "vue";
import axiosClient from "../axios";
import image from "./../../src/assets/baguio-logo.png";

const API_KEY = import.meta.env.VITE_API_KEY;

// Sample images (Replace with actual data)
const officeEquipments = ref([]);
const officeSupplies = ref([]);
const selectedItem = ref(null);
const searchQuery = ref("");
const categoryList = ref([]);

onMounted(() => {
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

      console.log("Office Equipments:", officeEquipments.value);
    })
    .catch((error) => {
      console.error("Error fetching office eqipments:", error);
    });

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

      console.log("Office Supplies:", officeSupplies.value);
    })
    .catch((error) => {
      console.error("Error fetching Office Supplies:", error);
    });

  axiosClient
    .get("/api/categories", {
      headers: {
        "x-api-key": API_KEY,
      },
    })
    .then((response) => {
      categoryList.value = response.data;
      console.log("Office Names:", categoryList.value);
    })
    .catch((error) => {
      console.error("Error fetching office names:", error);
    });
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
  console.log("Search Query:", newQuery);
});

watch(allInventory, (newVal) => {
  console.log("Updated allInventory:", newVal);
});

const selectImage = (image) => {
  selectedItem.value = selectedItem.value?.newId === image.newId ? null : image;
};

// Function to close image details
const closeDetails = () => {
  selectedItem.value = null;
};
</script>

<template>
  <div class="">
    <!-- HEADER -->
    <header class="shadow">
      <div class="p-4 md:px-6 md:py-6 sm:px-6">
        <h1 class="text-3xl font-bold tracking-tight dark:text-gray-200">Inventory</h1>
      </div>
    </header>

    <div class="w-full mb-2">
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
            placeholder="Search inventory..." />
        </div>
      </form>
    </div>

    <!-- MAIN CONTAINER -->
    <div class="border border-gray-800 border-2 p-4 bg-black rounded-xl">
      <div class="" :class="selectedItem ? 'grid grid-cols-2 gap-4' : 'grid grid-cols-1'">
        <!-- IMAGE LIST -->
        <div
          class="grid gap-4 max-h-[74vh] overflow-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          :class="selectedItem ? 'grid grid-cols-3' : 'grid grid-cols-5'">
          <div v-for="item in filteredInventory" :key="item.newId" @click="selectImage(item)"
            class="cursor-pointer p-2 border rounded-lg hover:shadow-lg  transition duration-300 ease-in-out bg-gray-900" :class="selectedItem && selectedItem.newId === item.newId ? 'bg-blue-200 dark:bg-gray-200 dark:text-gray-900' : ''
              ">
            <img :src="item.image_url || image" class="w-full h-32 object-cover rounded-lg" />
            <p class="text-center mt-2 font-medium">
              {{ item.equipment_name || item.supply_name }}
            </p>
          </div>
        </div>

        <!-- IMAGE DETAILS (Shown when an image is clicked) -->
        <div v-if="selectedItem" class="relative p-4 border rounded-lg bg-gray-900 transition duration-300 ease-in-out">
          <!-- CLOSE BUTTON -->
          <button @click="closeDetails"
            class="absolute top-2 right-2 bg-gray-200 text-gray-700 px-2 py-1 rounded-full hover:bg-gray-300 transition">
            ✕
          </button>
          <div
            class="max-h-[70vh] overflow-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <h2 class="text-2xl font-semibold mb-4">
              {{ selectedItem.equipment_name || selectedItem.supply_name }}
            </h2>
            <img :src="selectedItem.image_url || image" class="w-full h-40 object-cover rounded-lg" />
            <div class="mt-4 bg-gray-800 px-4 py-2 rounded-lg">
              <p class="text-xl font-semibold">Description:</p>
              <p class="ml-4 text-gray-400">
                {{ selectedItem.equipment_description || selectedItem.supply_description }}
              </p>
            </div>
            <!-- OFFICE SUPPLY -->
            <div v-if="selectedItem.type === 'Office Supply'" class="grid grid-cols-3 gap-4 ">
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
                    Number(selectedItem.category_id))?.category_name || 'Unknown Category' }}
                </p>
              </div>
              <div class="mt-2 bg-gray-800 px-4 py-2 rounded-lg">
                <p class="text-center text-gray-400">Available Quantity</p>
                <p class="text-xl text-center font-semibold text-gray-200">
                  {{ selectedItem.supply_quantity }} pieces
                </p>
              </div>
            </div>
            <!-- OFFICE SUPPLY TABLE TRANSACTION HISTORY-->
            <div v-if="selectedItem.type === 'Office Supply'"
              class="mt-2 bg-gray-800 px-4 py-2 rounded-lg w-full border">
              <table>
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Borrower</th>
                    <th>Office</th>
                    <th>Lender</th>
                    <th>Return Date & Time</th>
                    <th>Borrow Date & Time</th>
                  </tr>
                </thead>
                <tbody>

                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Additional styling if needed */
</style>
