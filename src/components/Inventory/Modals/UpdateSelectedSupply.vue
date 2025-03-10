<script setup>
import { ref, onMounted, onUnmounted, defineEmits, defineProps, watch, computed } from 'vue'
import { CaCategories, MdDeleteForever } from '@kalimahapps/vue-icons';
import axiosClient from '../../../axios';

const API_KEY = import.meta.env.VITE_API_KEY;

const isLoading = ref(false)

const props = defineProps({
  modelValue: Boolean,
  selectedItems: Object,
  categories: Object,
})

console.log("Selected Items: ", props.selectedItems)

const emit = defineEmits(['update:modelValue', 'confirmDelete'])

const modalContainer = ref(null)

const closeModal = () => {
  emit('update:modelValue', false) // Notify parent to close modal
}

const handleClickOutside = (event) => {
  if (modalContainer.value && !modalContainer.value.contains(event.target)) {
    closeModal()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const supplyName = ref('')
const supplyDescription = ref('')
const serialNumber = ref('')
const selectedCategory = ref(null)
const supplyQuantity = ref('')

// Add this watch effect
watch(() => props.selectedItems, (items) => {
  if (items) {
    supplyName.value = items.supply_name
    supplyDescription.value = items.supply_description
    serialNumber.value = items.serial_number
    selectedCategory.value = items.category_id
    supplyQuantity.value = items.supply_quantity
  }
}, { immediate: true })

const confirmUpdateSupply = async () => {
  try {
    isLoading.value = true;

      const updateSupply = {
        supply_name: supplyName.value,
        supply_description: supplyDescription.value,
        serial_number: serialNumber.value,
        category_id: selectedCategory.value,
        supply_quantity: supplyQuantity.value
      }

      console.log("Update supply data sent: ", updateSupply)

      const response = await axiosClient.put(
        `/api/office_supplies/${props.selectedItems.id}`,
        updateSupply,
        {
          headers: {
            "x-api-key": API_KEY,
          },
        }
      );
      console.log('Update Supplies API response:', response);
    alert('Supply updated successfully!');
    closeModal()
  } catch (error) {
    console.error('Error updating supplies:', error);
    console.error('Error details:', error.response?.data);
    alert('Error updating supplies. Please try again.');
  } finally {
    isLoading.value = false;
  }
}

</script>

<template>
  <div v-if="modelValue" class="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-dark/90 px-4 py-5">
    <div ref="modalContainer"
      class="w-full max-w-[570px] rounded-[20px] bg-white px-8 py-8 text-center dark:bg-dark-2 border dark:bg-gray-700">
      <div class="flex justify-center text-center">
        <span class="flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
          <MdDeleteForever class="text-4xl text-red-600 " />
        </span>
      </div>
      <h3 class="text-3xl mb-5 mt-1 font-semibold text-dark dark:text-white">
        Update Supply
      </h3>
      <div class="flex flex-col">
        <label class="text-start">Supply Name</label>
        <input v-model="supplyName" type="text" class="" placeholder="Enter text here" />
        <label class="text-start">Supply Description</label>
        <input v-model="supplyDescription" type="text" class="" placeholder="Enter text here" />
        <label class="text-start">Serial Number</label>
        <input v-model="serialNumber" type="text" class="" placeholder="Enter text here" />
        <label class="text-start">Supply Quantity</label>
        <input v-model="supplyQuantity" type="number" class="" placeholder="Enter text here" />
        <label class="text-start">Category Name</label>
          <select v-model="selectedCategory">
            <option v-for="category in props.categories" :key="category.id" :value="category.id">
              {{ category.category_name }}
            </option>
          </select>
        <label class="text-start">Supply Quantity</label>
        <input v-model="supplyQuantity" type="number" class="" placeholder="Enter text here" />
      </div>
      <p class="text-base mb-2 leading-relaxed text-body-color dark:text-dark-6">
        Are you sure you want to update this Transaction?
      </p>
      <div class="-mx-3 flex flex-wrap">
        <div class="w-1/2 px-3">
          <button @click="closeModal"
            class="block w-full rounded-md border border-stroke p-3 text-center text-base font-medium text-dark transition bg-gray-200 hover:border-green-800 hover:bg-green-800 hover:text-white dark:text-black">
            No, Keep it.
          </button>
        </div>
        <div class="w-1/2 px-3">
          <button @click="confirmUpdateSupply"
            class="block w-full rounded-md border bg-primary p-3 text-center text-base font-medium text-white transition bg-red-700 hover:border-red-600 hover:bg-red-600 hover:text-white dark:text-white">
            Yes, Add!
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
