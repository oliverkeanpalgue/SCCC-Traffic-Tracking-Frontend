<script setup>
import { ref, onMounted, onUnmounted, defineEmits, defineProps } from 'vue'
import { MdDeleteForever } from '@kalimahapps/vue-icons';
import axiosClient from '../../../axios';
import { FlCheckboxChecked } from '@kalimahapps/vue-icons';
import { FlCheckboxUnchecked } from '@kalimahapps/vue-icons';
import { AkCheck } from '@kalimahapps/vue-icons';
import { RaCross2 } from '@kalimahapps/vue-icons';

const API_KEY = import.meta.env.VITE_API_KEY;

const isLoading = ref(false)

const props = defineProps({
  modelValue: Boolean, // v-model binding for modal open state
  transactionName: String, // Pass the transaction name
  transaction: Object,
  officeEquipments: Object,
  officeSupplies: Object,
  equipmentCopies: Object,
  officeList: Object
})

const transactionItems = ref([]);

const emit = defineEmits(['update:modelValue', 'confirmDelete'])

const modalContainer = ref(null)

const closeModal = () => {
  emit('update:modelValue', false)
}

const confirmUpdate = async () => {
  console.log("confirm Update")
}

const handleClickOutside = (event) => {
  if (modalContainer.value && !modalContainer.value.contains(event.target)) {
    closeModal()
  }
}

onMounted(() => {
  // console.log('transaction', props.transaction)
  if (props.transaction?.borrow_transaction_items) {
    transactionItems.value = props.transaction.borrow_transaction_items.map(item => ({
      ...item,
      isChecked: item.returned_date ? true : false
    }));

    console.log("Updated Transaction Items:", transactionItems.value);
  }

  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleCheckboxChange = (item) => {
  item.isChecked = !item.isChecked;
  console.log("Updated Item:", item);
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A"; // Handle null values
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

</script>

<template>
  <div v-if="modelValue" class="fixed left-0 top-0 flex h-full w-full items-center justify-center px-4 py-5">
    <div ref="modalContainer"
      class="w-full max-w-[900px] rounded-[20px] bg-white px-8 py-8 text-center border dark:bg-black">
      <h3 class="text-3xl mb-5 mt-1 font-semibold text-dark dark:text-white">
        Update Transaction
      </h3>
      <div class="dark:text-gray-200">
        <!-- FIRST ROW -->
        <div class="text-start rounded-2xl py-4 px-8 mb-4 dark:bg-gray-800">
          <p class="text-xl mb-1 font-semibold text-white">Transaction #{{ transaction.id }}</p>
          <p class="text-gray-300 mb-3">{{ formatDate(transaction.borrow_date) }}</p>
          <div class="flex flex-row text-center items-center">
            <p class="mr-2 text-lg">Status:</p>
            <p v-if="transaction.return_date"
              class="text-sm mb-1 flex flex-row bg-green-200 text-green-800 font-bold py-1 px-2 rounded-xl">
              <AkCheck class="text-lg mr-1 font-bold" />Returned
            </p>
            <p v-else class="text-sm mb-1 flex flex-row bg-red-200 text-red-800 font-bold py-1 px-2 rounded-xl">
              <RaCross2 class="text-xl mr-1 font-bold" />Items Not Returned
            </p>
          </div>
          <p v-if="transaction.return_date" class="text-gray-300 mb-3 h-full">Return Date: {{
            formatDate(transaction.return_date) }}</p>

          <div v-if="transaction.remarks" class="flex flex-row text-center items-center">
            <p class="mr-2 text-lg">Remarks:</p>
            <p class="">{{ transaction.remarks }}</p>
          </div>
        </div>
        <!-- SECOND ROW -->
        <div class="text-start mb-5 rounded-2xl py-4 px-8 dark:bg-gray-800 grid grid-cols-2 dark:text-gray-300">
          <div class="">
            <p class="text-lg font-bold mb-1 dark:text-white">Borrower Information:</p>
            <p class="font-bold">{{ transaction.borrowers?.borrowers_name }}</p>
            <p class="">{{ transaction.borrowers?.borrowers_contact }}</p>
            <p class="">{{officeList.find(office => Number(office.id) ===
              Number(transaction.borrowers?.office_id))?.office_name || 'Unknown Office'}}</p>
          </div>
          <div class="">
            <p class="text-lg font-bold mb-1 dark:text-white">Lender Information:</p>
            <p class="font-bold">{{ transaction.user?.firstName }} {{ transaction.user?.lastName }}</p>
            <p class="">{{ transaction.user?.email }}</p>
          </div>
        </div>
        <!-- THIRD ROW -->
        <div class="text-start rounded-2xl py-4 px-8 dark:bg-gray-800 dark:text-gray-300">
          <p class="text-lg font-bold mb-1 dark:text-white">Borrowed Items:</p>
          <!-- OFFICE SUPPLIES -->
          <table class="w-full">
            <tr>
              <th class="w-1/8">
                <label class="flex items-center cursor-pointer select-none text-dark dark:text-white">
                <div class="relative">
                  <input type="checkbox" class="sr-only" />
                  <div class="">
                    <span>
                      <FlCheckboxChecked class="mr-2 h-7 w-7" />
                    </span>
                  </div>
                </div>
              </label>
             </th>
              <th class="w-1/2">Office Supply</th>
              <th>Quantity</th>
            </tr>
            <tr v-for="item in transactionItems" :key="item.id">
              <td></td>
              <td v-if="item.item_type === 'Office Supply'">
                <label class="flex items-center cursor-pointer select-none text-dark dark:text-white">
                <div class="relative">
                  <input type="checkbox" class="sr-only" :checked="item.isChecked"
                    @change="handleCheckboxChange(item)" />
                  <div class="">
                    <span v-if="item.isChecked">
                      <FlCheckboxChecked class="mr-2 h-7 w-7" />
                    </span>
                    <span v-if="!item.isChecked">
                      <FlCheckboxUnchecked class="mr-2 h-7 w-7" />
                    </span>
                  </div>
                </div>
                <span v-if="item.item_type === 'Office Supply'" class="col-span-2">
                  {{officeSupplies.find(supply => Number(supply.id) ===
                    Number(item.item_copy_id))?.supply_name || 'Unknown Supply'}}
                </span>
                <span v-if="item.item_type === 'Equipment Copy'" class="col-span-2">
                  {{officeEquipments.find(equipment => Number(equipment.id) ===
                    Number(equipmentCopies.find(equipment_copy => Number(equipment_copy.id) ===
                      Number(item.item_copy_id))?.item_id))?.equipment_name || 'Unknown Equipment'}}
                  #{{equipmentCopies.find(equipment_copy => Number(equipment_copy.id) ===
                    Number(item.item_copy_id))?.item_id || 'Unknown Equipment'}}
                </span>
              </label>  
              </td>
            </tr>
          </table>
          <!-- OFFICE EQUIPMENTS -->
          <table class="w-full">
            <tr>
              <th class="w-1/2">Office Equipment</th>
              <th>Quantity</th>
            </tr>
            <tr v-for="item in transactionItems" :key="item.id">
              <td v-if="item.item_type === 'Equipment Copy'">
                {{officeEquipments.find(equipment => Number(equipment.id) === Number(item.item_copy_id))?.equipment_name || 'Unknown Equipment'}}
              </td>
            </tr>
          </table>

          <ul class="mt-1">
            <li v-for="item in transactionItems" :key="item.id" class="py-2 border-y">
              <label class="flex items-center cursor-pointer select-none text-dark dark:text-white">
                <div class="relative">
                  <input type="checkbox" class="sr-only" :checked="item.isChecked"
                    @change="handleCheckboxChange(item)" />
                  <div class="">
                    <span v-if="item.isChecked">
                      <FlCheckboxChecked class="mr-2 h-7 w-7" />
                    </span>
                    <span v-if="!item.isChecked">
                      <FlCheckboxUnchecked class="mr-2 h-7 w-7" />
                    </span>
                  </div>
                </div>
                <span v-if="item.item_type === 'Office Supply'" class="col-span-2">
                  {{officeSupplies.find(supply => Number(supply.id) ===
                    Number(item.item_copy_id))?.supply_name || 'Unknown Supply'}}
                </span>
                <span v-if="item.item_type === 'Equipment Copy'" class="col-span-2">
                  {{officeEquipments.find(equipment => Number(equipment.id) ===
                    Number(equipmentCopies.find(equipment_copy => Number(equipment_copy.id) ===
                      Number(item.item_copy_id))?.item_id))?.equipment_name || 'Unknown Equipment'}}
                  #{{equipmentCopies.find(equipment_copy => Number(equipment_copy.id) ===
                    Number(item.item_copy_id))?.item_id || 'Unknown Equipment'}}
                </span>
              </label>
            </li>
          </ul>
        </div>
      </div>
      <div class="-mx-3 flex flex-wrap">
        <div class="w-1/2 px-3">
          <button @click="closeModal"
            class="block w-full rounded-md border border-stroke p-3 text-center text-base font-medium text-dark transition bg-gray-200 hover:border-red-800 hover:bg-red-800 hover:text-white dark:text-black">
            No, Cancel.
          </button>
        </div>
        <div class="w-1/2 px-3">
          <button @click="confirmUpdate"
            class="block w-full rounded-md border bg-primary p-3 text-center text-base font-medium text-white transition bg-green-700 hover:border-green-600 hover:bg-green-600 hover:text-white dark:text-white">
            Yes, Update!
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
