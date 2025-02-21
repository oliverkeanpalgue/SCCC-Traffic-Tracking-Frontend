<script setup>
import { onMounted, ref, computed, watch } from "vue";
import axiosClient from "../axios";
import image from "./../../src/assets/baguio-logo.png";

const API_KEY = import.meta.env.VITE_API_KEY;

// Sample images (Replace with actual data)
const officeEquipments = ref([]);

const officeSupplies = ref([]);

const selectedImage = ref(null);

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
});


const allInventory = computed(() => {
  return [...officeEquipments.value, ...officeSupplies.value].map((item, index) => ({
    ...item,
    newId: `INV-${index + 1}`, // Generate a unique ID
  }));
});

watch(allInventory, (newVal) => {
  console.log("Updated allInventory:", newVal);
});

const selectImage = (image) => {
  selectedImage.value = selectedImage.value?.newId === image.newId ? null : image;
};

// Function to close image details
const closeDetails = () => {
  selectedImage.value = null;
};
</script>

<template>
  <div>
    <!-- HEADER -->
    <header class="shadow">
      <div class="p-4 md:px-6 md:py-6 sm:px-6">
        <h1 class="text-3xl font-bold tracking-tight dark:text-gray-200">Inventory</h1>
      </div>
    </header>

    <!-- MAIN CONTAINER -->
    <div class="border p-4">
      <div :class="selectedImage ? 'grid grid-cols-2 gap-4' : 'grid grid-cols-1'">
        <!-- IMAGE LIST -->
        <div
          class="grid gap-4"
          :class="selectedImage ? 'grid grid-cols-3' : 'grid grid-cols-5'"
        >
          <div
            v-for="item in allInventory"
            :key="item.id"
            @click="selectImage(item)"
            class="cursor-pointer p-2 border rounded-lg hover:shadow-lg transition"
            :class="selectedImage && selectedImage.newId === item.newId ? 'bg-blue-200' : ''"
          >
            <img
              :src="item.image_url || image"
              class="w-full h-32 object-cover rounded-lg"
            />
            <p class="text-center mt-2 font-medium">{{ item.equipment_name || item.supply_name }}</p>
          </div>
        </div>

        <!-- IMAGE DETAILS (Shown when an image is clicked) -->
        <div v-if="selectedImage" class="relative p-4 border rounded-lg">
          <!-- CLOSE BUTTON -->
          <button
            @click="closeDetails"
            class="absolute top-2 right-2 bg-gray-200 text-gray-700 px-2 py-1 rounded-full hover:bg-gray-300 transition"
          >
            ✕
          </button>

          <h2 class="text-2xl font-semibold mb-4">{{ selectedImage.equipment_name || selectedImage.supply_name }}</h2>
          <img
            :src="selectedImage.image_url || image"
            class="w-full h-40 object-cover rounded-lg"
          />
          <p class="mt-4 text-gray-700">{{ selectedImage.equipment_description || selectedImage.supply_description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Additional styling if needed */
</style>
