<script setup>
import { ref, onMounted, onUnmounted, defineEmits, defineProps, watch, computed } from 'vue'
import { CaCategories, MdDeleteForever } from '@kalimahapps/vue-icons';
import axiosClient from '../../../axios';
import { ClAddPlus } from '@kalimahapps/vue-icons';
import { AnOutlinedNumber } from '@kalimahapps/vue-icons';
import ConfirmationModal from '../../ConfirmationModal.vue';

const API_KEY = import.meta.env.VITE_API_KEY;

const isLoading = ref(false)

const props = defineProps({
  modelValue: Boolean,
  selectedItems: Object,
  equipmentCopies: Object,
})

const showConfirmationModal = ref(false)

const confirmAction = (confirmed) => {
  if (confirmed) {
    console.log("User confirmed the action!") 
    // Call your API or any function here
  } else {
    console.log("User canceled the action.")
  }
}

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

const copyQuantity = ref('')

const confirmAddCopy = async () => {
  try {
    isLoading.value = true;
    const quantity = parseInt(copyQuantity.value);

    const highestCopyNum = Math.max(...props.equipmentCopies.map(copy => copy.copy_num));

    for (let i = 0; i < quantity; i++) {
      const addCopy = {
        item_id: props.equipmentCopies[0].item_id,
        is_available: 1,
        copy_num: highestCopyNum + i + 1,
      }

      console.log("Add copy data sent: ", addCopy)

      const response = await axiosClient.post(
        `/api/equipment_copies/`,
        addCopy,
        {
          headers: {
            "x-api-key": API_KEY,
          },
        }
      );
      console.log('Add Copies API response:', response);
    }
    alert('Copy/Copies added successfully!');
    closeModal()
  } catch (error) {
    console.error('Error adding copies:', error);
    console.error('Error details:', error.response?.data);
    alert('Error adding copies. Please try again.');
  } finally {
    isLoading.value = false;
  }
}

const openAddEquipmentCopyConfirmationModal = ref(false);
const setOpenAddEquipmentCopyConfirmationModal = (passedValue) => {
  openAddEquipmentCopyConfirmationModal.value = passedValue;
}
</script>

<template>
  <div v-if="modelValue"
    class="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black/55 px-4 py-5">
    <div ref="modalContainer"
      class="w-full max-w-[650px] rounded-[20px] bg-white px-8 py-8 text-center border border-4 dark:bg-gray-950 dark:border-gray-100">
      <h3 class="text-3xl font-semibold mb-4">
        Add Copy
      </h3>
      <!-- QUANTITY INPUT -->
      <div class="text-start">
        <label class="block mt-4 mb-2 text font-medium text-gray-900 dark:text-gray-200">Copy Quantity to be Added:</label>
        <div class="relative ml-2">
          <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <AnOutlinedNumber />
          </div>
          <input type="number" v-model="copyQuantity" placeholder="Enter quantity..."
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
        </div>
      </div>

      <div class="-mx-3 flex flex-wrap mt-4">
        <div class="w-1/2 px-3">
          <button @click="closeModal"
            class="block w-full rounded-md border border-stroke p-3 text-center text-base font-medium text-dark transition bg-gray-300 hover:border-red-800 hover:bg-red-800 hover:text-white dark:text-black">
            Cancel
          </button>
        </div>
        <div class="w-1/2 px-3">
          <button @click="setOpenAddEquipmentCopyConfirmationModal(true)"          
            class="block w-full rounded-md border bg-primary p-3 text-center text-base font-medium text-white transition bg-green-700 hover:border-green-600 hover:bg-green-600 hover:text-white dark:text-white dark:border-green-700 dark:hover:border-green-400">
            Add Copy    
          </button>
        </div>
      </div>

      <button @click="showConfirmationModal = true" class="bg-blue-500 text-white p-2 rounded">Open Modal</button>

  <ConfirmationModal
    v-model="showConfirmationModal"
    title="Confirm Addition"
    :message="`Are you sure you want to add ${copyQuantity} cop${copyQuantity === 1 ? 'y' : 'ies'}?`"
    cancelText="No, Cancel"
    confirmText="Yes, Add"
    @confirm="confirmAction"
  />
    </div>

    <!-- CONFIRMATION MODAL -->
    <div class="fixed left-0 top-0 flex h-full min-h-screen w-full items-center justify-center bg-gray-950/50 px-4 py-5"
      :class="{ block: openAddEquipmentCopyConfirmationModal, hidden: !openAddEquipmentCopyConfirmationModal }">
      <div ref="modalContainer"
        class="w-full max-w-[570px] rounded-[20px] bg-white border px-8 py-12 text-center dark:bg-gray-800 md:px-[70px] md:py-[60px]">
        <h3 class="pb-[18px] text-xl font-semibold text-dark dark:text-white sm:text-2xl">
          Confirm Addition
        </h3>
        <span class="mx-auto mb-6 inline-block h-1 w-[90px] rounded bg-primary"></span>
      <p class="text-base mb-2 leading-relaxed text-body-color dark:text-dark-6">
        Are you sure you want to add {{ copyQuantity }} cop{{ copyQuantity === 1 ? 'y' : 'ies' }} to this transaction?
      </p>
        <div class="-mx-3 flex flex-wrap">
          <div class="w-1/2 px-3">
            <button @click="setOpenAddEquipmentCopyConfirmationModal(false)" ref="trigger"
              class="block w-full rounded-md border border-stroke p-3 text-center text-base font-medium text-dark transition hover:border-red-600 hover:bg-red-600 hover:text-white dark:text-white">
              No, Cancel
            </button>
          </div>
          <div class="w-1/2 px-3">
            <button @click="confirmAddCopy"
              class="block w-full rounded-md border border-primary bg-primary p-3 text-center text-base font-medium text-white transition hover:bg-blue-dark">
              Yes, Add Cop{{ copyQuantity === 1 ? 'y' : 'ies' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
