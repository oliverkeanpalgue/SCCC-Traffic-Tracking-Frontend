<script setup>
import { ref, onMounted, onUnmounted, defineEmits, defineProps, watch, computed } from 'vue'
import { CaCategories, MdDeleteForever } from '@kalimahapps/vue-icons';
import axiosClient from '../../../axios';
import QRCodeDisplay from '../../QRCodeGenerator/QRCodeDisplay.vue';

const API_KEY = import.meta.env.VITE_API_KEY;

const showQRCodes = ref(false)
const generatedQRCodes = ref([])

const isLoading = ref(false)

const props = defineProps({
  modelValue: Boolean,
  selectedItems: Object,
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

const supplyQty = ref('')

const confirmUpdateQty = async () => {
  try {
    isLoading.value = true;
    const updateQty = {
      supply_quantity: props.selectedItems.supply_quantity + supplyQty.value
    }

    console.log("Update supply quantity data sent: ", updateQty)

    const response = await axiosClient.put(
      `/api/office_supplies/${props.selectedItems.id}`,
      updateQty,
      {
        headers: {
          "x-api-key": API_KEY,
        },
      }
    );
    
    // Generate QR codes after successful update
    generatedQRCodes.value = [{
      id: props.selectedItems.id,
      name: props.selectedItems.supply_name,
      description: props.selectedItems.supply_description,
      serialNumber: props.selectedItems.serial_number,
      categoryId: props.selectedItems.category_id,
      quantity: parseInt(supplyQty.value),
      type: 'supply'
    }];

    showQRCodes.value = true;
    console.log('Update office Quantity API response:', response);
    alert('Office Quantity updated successfully!');

    // closeModal()
  } catch (error) {
    console.error('Error updating office quantity:', error);
    console.error('Error details:', error.response?.data);
    alert('Error updating office quantity. Please try again.');
  } finally {
    isLoading.value = false;
  }
}

const handlePrint = () => {
  window.print();
}

const closeQRDisplay = () => {
  showQRCodes.value = false;
  closeModal();
}


</script>

<template>
  <div v-if="modelValue" class="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-dark/90 px-4 py-5">
    <div v-if="!showQRCodes" ref="modalContainer"
      class="w-full max-w-[570px] rounded-[20px] bg-white px-8 py-8 text-center dark:bg-dark-2 border dark:bg-gray-700">
      <div class="flex justify-center text-center">
        <span class="flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
          <MdDeleteForever class="text-4xl text-red-600 " />
        </span>
      </div>
      <h3 class="text-3xl mb-5 mt-1 font-semibold text-dark dark:text-white">
        Increase Supply Quantity
      </h3>
      <div class="flex flex-col">
        <label class="text-start">Supply Quantity</label>
        <input v-model="supplyQty" type="number" class="" placeholder="Enter text here" />
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
          <button @click="confirmUpdateQty"
            class="block w-full rounded-md border bg-primary p-3 text-center text-base font-medium text-white transition bg-red-700 hover:border-red-600 hover:bg-red-600 hover:text-white dark:text-white">
            Yes, Add!
          </button>
        </div>
      </div>
    </div>
    <!-- QR Code Display -->
    <div v-else class="w-full max-w-[1000px] bg-white rounded-[20px] p-8 dark:bg-gray-700">
      <QRCodeDisplay 
        :qr-codes="generatedQRCodes"
        :on-print="handlePrint"
        :on-close="closeQRDisplay"
      />
    </div>
  </div>
</template>
