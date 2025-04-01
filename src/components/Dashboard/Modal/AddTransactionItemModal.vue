<script setup>
import { ref, onMounted, onUnmounted, defineEmits, defineProps, computed } from 'vue'
import axiosClient from '../../../axios';
import { AnOutlinedNumber } from '@kalimahapps/vue-icons';
import { BsBoxFill } from '@kalimahapps/vue-icons';
import { FlFilledTextDescription } from '@kalimahapps/vue-icons';
import { BxSolidCategoryAlt } from '@kalimahapps/vue-icons';
import ConfirmationModal from '../../ConfirmationModal.vue';
import Loading from '../../Loading.vue';
import { AkBox } from '@kalimahapps/vue-icons';
import { AkCheckBox } from '@kalimahapps/vue-icons';

// FOR THE TOAST
import emitter from "../../../eventBus";

const API_KEY = import.meta.env.VITE_API_KEY;

const isLoading = ref(false)

const emit = defineEmits(['update:modelValue', 'confirmDelete'])

const props = defineProps({
    modelValue: Boolean,
    selectedItem: Object,
    equipmentCopies: Array
})
    console.log("🚀 ~ selectedItem:", props.selectedItem)

const showConfirmationModal = ref(false)

const modalContainer = ref(null)

const closeModal = () => {
    emit('update:modelValue', false)
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

const quantity = ref(null)

const equipmentCopiesArray = ref([]);

onMounted(() => {
    checkedAll.value = true;
    equipmentCopiesArray.value = (props.equipmentCopies || []).map((e_copy) => ({
        ...e_copy,
        is_selected: false, // Ensure all items start unchecked
    }));
});

const handleCheckboxChange = (copyId) => {
    checkedAll.value = true;
    equipmentCopiesArray.value = equipmentCopiesArray.value.map(copy => ({
        ...copy,
        is_selected: copy.id === copyId ? !copy.is_selected : copy.is_selected
    }));
};

const checkedAll = ref(false);

const handleCheckboxChangeAll = () => {
    if (checkedAll.value) {
        checkedAll.value = false;
        equipmentCopiesArray.value = equipmentCopiesArray.value.map(copy => ({
            ...copy,
            is_selected: true
        }));
    } else {
        checkedAll.value = true;
        equipmentCopiesArray.value = equipmentCopiesArray.value.map(copy => ({
            ...copy,
            is_selected: false
        }));
    }
};
</script>

<template>
    <div v-if="modelValue"
        class="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black/55 px-4 py-5 z-50 ">
        <!-- Loading State -->
        <Loading v-if="isLoading" />

        <!-- Main Add Copy Form -->
        <div v-else ref="modalContainer"
            class="w-full max-w-[650px] max-h-[90vh] rounded-[20px] bg-white px-8 py-8 text-center border border-4 dark:bg-gray-950 dark:border-gray-100">
            <h3 class="text-3xl font-semibold mb-4">
                Add {{ props.selectedItem.supply_name || props.selectedItem.equipment_name }}
            </h3>

            <!-- FOR THE OFFICE SUPPLY -->
            <div v-if="props.selectedItem.type === 'Office Supply'" class="px-5 text-start max-h-[69vh] overflow-y-auto">
                <!-- QUANTITY -->
                <label class="block mt-4 mb-2 text font-medium text-gray-900 dark:text-gray-200">Quantity to
                    Borrow:</label>
                <div class="relative ml-2">
                    <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                        <BsBoxFill />
                    </div>
                    <input type="number" v-model="quantity"
                        class="bg-gray-50  mb-2 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Enter quantity">
                </div>
            </div>

            <!-- FOR THE EQUIPMENT -->
            <div v-if="props.selectedItem.type === 'Office Equipment'" class="px-5 text-start max-h-[69vh] overflow-y-auto">
                <!-- SELECTION OF EQUIPMENT COPY -->
                <label class="block mt-4 mb-2 text font-medium text-gray-900 dark:text-gray-200">Select Copy to
                    Add:</label>
                <!-- TABLE FOR CHOOSING MULTIPLE EQUIPMENT COPY -->
                <div class=" mx-10 my-1 pb-1 border-1 rounded-lg dark:border-gray-700 ">
                    <table class="w-full">
                        <thead>
                            <tr class="text-center dark:bg-gray-800">
                                <th class="pl-3 pt-2 py-1">
                                    <label
                                        class="flex items-center cursor-pointer select-none text-dark dark:text-white">
                                        <div class="relative">
                                            <input type="checkbox" class="sr-only" @change="handleCheckboxChangeAll()" />
                                            <AkCheckBox v-if="!checkedAll" class="w-7 h-7" />
                                            <AkBox v-else class="w-7 h-7" />
                                        </div>
                                    </label>
                                </th>
                                <th>Copy Number</th>
                            </tr>
                        </thead>
                        <tbody class="w-full">
                            <template v-for="copy in equipmentCopiesArray">
                                <tr v-if="copy.item_id === props.selectedItem.id" :key="copy.id"
                                    class="w-full text-center items-center justify-center border-t">
                                    <td class="pl-3 pt-1 w-10">
                                        <label
                                            class="flex items-center cursor-pointer select-none text-dark dark:text-white">
                                            <div class="relative">
                                                <input type="checkbox" class="sr-only"
                                                @change="handleCheckboxChange(copy.id)" />
                                                <AkCheckBox v-if="copy.is_selected" class="w-7 h-7" />
                                                <AkBox v-else class="w-7 h-7" />
                                            </div>
                                        </label>
                                    </td>
                                    <td class="text-center">#{{ copy.copy_num }}</td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="-mx-3 flex flex-wrap mt-4">
                <div class="w-1/2 px-3">
                    <button @click="closeModal()"
                        class="block w-full rounded-md border border-stroke p-3 text-center text-base font-medium text-dark transition bg-gray-300 hover:border-red-800 hover:bg-red-800 hover:text-white dark:text-black">
                        Cancel
                    </button>
                </div>
                <div class="w-1/2 px-3">
                    <button v-if="props.selectedItem.type === 'Office Equipment'" @click="showConfirmationModal = true"
                        class="block w-full rounded-md border bg-primary p-3 text-center text-base font-medium text-white transition bg-green-700 hover:border-green-600 hover:bg-green-600 hover:text-white dark:text-white dark:border-green-700 dark:hover:border-green-400">
                        Add Selected Copies
                    </button>
                    <button v-else @click="showConfirmationModal = true"
                        class="block w-full rounded-md border bg-primary p-3 text-center text-base font-medium text-white transition bg-green-700 hover:border-green-600 hover:bg-green-600 hover:text-white dark:text-white dark:border-green-700 dark:hover:border-green-400">
                        Add Selected Supply
                    </button>
                </div>
            </div>

            <!-- Confirmation Modal -->
            <ConfirmationModal v-model="showConfirmationModal" title="Confirm Addition" :message="`The Message Here.`"
                :messageData="`\nEquipment Name: hehehehe\nCopy to add: hehehhe`" cancelText="Cancel"
                confirmText="Confirm Adding" @confirm="confirmAction()" />
        </div>
    </div>
</template>