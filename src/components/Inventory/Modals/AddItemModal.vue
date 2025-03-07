<script setup>
import { ref, onMounted, onUnmounted, defineEmits, defineProps } from 'vue'
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
import { AnOutlinedNumber } from '@kalimahapps/vue-icons';

const API_KEY = import.meta.env.VITE_API_KEY;

const isLoading = ref(false)

const props = defineProps({
  modelValue: Boolean,
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

const selectedOffice = ref(null)
const selectedCategory = ref(null)
const equipmentName = ref('')
const equipmentDescription = ref('')
const supplyName = ref('')
const supplyDescription = ref('')
const serialNumber = ref('')
const supplyQuantity = ref('')
const equipmentQuantity = ref('')

const categories = ref([]);

const fetchCategory = async () => {
  try {
    const response = await axiosClient.get('/api/categories', {
      headers: {
        "x-api-key": API_KEY,
      },
    });
    categories.value = response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    alert('Failed to fetch categories');
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  fetchCategory();
});

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
        const addData = {
          equipment_name: equipmentName.value,
          equipment_description: equipmentDescription.value,
          category_id: selectedCategory.value,
        }
        console.log('Equipment data to be sent:', addData);

        const response = await axiosClient.post(
          `/api/office_equipments/`,
          addData,
          {
            headers: {
              "x-api-key": API_KEY,
            },
          }
        );

        await addEquipmentCopies(response.data.data.id);

        // Generate QR codes for each equipment copy
        equipmentQRCodes.value = Array.from({ length: parseInt(equipmentQuantity.value) }, (_, index) => ({
          id: response.data.data.id,
          copyNumber: index + 1,
          name: equipmentName.value,
          description: equipmentDescription.value,
          categoryId: selectedCategory.value
        }));

        showQRCodes.value = true;
        console.log('Equipment API response:', response);
        console.log('Equipment API response:', response);
        alert('Equipment added successfully!');
        // closeModal()
      } catch (error) {
        console.error('Error adding equipment:', error);
        console.error('Error details:', error.response?.data);
        alert('Error adding equipment. Please try again.');
      }
    } else if (selectedOffice.value === 2) {
      try {
        const addData = {
          supply_name: supplyName.value,
          supply_description: supplyDescription.value,
          serial_number: serialNumber.value,
          category_id: selectedCategory.value,
          supply_quantity: supplyQuantity.value
        }
        console.log('Supply data to be sent:', addData);

        const response = await axiosClient.post(
          `/api/office_supplies/`,
          addData,
          {
            headers: {
              "x-api-key": API_KEY,
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
          quantity: supplyQuantity.value,  // Include total quantity instead of copyNumber
          type: 'supply'
        }];

        showQRCodes.value = true;

        console.log('Supply API response:', response);
        alert('Supply added successfully!');
        // closeModal();
      } catch (error) {
        console.error('Error adding supply:', error);
        console.error('Error details:', error.response?.data);
        alert('Error adding supply. Please try again.');
      }
    }
  } catch (error) {
    console.error('Error adding item:', error);
    console.error('Error details:', error.response?.data);
    alert('Error adding item. Please try again.');
  } finally {
    openAddItemConfirmationModal.value = false;
    selectedBreadCrumbPhase.value = 3;
    isLoading.value = false;
  }
}

// Add function to print QR codes
const printQRCodes = () => {
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>${selectedOffice.value === 1 ? 'Equipment' : 'Supply'} QR Codes</title>
        <style>
          .qr-container {
            display: inline-block;
            margin: 10px;
            padding: 15px;
            border: 1px solid #ccc;
            text-align: center;
            page-break-inside: avoid;
            width: 25%;
          }
          .qr-details {
            margin-top: 10px;
            font-size: 12px;
          }
            #qr-codes {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
          }
          img {
            width: 180px;  /* Increased QR code size */
            height: 180px;  /* Increased QR code size */
          }
          @media print {
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div id="qr-codes">
          ${equipmentQRCodes.value.map((qrData, index) => `
            <div class="qr-container">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify(qrData))}" />
              <div class="qr-details">
                ${qrData.copyNumber ? `<p style="font-size: 16px; font-weight: bold;">${qrData.name} #${qrData.copyNumber}</p>` : `${qrData.name}`}
                ${qrData.serialNumber ? `<p class="serial-number">S/N: ${qrData.serialNumber}</p>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </body>
    </html>
  `);

  // Wait for images to load before printing
  printWindow.document.close();
  printWindow.onload = function () {
    printWindow.focus();
    printWindow.print();
    setTimeout(() => {
      printWindow.close();
    }, 1000);
  };
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

const openAddItemConfirmationModal = ref(false);
const setOpenAddItemConfirmationModal = (passedValue) => {
  openAddItemConfirmationModal.value = passedValue;
}
</script>

<template>
  <div v-if="modelValue" class="fixed left-0 top-0 flex h-full w-full items-center justify-center px-4 py-5">
    <div ref="modalContainer"
      class="w-full max-w-[1350px] h-[85vh] overflow-auto rounded-[20px] bg-white p-4 text-center border border-3 dark:border-gray-300 dark:bg-gray-950">

      <!-- Breadcrumb -->
      <nav
        class="flex px-5 py-1 text-gray-700 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
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

      <!-- PHASES -->
      <div>
        <!-- PHASE 1 -->
        <div v-if="selectedBreadCrumbPhase === 1" class="flex flex-col items-center mt-15">
          <p class="text-3xl mb-4">Create a New Item</p>
          <p class="mb-8">Choose the type of item that you want to create</p>
          <div class="grid grid-cols-2 gap-20 item-center justify-center">
            <div class="">
              <button @click="changeSelectedBreadCrumbCategory('equipment', 2, 1)"
                class="p-4 border border-dashed border-2 rounded-3xl w-80 h-80 justify-center dark:border-gray-300 dark:hover:bg-black dark:hover:border-solid dark:hover:border-blue-500 dark:hover:text-blue-200">
                <AkShippingBox02 class="mb-3 w-23 h-23 w-full items-center justify-center" />
                <p class="font-bold text-xl mb-3">Office Equipment</p>
                <p class="text-sm">Track fixed assets like printers and chairs</p>
              </button>
            </div>
            <div>
              <button @click="changeSelectedBreadCrumbCategory('supply', 2, 2)"
                class="border border-dashed border-2 rounded-3xl w-80 h-80 justify-center dark:border-gray-300 dark:hover:bg-black dark:hover:border-solid dark:hover:border-blue-500 dark:hover:text-blue-200">
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
            <div class="px-80 text-start">
              <p class="text-3xl mb-8 text-center mt-8">Input Equipment Details</p>
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
              <div class="pr-2">
                <select v-model="selectedCategory"
                  class="border rounded-lg ml-2 w-full dark:text-gray-200 h-10 dark:bg-gray-700 dark:border-gray-600 pl-4 ">
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.category_name }}
                  </option>
                </select>
              </div>
              <!-- EQUIPMENT QUANTITY -->
              <label class="block mt-4 mb-2 text font-medium text-gray-900 dark:text-gray-200">Equipment
                Quantity:</label>
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
            <div class="px-80 text-start">
              <p class="text-3xl mb-8 text-center mt-8">Input Supply Details</p>
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
              <div class="pr-2">
                <select v-model="selectedCategory"
                  class="border rounded-lg ml-2 w-full dark:text-gray-200 h-10 dark:bg-gray-700 dark:border-gray-600 pl-4 ">
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.category_name }}
                  </option>
                </select>
              </div>
              <!-- SERIAL NUMBER -->
              <label class="block mt-4 mb-2 text font-medium text-gray-900 dark:text-gray-200">Supply Number:</label>
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
          </div>

          <div class="flex flex-wrap ml-1 px-80 mt-6">
            <div class="w-full pl-1">
              <button @click="setOpenAddItemConfirmationModal(true)"
                class="block w-full rounded-md border p-3 text-center text-base font-medium text-white transition bg-emerald-700  border-emerald-600 hover:border-emerald-500 hover:bg-emerald-600 hover:text-white dark:text-white">
                Add Item Confirmation
              </button>
            </div>
          </div>
        </div>

        <!-- PHASE 3 -->
        <div v-if="selectedBreadCrumbPhase === 3" class="flex flex-col items-center mt-8">
          <p class="text-3xl mb-8 text-center mt-8">Generated QR Codes</p>
          <div class="grid grid-cols-3 gap-4 w-full">
            <div v-for="(qrData, index) in equipmentQRCodes" :key="index" class="border p-4 rounded-lg dark:bg-gray-900">
              <QRCode :value="JSON.stringify(qrData)" :size="250" level="I" class="m-auto border-8" />
              <div class="mt-2 text-lg">
                <p class="font-bold">SCCC - MITD Inventory</p>
                <p v-if="qrData.type !== 'equipment'">
                  {{ `${qrData.name} #${qrData.copyNumber}` }}
                </p>
                <p v-if="qrData.serialNumber" class="text-gray-600 text-lg">
                  SN: {{ qrData.serialNumber }}
                </p>
              </div>
            </div>
          </div>
          <div class="mt-4 flex gap-2 justify-center">
            <button @click="printQRCodes" class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              Print QR Codes
            </button>
            <button @click="closeModal" class="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
              Close
            </button>
          </div>
        </div>
      </div>

      <!-- QR Codes Section -->
      <div v-if="showQRCodes" class="mt-4">
      </div>
    </div>

    <!-- CONFIRMATION MODAL -->
    <div class="fixed left-0 top-0 flex h-full min-h-screen w-full items-center justify-center bg-gray-950/50 px-4 py-5"
      :class="{ block: openAddItemConfirmationModal, hidden: !openAddItemConfirmationModal }">
      <div ref="modalContainer"
        class="w-full max-w-[570px] rounded-[20px] bg-white border px-8 py-12 text-center dark:bg-gray-800 md:px-[70px] md:py-[60px]">
        <h3 class="pb-[18px] text-xl font-semibold text-dark dark:text-white sm:text-2xl">
          Confirm Addition
        </h3>
        <span class="mx-auto mb-6 inline-block h-1 w-[90px] rounded bg-primary"></span>
        <p class="mb-10 text-base leading-relaxed text-body-color dark:text-dark-6">
          Are you sure you want to add <strong>{{ supplyName || equipmentName }}</strong> to the inventory?
        </p>
        <div class="-mx-3 flex flex-wrap">
          <div class="w-1/2 px-3">
            <button @click="setOpenAddItemConfirmationModal(false)" ref="trigger"
              class="block w-full rounded-md border border-stroke p-3 text-center text-base font-medium text-dark transition hover:border-red-600 hover:bg-red-600 hover:text-white dark:text-white">
              No, Cancel
            </button>
          </div>
          <div class="w-1/2 px-3">
            <button @click="confirmAddItem"
              class="block w-full rounded-md border border-primary bg-primary p-3 text-center text-base font-medium text-white transition hover:bg-blue-dark">
              Yes, Add Item
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
