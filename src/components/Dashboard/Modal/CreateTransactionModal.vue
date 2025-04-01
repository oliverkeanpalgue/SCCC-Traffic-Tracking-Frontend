<script setup>
import { ref, onMounted, onUnmounted, defineEmits, defineProps, computed, watch } from 'vue'
import ConfirmationModal from '../../ConfirmationModal.vue';
import Loading from '../../Loading.vue';
import image from '../../../../src/assets/baguio-logo.png'
import { useDatabaseStore } from "../../../stores/databaseStore";
import AddTransactionItemModal from './AddTransactionItemModal.vue';
import { GlCloseXs } from '@kalimahapps/vue-icons';

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

const confirmAction = (confirmed) => {
    if (confirmed) {
        confirmCreateTransaction()
    }
}

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
                                <input type="text"
                                v-model="searchQuery" id="simple-search"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="Search items..." />
                            </div>
                        </form>
                    </div>

                    <!-- LIST OF ITEMS -->
                    <div
                        class="w-full rounded-xl px-4 py-2 mt-4 grid grid-cols-5 gap-4 items-center justify-center max-h-[71vh] overflow-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        <div v-for="item in filteredInventory" :key="item.newId" class="w-full">
                            <button @click.stop="OpenAddTransactionItemModal(item)"
                                class="w-full min-h-40 cursor-pointer p-2 border rounded-lg hover:shadow-lg transition duration-300 ease-in-out dark:font-bold dark:border-gray-500 dark:bg-gray-950 dark:hover:bg-gray-800">
                                <img :src="item.image_path ? `${VITE_API_BASE_URL}/storage/${item.image_path}` : image"
                                    class="w-full h-28 object-cover rounded-lg" />
                                <p class="text-center mt-2 font-medium">
                                    {{ item.equipment_name || item.supply_name }} adfadfda
                                </p>
                            </button>
                        </div>
                        <AddTransactionItemModal v-if="isOpenAddTransactionItemModal"
                            v-model="isOpenAddTransactionItemModal" :item="selectedItem"
                            :equipmentCopies="equipmentCopiesArray" @click.stop />
                    </div>
                </div>

                <!-- SELECTED ITEMS -->
                <div class="rounded-2xl border-2 p-4 text-start dark:bg-black dark:border-gray-600">
                    <p class="text-2xl font-bold pl-2 mb-2">Selected Item/s:</p>
                    <div class="border-2">
                        <table class="w-full text-center">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Quantity/Copy</th>
                                    <th>Remove</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Potato</td>
                                    <td>5</td>
                                    <td>Remove</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Confirmation Modal -->
            <ConfirmationModal v-model="showConfirmationModal" title="Confirm Addition" :message="`The Message Here.`"
                :messageData="`\nEquipment Name: hehehehe\nCopy to add: hehehhe`" cancelText="Cancel"
                confirmText="Confirm Adding" @confirm="confirmAction()" />
        </div>
    </div>
</template>