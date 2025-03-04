<script setup>
import { ref, onMounted, onUnmounted, defineEmits, defineProps } from 'vue'
import { CaCategories, MdDeleteForever } from '@kalimahapps/vue-icons';
import axiosClient from '../../../axios';

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
        
        console.log('Equipment API response:', response);
        alert('Equipment added successfully!');
        closeModal()
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
        console.log('Supply API response:', response);
        alert('Supply added successfully!');
        closeModal();
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
        Add Item
      </h3>

      <div class="flex flex-col">
        <label class="text-start">Choose Office Equipment or Supply</label>
        <select v-model="selectedOffice">
          <option v-for="office in officeDropdown" :key="office.id" :value="office.id">
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
          <button @click="confirmAddItem"
            class="block w-full rounded-md border bg-primary p-3 text-center text-base font-medium text-white transition bg-red-700 hover:border-red-600 hover:bg-red-600 hover:text-white dark:text-white">
            Yes, Add!
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
