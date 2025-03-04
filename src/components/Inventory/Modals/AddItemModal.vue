<script setup>
import { ref, onMounted, onUnmounted, defineEmits, defineProps } from 'vue'
import { CaCategories, MdDeleteForever } from '@kalimahapps/vue-icons';
import axiosClient from '../../../axios';
import QRCode from 'qrcode.vue'
import { BxMessageSquareAdd } from '@kalimahapps/vue-icons';

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

const officeDropdown = [
  {
    id: 1,
    name: "Office Equipment"
  },
  {
    id: 2,
    name: "Office Supply"
  }
]

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
                <p style="font-size: 16px; font-weight: bold;">
                  ${qrData.type === 'supply' ? 'Supply' : `Equipment #${qrData.copyNumber}`}
                </p>
                <p>${qrData.name}</p>
                <p>${qrData.description || ''}</p>
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

</script>

<template>
  <div v-if="modelValue" class="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-dark/90 px-4 py-5">
    <div ref="modalContainer"
      class="w-full max-w-[570px] rounded-[20px] bg-white px-8 py-4 text-center dark:bg-dark-2 border dark:bg-gray-700">
      

<!-- Breadcrumb -->
<nav class="flex px-5 py-3 text-gray-700 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700" aria-label="Breadcrumb">
  <ol class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
    <li class="inline-flex items-center">
      <a href="#" class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white">
        <svg class="w-3 h-3 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
          <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
        </svg>
        Home
      </a>
    </li>
    <li>
      <div class="flex items-center">
        <svg class="rtl:rotate-180 block w-3 h-3 mx-1 text-gray-400 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
        </svg>
        <a href="#" class="ms-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ms-2 dark:text-gray-400 dark:hover:text-white">Templates</a>
      </div>
    </li>
    <li aria-current="page">
      <div class="flex items-center">
        <svg class="rtl:rotate-180  w-3 h-3 mx-1 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
        </svg>
        <span class="ms-1 text-sm font-medium text-gray-500 md:ms-2 dark:text-gray-400">Flowbite</span>
      </div>
    </li>
  </ol>
</nav>

      <div class="flex justify-center items-center text-center">
        <span class="flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
          <BxMessageSquareAdd class="text-4xl text-green-600 " />
        </span>
        <h3 class="text-3xl ml-3 font-semibold text-dark dark:text-white">
          Add Item
        </h3>
      </div>

      <div class="flex flex-col">
        <label class="text-start">Choose Office Equipment or Supply</label>
        <select v-model="selectedOffice">
          <option v-for="office in officeDropdown" :key="office.id" :value="office.id" class="bg-gray-600 text-gray-200">
            {{ office.name }}
          </option>
        </select>

        <!-- for office equipment -->
        <div v-if="selectedOffice === 1" class="flex flex-col">
          <label class="text-start">Equipment Name</label>
          <input v-model="equipmentName" type="text" class="" placeholder="Enter text here" />

          <label class="text-start">Equipment Description</label>
          <input v-model="equipmentDescription" type="text" class="" placeholder="Enter text here" />
          <label class="text-start">Category Name</label>
          <select v-model="selectedCategory">
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.category_name }}
            </option>
          </select>
          <label class="text-start">Equipment Quantity</label>
          <input v-model="equipmentQuantity" type="text" class="" placeholder="Enter text here" />
        </div>

        <!-- for office supply -->
        <div v-if="selectedOffice === 2" class="flex flex-col">
          <label class="text-start">Supply Name</label>
          <input v-model="supplyName" type="text" class="" placeholder="Enter text here" />
          <label class="text-start">Supply Description</label>
          <input v-model="supplyDescription" type="text" class="" placeholder="Enter text here" />
          <label class="text-start">Serial Number</label>
          <input v-model="serialNumber" type="text" class="" placeholder="Enter text here" />
          <label class="text-start">Category Name</label>
          <select v-model="selectedCategory">
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.category_name }}
            </option>
          </select>
          <label class="text-start">Supply Quantity</label>
          <input v-model="supplyQuantity" type="text" class="" placeholder="Enter text here" />
        </div>
      </div>

      <!-- Confirmation Message -->
      <p v-if="!showQRCodes" class="text-base my-4 leading-relaxed text-body-color dark:text-dark-6">
        Are you sure you want to add this item?
      </p>

      <!-- QR Codes Section -->
      <div v-if="showQRCodes" class="mt-4">
        <h4 class="text-lg font-semibold mb-2">
          {{ selectedOffice === 1 ? 'Equipment' : 'Supply' }} QR Codes
        </h4>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="(qrData, index) in equipmentQRCodes" :key="index" class="border p-4 rounded-lg">
            <QRCode :value="JSON.stringify(qrData)" :size="150" level="H" />
            <div class="mt-2 text-sm">
              <p class="font-semibold">
                {{ qrData.type === 'supply' ? 'Supply' : `Equipment #${qrData.copyNumber}` }}
              </p>
              <p>{{ qrData.name }}</p>
              <p v-if="qrData.serialNumber" class="text-gray-600 text-xs">
                S/N: {{ qrData.serialNumber }}
              </p>
              <p v-if="qrData.type === 'supply'" class="text-gray-600 text-xs">
                Quantity: {{ qrData.quantity }}
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


      <div v-if="!showQRCodes" class="-mx-3 flex flex-wrap">
        <div class="w-1/2 px-3">
          <button @click="closeModal"
            class="block w-full rounded-md border border-stroke p-3 text-center text-base font-medium text-dark transition bg-gray-200 hover:border-green-800 hover:bg-green-800 hover:text-white dark:text-black">
            No, Keep it.
          </button>
        </div>
        <div class="w-1/2 px-3">
          <button @click="confirmAddItem"
            class="block w-full rounded-md border bg-primary p-3 text-center text-base font-medium text-white transition bg-red-700 hover:border-red-600 hover:bg-red-600 hover:text-white dark:text-white">
            Yes, Add!
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
