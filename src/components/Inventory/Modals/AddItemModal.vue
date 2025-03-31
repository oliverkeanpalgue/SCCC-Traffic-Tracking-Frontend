<script setup>
import { ref, onMounted, onUnmounted, defineEmits, defineProps, watch } from 'vue'
import { CaCategories, MdDeleteForever } from '@kalimahapps/vue-icons';
import axiosClient from '../../../axios';
import QRCode from 'qrcode.vue'
import { BxMessageSquareAdd } from '@kalimahapps/vue-icons';
import { IcOpenSelectHandGesture } from '@kalimahapps/vue-icons';
import { MdRoundNavigateNext } from '@kalimahapps/vue-icons';
import { AkShippingBox02 } from '@kalimahapps/vue-icons';
import { FaPenRuler } from '@kalimahapps/vue-icons';
import { BsBoxFill } from '@kalimahapps/vue-icons';
import { FlFilledTextDescription } from '@kalimahapps/vue-icons';
import { BxSolidCategoryAlt } from '@kalimahapps/vue-icons';
import { AnOutlinedNumber } from '@kalimahapps/vue-icons';
import { GlCloseXs } from '@kalimahapps/vue-icons';
import QRCodeDisplay from '../../QRCodeGenerator/QRCodeDisplay.vue';
import ConfirmationModal from '../../ConfirmationModal.vue';
import Loading from '../../Loading.vue';

// FOR THE TOAST
import emitter from "../../../eventBus";

const API_KEY = import.meta.env.VITE_API_KEY;

const isLoading = ref(false)

const props = defineProps({
  modelValue: Boolean,
  categories: Object,
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

// for qr logics
const showQRCodes = ref(false)
const equipmentQRCodes = ref([])

// user inputs
const selectedImage = ref(null);
const selectedOffice = ref(null)
const selectedCategory = ref(null)
const equipmentName = ref('')
const equipmentDescription = ref('')
const supplyName = ref('')
const supplyDescription = ref('')
const serialNumber = ref('')
const supplyQuantity = ref('')
const equipmentQuantity = ref('')

// for image
const handleImageUpload = (event) => {
  selectedImage.value = event.target.files[0];
};

const errors = ref({
  selectedImage: [],
  selectedOffice: [],
  selectedCategory: [],
  equipmentName: [],
  equipmentDescription: [],
  supplyName: [],
  supplyDescription: [],
  serialNumber: [],
  supplyQuantity: [],
  equipmentQuantity: [],
})

// watch effect for validation
watch(() => selectedImage.value, (newValue) => {
  if (!newValue) {
    errors.value.selectedImage = ["Image is required"];
  } else {
    errors.value.selectedImage = [];
  }
});

watch(() => selectedOffice.vakye, (newValue) => {
  if (!newValue) {
    errors.value.selectedOffice = ["Office is required"];
  } else {
    errors.value.selectedOffice = [];
  }
});

watch(() => selectedCategory.value, (newValue) => {
  if (!newValue) {
    errors.value.selectedCategory = ["Category is required"];
  } else {
    errors.value.selectedCategory = [];
  }
});

watch(() => equipmentName.value, (newValue) => {
  if (!newValue) {
    errors.value.equipmentName = ["Equipment name is required"];
  } else {
    errors.value.equipmentName = [];
  }
});

watch(() => equipmentDescription.value, (newValue) => {
  if (!newValue) {
    errors.value.equipmentDescription = ["Equipment description is required"];
  } else {
    errors.value.equipmentDescription = [];
  }
});

watch(() => supplyName.value, (newValue) => {
  if (!newValue) {
    errors.value.supplyName = ["Supply name is required"];
  } else {
    errors.value.supplyName = [];
  }
});

watch(() => supplyDescription.value, (newValue) => {
  if (!newValue) {
    errors.value.supplyDescription = ["Supply description is required"];
  } else {
    errors.value.supplyDescription = [];
  }
});

watch(() => serialNumber.value, (newValue) => {
  if (!newValue) {
    errors.value.serialNumber = ["Serial number is required"];
  } else {
    errors.value.serialNumber = [];
  }
});

watch(() => supplyQuantity.value, (newValue) => {
  if (!newValue) {
    errors.value.supplyQuantity = ["Supply quantity is required"];
  } else {
    errors.value.supplyQuantity = [];
  }
});

watch(() => equipmentQuantity.value, (newValue) => {
  if (!newValue) {
    errors.value.equipmentQuantity = ["Equipment Quantity is required"];
  } else {
    errors.value.equipmentQuantity = [];
  }
});

const validateForm = () => {
  Object.keys(errors.value).forEach(key => {
    errors.value[key] = [];
  });

  let hasErrors = false;

  if (!selectedImage.value) {
    errors.value.selectedImage = ["Image is required"];
    hasErrors = true;
  }

  if (!selectedOffice.value) {
    errors.value.selectedOffice = ["Office is required"];
    hasErrors = true;
  }

  if (!selectedCategory.value) {
    errors.value.selectedCategory = ["Category is required"];
    hasErrors = true;
  }

  if (!equipmentName.value) {
    errors.value.equipmentName = ["Equipment name is required"];
    hasErrors = true;
  }

  if (!equipmentDescription.value) {
    errors.value.equipmentDescription = ["Equipment description is required"];
    hasErrors = true;
  }

  if (!supplyName.value) {
    errors.value.supplyName = ["Supply name is required"];
    hasErrors = true;
  }

  if (!supplyDescription.value) {
    errors.value.supplyDescription = ["Supply description is required"];
    hasErrors = true;
  }

  if (!serialNumber.value) {
    errors.value.serialNumber = ["Serial number is required"];
    hasErrors = true;
  }

  if (!supplyQuantity.value) {
    errors.value.supplyQuantity = ["Supply quantity is required"];
    hasErrors = true;
  }

  if (!equipmentQuantity.value) {
    errors.value.equipmentQuantity = ["Equipment copy is required"];
    hasErrors = true;
  }

  return !hasErrors;
}

const isClickedShowSupplyConfirmationModal = () => {
  if (!validateForm()) {
    return;
  } else {
    showSupplyConfirmationModal = true
  }
}

const isClickShowSupplyConfirmationModal = () => {
  if (!validateForm()) {
    return;
  } else {
    showSupplyConfirmationModal = true
  }
}

const addEquipmentCopies = async (equipmentId) => {
  try {
    const quantity = parseInt(equipmentQuantity.value);
    for (let i = 1; i <= quantity; i++) {
      const copyData = {
        item_id: equipmentId,
        is_available: true,
        copy_num: i
      };

      await axiosClient.post('/api/equipment_copies', copyData, {
        headers: {
          "x-api-key": API_KEY,
        },
      });
    }
  } catch (error) {
    console.error('Error adding equipment copies:', error);
    throw error;
  }
}


const confirmAddItem = async () => {
  try {

    console.log("🚀 ~ ADDING ITEM ~ isLoading:", isLoading)
    isLoading.value = true;

    if (selectedOffice.value === 1) {
      try {
        const formData = new FormData();
        formData.append('equipment_name', equipmentName.value);
        formData.append('equipment_description', equipmentDescription.value);
        formData.append('category_id', selectedCategory.value);

        if (selectedImage.value) {
          formData.append('image', selectedImage.value);
        }

        const response = await axiosClient.post(
          `/api/office_equipments/`,
          formData,
          {
            headers: {
              "x-api-key": API_KEY,
              "Content-Type": "multipart/form-data"
            },
          }
        );

        // Use the correct path to the equipment ID
        if (response.data && response.data.data && response.data.data.equipment && response.data.data.equipment.id) {
          const equipmentId = response.data.data.equipment.id;

          await addEquipmentCopies(equipmentId);

          // Generate QR codes for each equipment copy
          equipmentQRCodes.value = Array.from({ length: parseInt(equipmentQuantity.value) }, (_, index) => ({
            id: equipmentId,
            copyNumber: index + 1,
            name: equipmentName.value,
            description: equipmentDescription.value,
            categoryId: selectedCategory.value
          }));

          showQRCodes.value = true;
          console.log('Equipment API response:', response);
          emitter.emit("show-toast", { message: "Equipment Added Successfully!", type: "success" });
          selectedBreadCrumbPhase.value = 3;
          isLoading.value = false;
        } else {
          console.error('Invalid response structure:', response);
        }
      } catch (error) {
        console.error('Error adding equipment:', error);
        console.error('Error details:', error.response?.data);
        emitter.emit("show-toast", { message: "Error adding equipment. Please try again.", type: "error" });
        selectedBreadCrumbPhase.value = 2;
        isLoading.value = false;
      }
    } else if (selectedOffice.value === 2) {
      try {
        const formData = new FormData();
        formData.append('supply_name', supplyName.value);
        formData.append('supply_description', supplyDescription.value);
        formData.append('serial_number', serialNumber.value);
        formData.append('category_id', selectedCategory.value);
        formData.append('supply_quantity', supplyQuantity.value);

        if (selectedImage.value) {
          formData.append('image', selectedImage.value);
        }

        const response = await axiosClient.post(
          `/api/office_supplies/`,
          formData,
          {
            headers: {
              "x-api-key": API_KEY,
              "Content-Type": "multipart/form-data"
            },
          }
        );

        // Generate QR codes for supplies
        equipmentQRCodes.value = [{
          id: response.data.data.id,
          name: supplyName.value,
          description: supplyDescription.value,
          serialNumber: serialNumber.value,
          categoryId: selectedCategory.value,
          type: 'supply'
        }];

        showQRCodes.value = true;

        console.log('Supply API response:', response, formData);
        emitter.emit("show-toast", { message: "Supply Added Successfully!", type: "success" });
        selectedBreadCrumbPhase.value = 3;
        isLoading.value = false;
      } catch (error) {
        console.error('Error adding supply:', error);
        console.error('Error details:', error.response?.data);
        emitter.emit("show-toast", { message: "Error adding supply. Please try again.", type: "error" });
        selectedBreadCrumbPhase.value = 2;
        isLoading.value = false;
      }
    }
  } catch (error) {
    console.error('Error adding item:', error);
    console.error('Error details:', error.response?.data);
  }
}

const handlePrint = () => {
  window.print();
}

const closeQRDisplay = () => {
  showQRCodes.value = false;
  closeModal();
}

// FOR BREADCRUMB
const selectedBreadCrumbPhase = ref(1);
const selectedBreadCrumbCategory = ref(null);

const changeSelectedBreadCrumbCategory = (category, phase, office) => {
  console.log("🚀 ~ changeSelectedBreadCrumbCategory ~ changeSelectedBreadCrumbCategory:", changeSelectedBreadCrumbCategory)
  selectedBreadCrumbCategory.value = category;
  selectedBreadCrumbPhase.value = phase;
  selectedOffice.value = office;
}

const showEquipmentConfirmationModal = ref(false)

const confirmEquipmentAction = (confirmed) => {
  if (confirmed) {
    confirmAddItem()
  }
}

const showSupplyConfirmationModal = ref(false)

const confirmSupplyAction = (confirmed) => {
  if (confirmed) {
    confirmAddItem()
  }
}
</script>

<template>
  <div v-if="modelValue"
    class="fixed left-0 top-0 flex h-full w-full items-center justify-center px-4 py-5 z-50 bg-black/70">
    <Loading v-if="isLoading" />
    <div v-else ref="modalContainer"
      class="w-full lg:max-w-[1100px] 2xl:max-w-[1200px] 3xl:max-w-[1350px] h-[90vh] rounded-[20px] bg-white p-4 text-center border border-3 dark:border-gray-300 dark:bg-gray-950">
      <div class="flex flex-row">
        <!-- Breadcrumb -->
        <nav
          class="flex px-5 py-1 w-[95%] text-gray-700 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
          aria-label="Breadcrumb">
          <ol class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
            <li class="inline-flex items-center">
              <button @click="changeSelectedBreadCrumbCategory(null, 1, null)"
                class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white">
                <IcOpenSelectHandGesture class="w-5 h-5 ml-1 mr-2" />
                Select Category
              </button>
            </li>
            <li v-if="selectedBreadCrumbPhase > 1">
              <div class="flex items-center">
                <MdRoundNavigateNext class="w-7 h-7 ml-1 text-gray-400" />
                <button v-if="selectedBreadCrumbCategory === 'equipment'"
                  @click="changeSelectedBreadCrumbCategory('equipment', 2, 1)"
                  class="ms-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ms-2 dark:text-gray-400 dark:hover:text-white">
                  Office Equipment Details
                </button>
                <button v-if="selectedBreadCrumbCategory === 'supply'"
                  @click="changeSelectedBreadCrumbCategory('supply', 2, 2)"
                  class="ms-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ms-2 dark:text-gray-400 dark:hover:text-white">
                  Office Supply Details
                </button>
              </div>
            </li>
            <li aria-current="page" v-if="selectedBreadCrumbPhase > 2">
              <div class="flex items-center">
                <MdRoundNavigateNext class="w-7 h-7 ml-1 text-gray-400" />
                <span class="ms-1 text-sm font-medium text-gray-500 md:ms-2 dark:text-gray-400">Print QR Code</span>
              </div>
            </li>
          </ol>
        </nav>

        <!-- CLOSE BUTTON -->
        <button @click="closeModal()"
          class="justify-end bg-gray-200 ml-4 text-gray-700 px-1 py-1 rounded-full hover:bg-gray-300 transition">
          <GlCloseXs class="w-8 h-8" />
        </button>
      </div>
      <!-- PHASES -->
      <div>
        <!-- PHASE 1 -->
        <div v-if="selectedBreadCrumbPhase === 1" class="flex flex-col items-center mt-15">
          <p class="text-3xl mb-4">Create a New Item</p>
          <p class="mb-8">Choose the type of item that you want to create</p>
          <div class="grid grid-cols-2 gap-5 sm:gap-10 md:gap-20 item-center justify-center">
            <div class="">
              <button @click="changeSelectedBreadCrumbCategory('equipment', 2, 1)"
                class="p-4 border border-dashed border-2 rounded-3xl w-65 sm:w-75 md:w-80 h-80 justify-center dark:border-gray-300 dark:hover:bg-black dark:hover:border-solid dark:hover:border-blue-500 dark:hover:text-blue-200">
                <AkShippingBox02 class="mb-3 w-23 h-23 w-full items-center justify-center" />
                <p class="font-bold text-xl mb-3">Office Equipment</p>
                <p class="text-sm">Track fixed assets like printers and chairs</p>
              </button>
            </div>
            <div>
              <button @click="changeSelectedBreadCrumbCategory('supply', 2, 2)"
                class="border border-dashed border-2 rounded-3xl w-65 sm:w-75 md:w-80 h-80 justify-center dark:border-gray-300 dark:hover:bg-black dark:hover:border-solid dark:hover:border-blue-500 dark:hover:text-blue-200">
                <FaPenRuler class="mb-5 w-20 h-20 w-full items-center justify-center" />
                <p class="font-bold text-xl mb-3">Office Supply</p>
                <p class="text-sm">Manage consumables like paper and pens.</p>
              </button>
            </div>
          </div>
        </div>
        <!-- PHASE 2 -->
        <div v-if="selectedBreadCrumbPhase === 2">
          <!-- FOR EQUIPMENT -->
          <div v-if="selectedBreadCrumbCategory === 'equipment'">
            <div class="px-5 sm:px-20 md:px-45 lg:px-55 xl:px-60 2xl:px-70 text-start">
              <p class="text-3xl mb-8 text-center mt-8">Input Equipment Details</p>
              <!-- EQUIPMENT IMAGE -->
              <div class="flex flex-row mt-4 mb-2">
                <label class="block text font-medium text-gray-900 dark:text-gray-200">Equipment Image:</label>
                <p class="text-red-700 ml-2 font-semibold italic">{{ errors.selectedImage ? errors.selectedImage[0] : ''
                  }}</p>
              </div>
              <div class="relative ml-2">
                <input type="file" @change="handleImageUpload" accept="image/*"
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">

              </div>
              <!-- EQUIPMENT NAME -->
              <div class="flex flex-row">
                <label class="block mb-2 text font-medium text-gray-900 dark:text-gray-200">Equipment Name:</label>
                <p class="text-red-700 ml-2 font-semibold italic">{{ errors.equipmentName ? errors.equipmentName[0] : ''
                  }}</p>
              </div>
              <div class="relative ml-2">
                <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                  <BsBoxFill />
                </div>
                <input type="text" v-model="equipmentName"
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Ex. Printer, Chair, Stairs">

              </div>
              <!-- EQUIPMENT DESCRIPTION -->
              <div class="flex flex-row mt-4 mb-2">
                <label class="block text font-medium text-gray-900 dark:text-gray-200">Equipment
                  Description:</label>
                <p class="text-red-700 ml-2 font-semibold italic">{{ errors.equipmentDescription ?
                  errors.equipmentDescription[0] : '' }}</p>
              </div>
              <div class="relative ml-2">
                <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                  <FlFilledTextDescription />
                </div>
                <textarea type="text" v-model="equipmentDescription"
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Ex. Printer, Chair, Stairs"></textarea>

              </div>
              <!-- EQUIPMENT CATEGORY -->
              <div class="flex flex-row mt-4 mb-2">
                <label class="block text font-medium text-gray-900 dark:text-gray-200">Equipment
                  Category:</label>
                <p class="text-red-700 ml-2 font-semibold italic">{{ errors.selectedCategory ?
                  errors.selectedCategory[0] : '' }}</p>
              </div>

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
              <!-- EQUIPMENT QUANTITY -->
              <div class="flex flex-row mt-4 mb-2">
                <label class="block text font-medium text-gray-900 dark:text-gray-200">Equipment
                  Quantity:</label>
                <p class="text-red-700 ml-2 font-semibold italic">{{ errors.equipmentQuantity ?
                  errors.equipmentQuantity[0] : '' }}</p>
              </div>

              <div class="relative ml-2">
                <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                  <AnOutlinedNumber />
                </div>
                <input type="number" v-model="equipmentQuantity"
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
              </div>
            </div>
          </div>
          <!-- FOR SUPPLY -->
          <div v-if="selectedBreadCrumbCategory === 'supply'">
            <div class="px-5 sm:px-20 md:px-45 lg:px-55 xl:px-60 2xl:px-70 text-start">
              <p class="text-3xl mb-8 text-center mt-8">Input Supply Details</p>
              <!-- SUPPLY IMAGE -->
              <div class="flex flex-row mt-4 mb-2">
                <label class="block text font-medium text-gray-900 dark:text-gray-200">Supply Image:</label>
                <p class="text-red-700 ml-2 font-semibold italic">{{ errors.selectedImage ? errors.selectedImage[0] : ''
                  }}</p>
              </div>

              <div class="relative ml-2">
                <input type="file" @change="handleImageUpload" accept="image/*"
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
              </div>
              <!-- SUPPLY NAME -->
              <div class="flex flex-row">
                <label class="block mb-2 text font-medium text-gray-900 dark:text-gray-200">Supply Name:</label>
                <p class="text-red-700 ml-2 font-semibold italic">{{ errors.supplyName ? errors.supplyName[0] : '' }}
                </p>
              </div>
              <div class="relative ml-2">
                <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                  <BsBoxFill />
                </div>
                <input type="text" v-model="supplyName"
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Ex. Printer, Chair, Stairs">
              </div>
              <!-- SUPPLY DESCRIPTION -->
              <div class="flex flex-row mt-4 mb-2">
                <label class="block text font-medium text-gray-900 dark:text-gray-200">Supply
                  Description:</label>
                <p class="text-red-700 ml-2 font-semibold italic">{{ errors.supplyDescription ?
                  errors.supplyDescription[0] : '' }}</p>
              </div>
              <div class="relative ml-2">
                <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                  <FlFilledTextDescription />
                </div>
                <textarea type="text" v-model="supplyDescription"
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Ex. Printer, Chair, Stairs"></textarea>
              </div>
              <!-- SUPPLY CATEGORY -->
              <div class="flex flex-row mt-4 mb-2">
                <label class="block text font-medium text-gray-900 dark:text-gray-200">Supply Category:</label>
                <p class="text-red-700 ml-2 font-semibold italic"> {{ errors.selectedCategory ?
                  errors.selectedCategory[0] : '' }}</p>
              </div>
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
              <div class="flex flex-row mt-4 mb-2">
                <label class="block text font-medium text-gray-900 dark:text-gray-200">Supply Number:</label>
                <p class="text-red-700 ml-2 font-semibold italic">{{ errors.serialNumber ? errors.serialNumber[0] : ''
                  }}</p>
              </div>
              <div class="relative ml-2">
                <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                  <BsBoxFill />
                </div>
                <input type="text" v-model="serialNumber"
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Ex. Printer, Chair, Stairs">
              </div>
              <!-- EQUIPMENT QUANTITY -->
              <div class="flex flex-row mt-4 mb-2">
                <label class="block text font-medium text-gray-900 dark:text-gray-200">Supply Quantity:</label>
                <p class="text-red-700 ml-2 font-semibold italic">{{ errors.supplyQuantity ? errors.supplyQuantity[0] :
                  '' }}</p>
              </div>

              <div class="relative ml-2">
                <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                  <AnOutlinedNumber />
                </div>
                <input type="number" v-model="supplyQuantity"
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
              </div>
            </div>
          </div>

          <div class="flex flex-wrap ml-1 px-5 sm:px-20 md:px-45 lg:px-55 xl:px-60 2xl:px-70  mt-6">
            <div class="w-full pl-1">
              <button v-if="selectedBreadCrumbCategory === 'equipment'" @click="isClickedShowSupplyConfirmationModal()"
                class="block w-full rounded-md border p-2 text-center text-base font-medium text-white transition bg-emerald-700  border-emerald-600 hover:border-emerald-500 hover:bg-emerald-600 hover:text-white dark:text-white">
                Add Equipment
              </button>
              <button v-if="selectedBreadCrumbCategory === 'supply'" @click="isClickShowSupplyConfirmationModal()"
                class="block w-full rounded-md border p-2 text-center text-base font-medium text-white transition bg-emerald-700  border-emerald-600 hover:border-emerald-500 hover:bg-emerald-600 hover:text-white dark:text-white">
                Add Supply
              </button>
            </div>
          </div>
        </div>

        <div v-if="selectedBreadCrumbPhase === 3" class="mt-8">
          <QRCodeDisplay :qr-codes="equipmentQRCodes" :on-print="handlePrint" :on-close="closeQRDisplay" />
        </div>
      </div>

      <!-- QR Codes Section -->
      <div v-if="showQRCodes" class="mt-4">
      </div>
    </div>

    <!-- EQUIPMENT Confirmation Modal -->
    <ConfirmationModal v-model="showEquipmentConfirmationModal" title="Confirm Addition"
      :message="`You are about to add this Equipment.`"
      :messageData="`\nEquipment Name: ${equipmentName}\nDescription: ${equipmentDescription}\nCategory: ${categories.find(category => category.id === selectedCategory)?.category_name || 'Unknown Category'}\nCop${equipmentQuantity === 1 ? 'y' : 'ies'}: ${equipmentQuantity}`"
      cancelText="Cancel" confirmText="Confirm Adding" @confirm="confirmEquipmentAction" />

    <!-- SUPPLY Confirmation Modal -->
    <ConfirmationModal v-model="showSupplyConfirmationModal" title="Confirm Addition"
      :message="`You are about to add this Supply.`"
      :messageData="`\nSupply Name: ${supplyName}\nDescription: ${supplyDescription}\nCategory: ${categories.find(category => category.id === selectedCategory)?.category_name || 'Unknown Category'}\nSerial Number: ${serialNumber}\nQuantity: ${supplyQuantity}`"
      cancelText="Cancel" confirmText="Confirm Adding" @confirm="confirmSupplyAction" />
  </div>
</template>
