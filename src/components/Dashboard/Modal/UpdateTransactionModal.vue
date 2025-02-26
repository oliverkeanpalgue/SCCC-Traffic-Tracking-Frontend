<script setup>
import { ref, onMounted, onUnmounted, defineEmits, defineProps, computed } from "vue";
import { MdDeleteForever } from "@kalimahapps/vue-icons";
import axiosClient from "../../../axios";
import { FlCheckboxChecked } from '@kalimahapps/vue-icons';
import { FlCheckboxUnchecked } from '@kalimahapps/vue-icons';
import { AkCheck } from '@kalimahapps/vue-icons';
import { RaCross2 } from '@kalimahapps/vue-icons';

const API_KEY = import.meta.env.VITE_API_KEY;

const isLoading = ref(false);

const props = defineProps({
  modelValue: Boolean, // v-model binding for modal open state
  transactionName: String, // Pass the transaction name
  transaction: Object,
  officeEquipments: Object,
  officeSupplies: Object,
  equipmentCopies: Object,
  officeList: Object,
  categoryList: Object
})

const transactionItems = ref([]);

const emit = defineEmits(["update:modelValue", "confirmDelete"]);

const modalContainer = ref(null);

const closeModal = () => {
  emit("update:modelValue", false);
};

const confirmUpdate = async () => {
  console.log("confirm Update");
};

const handleClickOutside = (event) => {
  if (modalContainer.value && !modalContainer.value.contains(event.target)) {
    closeModal();
  }
};

onMounted(() => {
  // console.log('transaction', props.transaction)
  if (props.transaction?.borrow_transaction_items) {
    transactionItems.value = props.transaction.borrow_transaction_items.map(item => ({
      ...item,
      isChecked: item.returned_date ? true : false
    }));
  }
  document.addEventListener("click", handleClickOutside);;
});

// **Computed Properties**
const allEquipmentsChecked = computed(() =>
  transactionItems.value
    .filter(item => item.item_type === "Equipment Copy")
    .every(item => item.isChecked)
);

const allSuppliesChecked = computed(() =>
  transactionItems.value
    .filter(item => item.item_type === "Office Supply")
    .every(item => item.isChecked)
);

// **Methods**
const toggleAllEquipments = () => {
  const newCheckedState = !allEquipmentsChecked.value;
  transactionItems.value
    .filter(item => item.item_type === "Equipment Copy")
    .forEach(item => (item.isChecked = newCheckedState));
};

const toggleAllSupplies = () => {
  const newCheckedState = !allSuppliesChecked.value;
  transactionItems.value
    .filter(item => item.item_type === "Office Supply")
    .forEach(item => (item.isChecked = newCheckedState));
};

const handleCheckboxChange = (item) => {
  item.isChecked = !item.isChecked;
};

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

// **Computed properties to automatically calculate counts**
const equipmentCount = computed(() =>
  transactionItems.value.filter(item => item.item_type === 'Equipment Copy').length
);

const supplyCount = computed(() =>
  transactionItems.value.filter(item => item.item_type === 'Office Supply').length
);

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
      class="w-full max-w-[900px] max-h-[85vh] overflow-auto rounded-[20px] bg-white px-8 py-8 text-center border dark:bg-black">
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
        <div class="text-start rounded-2xl mb-5 py-4 px-8 dark:bg-gray-800 dark:text-gray-300">
          <p v-if="supplyCount > 0" class="text-xl font-bold mb-1 dark:text-white">Borrowed Items</p>
          <p v-if="transactionItems.length === 0"
            class="text-sm mb-1 flex flex-row bg-red-200 text-red-800 font-bold py-5 px-5 rounded-xl">
            <RaCross2 class="text-xl mr-1 font-bold" />NO ITEMS FOUND
          </p>
          <!-- OFFICE SUPPLIES -->
          <p v-if="supplyCount > 0" class="text-lg font-semibold mb-1 dark:text-white">Office Supplies:</p>
          <table v-if="supplyCount > 0" class="w-full border-2 rounded-xl border-gray-300">
            <tr class="border bg-gray-900">
              <th class="py-2 px-1">
                <label class="flex items-center cursor-pointer select-none text-dark dark:text-white">
                  <div class="relative">
                    <input type="checkbox" class="sr-only" :checked="allSuppliesChecked" @change="toggleAllSupplies" />
                    <span v-if="allSuppliesChecked">
                      <FlCheckboxChecked class="h-7 w-7" />
                    </span>
                    <span v-else>
                      <FlCheckboxUnchecked class="h-7 w-7" />
                    </span>
                  </div>
                </label>
              </th>
              <th class="text-start">Office Supply</th>
              <th>Quantity</th>
              <th>Serial Number</th>
            </tr>
            <tr v-for="item in transactionItems" :key="item.id">
              <td v-if="item.item_type === 'Office Supply'" colspan="2" class="p-1">
                <label class="items-center cursor-pointer select-none text-dark dark:text-white flex flex-row gap-10">
                  <div class="relative max-w-fit">
                    <input type="checkbox" class="sr-only" :checked="item.isChecked"
                      @change="handleCheckboxChange(item)" />
                    <div class="">
                      <span v-if="item.isChecked">
                        <FlCheckboxChecked class="h-7 w-7" />
                      </span>
                      <span v-if="!item.isChecked">
                        <FlCheckboxUnchecked class="h-7 w-7" />
                      </span>
                    </div>
                  </div>
                  <div class="text-start w-full">
                    {{officeSupplies.find(supply => Number(supply.id) ===
                      Number(item.item_copy_id))?.supply_name || 'Unknown Supply'}}
                  </div>
                </label>
              </td>
              <td v-if="item.item_type === 'Office Supply'" class="text-center">{{ item.quantity }}</td>
              <td v-if="item.item_type === 'Office Supply'" class="text-center">
                {{officeSupplies.find(supply => Number(supply.id) ===
                  Number(item.item_copy_id))?.serial_number || 'Unknown Supply'}}
              </td>
            </tr>
          </table>

          <!-- SPACER -->
          <div v-if="equipmentCount > 0 && supplyCount > 0" class="mt-3"></div>
          
          <!-- OFFICE EQUIPMENTS -->
          <p v-if="equipmentCount > 0" class="text-lg font-semibold mb-1 dark:text-white">Office Equipments:</p>
          <table v-if="equipmentCount > 0" class="w-full border-2 rounded-xl border-gray-300">
            <tr class="border bg-gray-900">
              <th class="py-2 px-1">
                <label class="flex items-center cursor-pointer select-none text-dark dark:text-white">
                  <div class="relative">
                    <input type="checkbox" class="sr-only" :checked="allEquipmentsChecked"
                      @change="toggleAllEquipments" />
                    <span v-if="allEquipmentsChecked">
                      <FlCheckboxChecked class="h-7 w-7" />
                    </span>
                    <span v-else>
                      <FlCheckboxUnchecked class="h-7 w-7" />
                    </span>
                  </div>
                </label>
              </th>
              <th class="text-start">Office Equipments</th>
              <th>Category</th>
            </tr>
            <tr v-for="item in transactionItems" :key="item.id">
              <td v-if="item.item_type === 'Equipment Copy'" colspan="2" class="p-1">
                <label class="items-center cursor-pointer select-none text-dark dark:text-white flex flex-row gap-10">
                  <div class="relative max-w-fit">
                    <input type="checkbox" class="sr-only" :checked="item.isChecked"
                      @change="handleCheckboxChange(item)" />
                    <div class="">
                      <span v-if="item.isChecked">
                        <FlCheckboxChecked class="h-7 w-7" />
                      </span>
                      <span v-if="!item.isChecked">
                        <FlCheckboxUnchecked class="h-7 w-7" />
                      </span>
                    </div>
                  </div>
                  <div class="text-start w-full">
                    {{officeEquipments.find(equipment => Number(equipment.id) ===
                      Number(equipmentCopies.find(equipment_copy => Number(equipment_copy.id) ===
                        Number(item.item_copy_id))?.item_id))?.equipment_name || 'Unknown Equipment'}}
                    #{{equipmentCopies.find(equipment_copy => Number(equipment_copy.id) ===
                      Number(item.item_copy_id))?.copy_num || 'Unknown Equipment'}}
                  </div>
                </label>
              </td>
              <td v-if="item.item_type === 'Equipment Copy'" class="text-center">
                {{categoryList.find(category => Number(category.id) === officeEquipments.find(equipment =>
                  Number(equipment.id) ===
                  Number(equipmentCopies.find(equipment_copy => Number(equipment_copy.id) ===
                    Number(item.item_copy_id))?.item_id))?.category_id)?.category_name || 'Unknown Category'}}
              </td>
            </tr>
          </table>
        </div>
      </div>
      <div class="-mx-3 flex flex-wrap">
        <div class="w-1/2 px-3">
          <button @click="closeModal"
            class="block w-full rounded-md border border-stroke p-3 text-center text-base font-medium text-dark transition bg-gray-200 hover:border-red-800 hover:bg-red-800 hover:text-white dark:text-black">
            Cancel
          </button>
        </div>
        <div class="w-1/2 px-3">
          <button @click="confirmUpdate"
            class="block w-full rounded-md border bg-primary p-3 text-center text-base font-medium text-white transition bg-green-700 hover:border-green-600 hover:bg-green-600 hover:text-white dark:text-white">
            Mark Selected Items as Returned
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
