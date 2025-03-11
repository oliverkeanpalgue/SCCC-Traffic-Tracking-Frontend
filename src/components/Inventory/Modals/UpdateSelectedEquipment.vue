<script setup>
import { ref, onMounted, onUnmounted, defineEmits, defineProps, watch, computed } from 'vue'
import axiosClient from '../../../axios';
import { BsBoxFill } from '@kalimahapps/vue-icons';
import { FlFilledTextDescription } from '@kalimahapps/vue-icons';
import { BxSolidCategoryAlt } from '@kalimahapps/vue-icons';
import QRCodeDisplay from '../../QRCodeGenerator/QRCodeDisplay.vue';
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
  selectedCopy: Object
})

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

const equipmentName = ref('')
const equipmentDescription = ref('')
const selectedCategory = ref(null)

// Add this watch effect
watch(() => props.selectedItems, (items) => {
  if (items) {
    equipmentName.value = items.equipment_name
    equipmentDescription.value = items.equipment_description
    selectedCategory.value = items.category_id
  }
}, { immediate: true })

const confirmUpdateEquipment = async () => {
  try {
    isLoading.value = true;

    const updateEquipment = {
      equipment_name: equipmentName.value,
      equipment_description: equipmentDescription.value,
      category_id: selectedCategory.value,
    }

    console.log("Update equipment data sent: ", updateEquipment)

    const response = await axiosClient.put(
      `/api/office_equipments/${props.selectedItems.id}`,
      updateEquipment,
      {
        headers: {
          "x-api-key": API_KEY,
        },
      }
    );
    // Generate QR codes for each copy
    generatedQRCodes.value = props.selectedCopy.map((copy, index) => ({
      id: props.selectedItems.id,
      name: equipmentName.value,
      description: equipmentDescription.value,
      categoryId: selectedCategory.value,
      copyNumber: copy.copy_num || index + 1,
      serialNumber: copy.serial_number || '',
      type: 'equipment'
    }));

    console.log('Update Equipment API response:', response);
    alert('Equipment updated successfully!');
    // closeModal()
  } catch (error) {
    console.error('Error updating equipment:', error);
    console.error('Error details:', error.response?.data);
    alert('Error updating equipment. Please try again.');
  } finally {
    isLoading.value = false;
    showQRCodes.value = true;
  }
}

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
    confirmUpdateEquipment()
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
        Update Equipment
      </h3>
      <div class="flex flex-col text-start">
        <!-- EQUIPMENT NAME -->
        <label class="block mb-2 text font-medium text-gray-900 dark:text-gray-200">Equipment Name:</label>
        <div class="relative ml-2">
          <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <BsBoxFill />
          </div>
          <input type="text" v-model="equipmentName"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Ex. Printer, Chair, Stairs">
        </div>
        <!-- EQUIPMENT DESCRIPTION -->
        <label class="block mt-4 mb-2 text font-medium text-gray-900 dark:text-gray-200">Equipment
          Description:</label>
        <div class="relative ml-2">
          <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <FlFilledTextDescription />
          </div>
          <textarea type="text" v-model="equipmentDescription"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Ex. Printer, Chair, Stairs"></textarea>
        </div>
        <!-- EQUIPMENT CATEGORY -->
        <label class="block mt-4 mb-2 text font-medium text-gray-900 dark:text-gray-200">Equipment
          Category:</label>
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
          <button @click="confirmUpdateEquipment"
            class="block w-full rounded-md border bg-primary p-3 text-center text-base font-medium text-white transition bg-red-700 hover:border-red-600 hover:bg-red-600 hover:text-white dark:text-white">
            Yes, Add!
          </button>
          <button @click="showConfirmationModal = true"
            class="block w-full rounded-md border bg-primary p-3 text-center text-base font-medium text-white transition bg-green-700 hover:border-green-600 hover:bg-green-600 hover:text-white dark:text-white dark:border-green-700 dark:hover:border-green-400">
            Update
          </button>
        </div>
      </div>
    </div>
    <div v-if="showQRCodes && !isLoading" class="w-full max-w-[60vw] max-h-[80vh] overflow-auto bg-white rounded-[20px] p-8 dark:bg-gray-700">
      <QRCodeDisplay :qr-codes="generatedQRCodes" :on-print="handlePrint" :on-close="closeQRDisplay" />
    </div>

    <!-- CONFIRMATION MODAL -->
    <ConfirmationModal v-model="showConfirmationModal" title="Confirm Update"
      :message="`You are about to update this equipment with the updated information:`"
      :messageData="`\nName: ${equipmentName}\nDescription: ${equipmentDescription}\nCategory: ${categories.find(category => category.id === selectedCategory)?.category_name || 'Unknown'}`"
      cancelText="Cancel" confirmText="Confirm Update" @confirm="confirmAction" />
  </div>
</template>
