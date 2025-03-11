<script setup>
import { ref, onMounted, onUnmounted, defineEmits, defineProps, watch, computed } from 'vue'
import axiosClient from '../../../axios';
import QRCodeDisplay from '../../QRCodeGenerator/QRCodeDisplay.vue';
import { BsBoxFill } from '@kalimahapps/vue-icons';
import { FlFilledTextDescription } from '@kalimahapps/vue-icons';
import { BxSolidCategoryAlt } from '@kalimahapps/vue-icons';
import { AnOutlinedNumber } from '@kalimahapps/vue-icons';
import Loading from '../../Loading.vue';
import ConfirmationModal from '../../ConfirmationModal.vue';
const API_KEY = import.meta.env.VITE_API_KEY;

const isLoading = ref(false)

const showQRCodes = ref(false)
const generatedQRCodes = ref([])

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
    // Generate QR codes with updated values
    generatedQRCodes.value = [{
      id: props.selectedItems.id,
      name: supplyName.value,
      description: supplyDescription.value,
      serialNumber: serialNumber.value,
      categoryId: selectedCategory.value,
      quantity: parseInt(supplyQuantity.value),
      type: 'supply'
    }];

    showQRCodes.value = true;
    console.log('Update Supplies API response:', response);
    alert('Supply updated successfully!');
    // closeModal()
  } catch (error) {
    console.error('Error updating supplies:', error);
    console.error('Error details:', error.response?.data);
    alert('Error updating supplies. Please try again.');
  } finally {
    isLoading.value = false;
  }
}

// Add these required functions
const handlePrint = () => {
  window.print();
}

const closeQRDisplay = () => {
  showQRCodes.value = false;
  closeModal();
}

const showConfirmationModal = ref(false)

const confirmAction = (confirmed) => {
  if (confirmed) {
    confirmUpdateSupply()
  }
}
</script>

<template>
  <div v-if="modelValue"
    class="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black/70 px-4 py-5">
    <Loading v-if="isLoading" />
    <div v-if="!showQRCodes && !isLoading" ref="modalContainer"
      class="w-full max-w-[650px] rounded-[20px] bg-white px-8 py-8 text-center border border-4 dark:bg-gray-950 dark:border-gray-100">
      <h3 class="text-3xl font-semibold mb-4">
        Update Supply
      </h3>
      <div class="flex flex-col text-start">
        <!-- SUPPLY NAME -->
        <label class="block mb-2 text font-medium text-gray-900 dark:text-gray-200">Supply Name:</label>
        <div class="relative ml-2">
          <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <BsBoxFill />
          </div>
          <input type="text" v-model="supplyName"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Ex. Printer, Chair, Stairs">
        </div>
        <!-- SUPPLY DESCRIPTION -->
        <label class="block mt-4 mb-2 text font-medium text-gray-900 dark:text-gray-200">Supply
          Description:</label>
        <div class="relative ml-2">
          <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <FlFilledTextDescription />
          </div>
          <textarea type="text" v-model="supplyDescription"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Ex. Printer, Chair, Stairs"></textarea>
        </div>
        <!-- SUPPLY CATEGORY -->
        <label class="block mt-4 mb-2 text font-medium text-gray-900 dark:text-gray-200">Supply Category:</label>

        <div class="relative">
          <div class="absolute inset-y-0 start-2 flex items-center ps-3.5 pointer-events-none">
            <BxSolidCategoryAlt />
          </div>
          <div class="pr-2">
            <select v-model="selectedCategory"
              class="border rounded-lg ml-2 w-full text-sm pl-9  dark:text-gray-100 h-10 dark:bg-gray-700 dark:border-gray-600 pl-4 ">
              <option v-for="category in props.categories" :key="category.id" :value="category.id">
                {{ category.category_name }}
              </option>
            </select>
          </div>
        </div>
        <!-- SERIAL NUMBER -->
        <label class="block mt-4 mb-2 text font-medium text-gray-900 dark:text-gray-200">Serial Number:</label>
        <div class="relative ml-2">
          <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <BsBoxFill />
          </div>
          <input type="text" v-model="serialNumber"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Ex. Printer, Chair, Stairs">
        </div>
        <!-- EQUIPMENT QUANTITY -->
        <label class="block mt-4 mb-2 text font-medium text-gray-900 dark:text-gray-200">Supply Quantity:</label>
        <div class="relative ml-2">
          <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <AnOutlinedNumber />
          </div>
          <input type="number" v-model="supplyQuantity"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
        </div>
      </div>

      <!-- BUTTONS -->
      <div class="-mx-3 flex flex-wrap mt-4">
        <div class="w-1/2 px-3">
          <button @click="closeModal"
            class="block w-full rounded-md border border-stroke p-3 text-center text-base font-medium text-dark transition bg-gray-300 hover:border-red-800 hover:bg-red-800 hover:text-white dark:text-black">
            Cancel
          </button>
        </div>
        <div class="w-1/2 px-3">
          <button @click="showConfirmationModal = true"
            class="block w-full rounded-md border bg-primary p-3 text-center text-base font-medium text-white transition bg-green-700 hover:border-green-600 hover:bg-green-600 hover:text-white dark:text-white dark:border-green-700 dark:hover:border-green-400">
            Update
          </button>
        </div>
      </div>
    </div>
    <!-- QR CODE DISPLAY -->
    <div v-if="showQRCodes && !isLoading" class="w-full max-w-[1000px] bg-white rounded-[20px] p-8 dark:bg-gray-700">
      <QRCodeDisplay :qr-codes="generatedQRCodes" :on-print="handlePrint" :on-close="closeQRDisplay" />
    </div>
    <!-- CONFIRMATION MODAL -->
    <ConfirmationModal v-model="showConfirmationModal" title="Confirm Update"
      :message="`You are about to update this supply with the updated information:`"
      :messageData="`\nName: ${supplyName}\nDescription: ${supplyDescription}\nCategory: ${categories.find(category => category.id === selectedCategory)?.category_name || 'Unknown'}\nSerial Number: ${serialNumber}\nQuantity: ${supplyQuantity}`"
      cancelText="Cancel" confirmText="Confirm Update" @confirm="confirmAction" />
  </div>
</template>
