<script setup>
import { ref, onMounted, onUnmounted, defineEmits, defineProps, computed, watch } from 'vue'
import ConfirmationModal from '../../ConfirmationModal.vue';
import Loading from '../../Loading.vue';
import image from '../../../../src/assets/baguio-logo.png'
import { useDatabaseStore } from "../../../stores/databaseStore";
import AddTransactionItemModal from './AddTransactionItemModal.vue';
import { GlCloseXs } from '@kalimahapps/vue-icons';
import { MdRoundDeleteForever } from '@kalimahapps/vue-icons';
import { BxSolidUser } from '@kalimahapps/vue-icons';
import { AkTextAlignLeft } from '@kalimahapps/vue-icons';
import useUserStore from "../../../stores/user.js";

// storing inputs
const borrowerInput = ref("")
const lenderInput = ref("")
const iscInput = ref("")
const remarksInput = ref("")

// User Store to get Lender
const userStore = useUserStore();
const loggedInUser = computed(() => userStore.user);
lenderInput.value = loggedInUser.value.id


// FETCHING DATA
const databaseStore = useDatabaseStore()

let refreshInterval = null;

onMounted(() => {
    databaseStore.fetchData()
    // Optionally, set an interval to auto-refresh:
    refreshInterval = setInterval(() => {
        databaseStore.fetchData()
    }, 30000)
})

onUnmounted(() => {
    clearInterval(refreshInterval)
})

const computedProperties = {
    transactionItems: "transactionItems",
    transactionHistory: "transactionHistory",
    officeEquipments: "officeEquipments",
    officeSupplies: "officeSupplies",
    officeList: "officeList",
    users: "users",
    borrowers: "borrowers",
    equipmentCopies: "equipmentCopies",
    categoryList: "categoryList",
    transactionHistories: "transactionHistories",
};

const {
    transactionItems,
    transactionHistory,
    officeEquipments,
    officeSupplies,
    officeList,
    users,
    borrowers,
    equipmentCopies,
    categoryList,
    transactionHistories
} = Object.fromEntries(
    Object.entries(computedProperties).map(([key, value]) => [key, computed(() => databaseStore[value])])
);

const computedArrays = (source) => computed(() => Object.values(source.value));

const transactionItemsArray = computedArrays(transactionItems);
const transactionHistoryArray = computedArrays(transactionHistory);
const officeEquipmentsArray = computedArrays(officeEquipments);
const officeSuppliesArray = computedArrays(officeSupplies);
const officeListArray = computedArrays(officeList);
const usersArray = computedArrays(users);
const borrowersArray = computedArrays(borrowers);
const equipmentCopiesArray = computedArrays(equipmentCopies);
const categoryListArray = computedArrays(categoryList);
const transactionHistoriesArray = computedArrays(transactionHistories);


// FOR THE TOAST
import emitter from "../../../eventBus";

const isLoading = ref(false)

const props = defineProps({
    modelValue: Boolean,
})

const showConfirmationModal = ref(false)

const modalContainer = ref(null)

const emit = defineEmits(['update:modelValue', 'confirmDelete'])

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

const allInventory = computed(() => {
    return [...officeEquipmentsArray.value, ...officeSuppliesArray.value].map((item, index) => ({
        ...item,
        newId: `INV-${index + 1}`,
    }));
});

// FOR SEARCH
const searchQuery = ref("");

const filteredInventory = computed(() => {
    if (!searchQuery.value) return allInventory.value;

    const searchTerm = searchQuery.value.toLowerCase();
    return allInventory.value.filter((item) => {
        const equipmentName = item.equipment_name?.toLowerCase() || "";
        const equipmentDescription = item.equipment_description?.toLowerCase() || "";
        const serialNumber = item.serial_number?.toString().toLowerCase() || "";
        const supplyName = item.supply_name?.toLowerCase() || "";
        const supplyDescription = item.supply_description?.toLowerCase() || "";
        const id = item.id?.toString().toLowerCase() || "";
        const newId = item.newId?.toLowerCase() || "";

        return (
            equipmentName.includes(searchTerm) ||
            equipmentDescription.includes(searchTerm) ||
            serialNumber.includes(searchTerm) ||
            supplyName.includes(searchTerm) ||
            supplyDescription.includes(searchTerm) ||
            id.includes(searchTerm) ||
            newId.includes(searchTerm)
        );
    });
});


// FOR THE ADD TRANSACTION ITEM MODAL
const isOpenAddTransactionItemModal = ref(false);
const selectedItem = ref(null);

const OpenAddTransactionItemModal = (item) => {
    selectedItem.value = item;
    isOpenAddTransactionItemModal.value = true;
}

const selectedItems = ref([]);

// Add selected item from the modal to the overall list
const handleConfirmAdd = (items) => {
    items.forEach(item => {
        const exists = selectedItems.value.some(selected => selected.item_copy_id === item.item_copy_id);

        if (!exists) {
            selectedItems.value.push(item);
        } else {
            if (item.item_type === 'Office Supply') {
                selectedItems.value = selectedItems.value.filter(selected => selected.item_copy_id !== item.item_copy_id);
                selectedItems.value.push(item);
            }
        }
    });
};

// Remove selected item from the overall list
const handleRemoveItem = (item) => {
    selectedItems.value = selectedItems.value.filter(selected => selected.item_copy_id !== item.item_copy_id)
};

// BORROWER LIST DROPDOWN
const showBorrowerListDropdown = ref(false);

// Filtered List for Searching
const filteredBorrowers = computed(() => {
    if (!borrowerInput.value) return borrowersArray.value;
    return borrowersArray.value.filter((borrower) =>
        borrower.borrowers_name.toLowerCase().includes(borrowerInput.value.toLowerCase())
    );
});

// Select an Existing Borrower or Keep New Input
const selectBorrower = (value) => {
    borrowerInput.value = value;
    showBorrowerListDropdown.value = false;
};

// Delay Hiding Dropdown to Allow Selection
const hideBorrowerDropdownWithDelay = () => {
    setTimeout(() => {
        showBorrowerListDropdown.value = false;
    }, 200);
};

// HANDLE OF CREATE TRANSACTION BUTTON
const handleCreateTransactionButton = () => {
    if (selectedItems.value.length) {
        showConfirmationModal.value = true
    } else{
        // LAGAY ERROR DITO NO ITEMS SELECTED
    }
}

// FOR THE CONFIRMATION MODAL
const formattedMessageData = computed(() => {
  if (!selectedItems.value.length) return "No items selected.";

  return selectedItems.value
    .map(
      (item, index) =>
        `\n${index + 1}. Equipment Name: ${item.item_name || "N/A"}\n   Copy to add: ${item.quantity || item.copy || "N/A"}`
    )
    .join("\n");
});

// IF CONFIRM CREATE TRANSACTION WAS PRESSED:
const createTransactionConfirmed = () => {
    console.log(borrowerInput.value, lenderInput.value, iscInput.value, remarksInput.value, selectedItems.value)
    confirmCreateTransaction()
}

// SAVE DATA IN BACKEND
const confirmCreateTransaction = async () => {
    try {
        emitter.emit("show-toast", { message: "Copy/Copies added successfully!", type: "success" });
        // closeModal()
    } catch (error) {
        emitter.emit("show-toast", { message: "Error adding copies. Please try again.", type: "error" });
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
    <div v-if="modelValue"
        class="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black/55 px-4 py-5 z-50 ">
        <!-- Loading State -->
        <Loading v-if="isLoading" />

        <div v-else ref="modalContainer"
            class="w-full w-[90vw] h-[95vh] rounded-[20px] bg-white px-8 py-8 text-center border border-4 dark:bg-gray-950 dark:border-gray-100">
            <div class="grid grid-cols-3 gap-4 h-[87vh]">
                <!-- CLOSE BUTTON -->
                <button @click="closeModal()"
                    class="absolute top-10 right-8 justify-end bg-gray-200 ml-4 text-gray-700 px-1 py-1 rounded-full hover:bg-gray-300 transition dark:bg-gray-300">
                    <GlCloseXs class="w-10 h-10" />
                </button>

                <!-- CHOOSE ITEM -->
                <div class="col-span-2 rounded-2xl border-2 p-4 text-start dark:bg-black dark:border-gray-600">
                    <p class="text-2xl font-bold pl-2 mb-2">Choose Item/s:</p>
                    <!-- SEARCH BAR -->
                    <div class="w-full">
                        <form class="flex items-center" @submit.prevent>
                            <label for="simple-search" class="sr-only">Search</label>
                            <div class="relative w-full">
                                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <svg aria-hidden="true" class="w-5 h-5 text-gray-500 dark:text-gray-400"
                                        fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd"
                                            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                            clip-rule="evenodd" />
                                    </svg>
                                </div>
                                <input type="text" v-model="searchQuery" id="simple-search"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="Search items..." />
                            </div>
                        </form>
                    </div>

                    <!-- LIST OF ITEMS -->
                    <div
                        class="w-full rounded-xl px-4 py-2 mt-4 grid grid-cols-5 gap-4 items-center justify-center max-h-[71vh] overflow-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        <div v-for="item in filteredInventory" :key="item.newId" class="w-full h-full">
                            <button @click.stop="OpenAddTransactionItemModal(item)"
                                class="w-full h-full cursor-pointer p-2 border rounded-lg hover:shadow-lg transition duration-300 ease-in-out dark:font-bold "
                                :class="{
                                    'bg-gradient-to-b bg-green-500 dark:from-green-600 dark:via-green-950 dark:to-black dark:border-green-800 text-white dark:hover:from-emerald-400 dark:hover:via-emerald-900 dark:hover:to-black ': selectedItems.some(selected => selected.basis_id === item.id && selected.basis_type === item.type),
                                    'bg-gray-300 dark:bg-gray-950 dark:border-gray-600 dark:hover:bg-green-800 dark:hover:text-white dark:hover:border-green-800': !selectedItems.some(selected => selected.basis_id === item.id && selected.basis_type === item.type)
                                }">
                                <img :src="item.image_path ? `${VITE_API_BASE_URL}/storage/${item.image_path}` : image"
                                    class="w-full h-28 object-cover rounded-lg" />
                                <p class="text-center mt-2 font-medium">
                                    {{ item.equipment_name || item.supply_name }}
                                </p>
                            </button>
                        </div>
                        <AddTransactionItemModal v-if="isOpenAddTransactionItemModal"
                            v-model="isOpenAddTransactionItemModal" :selectedItem="selectedItem"
                            :equipmentCopies="equipmentCopiesArray" :currentlySelectedItems="selectedItems"
                            @confirmAdd="handleConfirmAdd" @click.stop />
                    </div>
                </div>

                <!-- SELECTED ITEMS -->
                <div class="rounded-2xl border-2 p-4 text-start dark:bg-black dark:border-gray-600">
                    <p class="text-2xl font-bold pl-2 mb-2">Selected Item/s:</p>
                    <div
                        class="border-2 h-[35vh] rounded-xl overflow-y-auto bg-gray-100 dark:bg-gray-950 dark:border-gray-600">
                        <table class="w-full text-center ">
                            <thead class="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th class="py-2">Item</th>
                                    <th>Quantity</th>
                                    <th>Remove</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="item in selectedItems" :key="item.id"
                                    class="items-center border-b dark:border-gray-600">
                                    <td class="py-2 ">{{ item.item_name }}</td>
                                    <td>{{ item.quantity || item.copy }}</td>
                                    <td class="flex py-2 justify-center items-center ">
                                        <button>
                                            <MdRoundDeleteForever class="w-7 h-7 text-red-500 hover:text-red-400" @click="handleRemoveItem(item)" />
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- BORROWER -->
                    <label class="block mt-4 mb-2 text font-medium text-gray-900 dark:text-gray-200">
                        Type Borrower:
                    </label>
                    <div class="relative ml-2">
                        <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                            <BxSolidUser />
                        </div>

                        <!-- Input Field -->
                        <input type="text" v-model="borrowerInput" @focus="showBorrowerListDropdown = true"
                            @blur="hideBorrowerDropdownWithDelay" @keydown.enter.prevent="selectBorrower(borrowerInput)"
                            placeholder="Search or enter new borrower..."
                            class="bg-gray-50 mb-2 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />

                        <!-- Dropdown List -->
                        <ul v-if="showBorrowerListDropdown && filteredBorrowers.length"
                            class="absolute ml-5 w-[95%] border rounded-lg shadow-lg mt-1 z-10 max-h-40 overflow-y-auto bg-white border-gray-300 dark:bg-gray-800">
                            <li v-for="borrower in filteredBorrowers" :key="borrower.id"
                                @mousedown="selectBorrower(borrower.borrowers_name)"
                                class="p-2 hover:bg-blue-100 cursor-pointer">
                                {{ borrower.borrowers_name }}
                            </li>
                        </ul>
                    </div>

                    <!-- ISC/AREE -->
                    <label class="block mt-4 mb-2 text font-medium text-gray-900 dark:text-gray-200">Type
                        ISC/AREE:</label>
                    <div class="relative ml-2">
                        <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                            <BxSolidUser />
                        </div>
                        <input type="text" v-model="iscInput"
                            class="bg-gray-50  mb-2 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Search or enter new ICS/AREE...">
                    </div>

                    <!-- REMARKS -->
                    <label class="block mt-4 mb-2 text font-medium text-gray-900 dark:text-gray-200">Type
                        Remarks:</label>
                    <div class="relative ml-2">
                        <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                            <AkTextAlignLeft />
                        </div>
                        <textarea type="text" v-model="remarksInput"
                            class="min-h-20 max-h-30 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Enter Remarks"></textarea>
                    </div>

                    <!-- Action Buttons -->
                    <div class="-mx-3 flex flex-wrap mt-4">
                        <div class="w-1/2 px-3">
                            <button @click="closeModal"
                                class="block w-full rounded-md border border-stroke p-3 text-center text-base font-medium text-dark transition bg-gray-300 hover:border-red-800 hover:bg-red-800 hover:text-white dark:text-black">
                                Cancel
                            </button>
                        </div>
                        <div class="w-1/2 px-3">
                            <button @click="handleCreateTransactionButton"
                                class="block w-full rounded-md border bg-primary p-3 text-center text-base font-medium text-white transition bg-green-700 hover:border-green-600 hover:bg-green-600 hover:text-white dark:text-white dark:border-green-700 dark:hover:border-green-400">
                                Create Transaction
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Confirmation Modal -->
            <ConfirmationModal v-model="showConfirmationModal" title="Confirm Create Transaction" :message="`You are about to make a transaction with this items.`"
                :messageData="formattedMessageData" cancelText="Cancel"
                confirmText="Create Transaction" @confirm="createTransactionConfirmed()" />
        </div>
    </div>
</template>