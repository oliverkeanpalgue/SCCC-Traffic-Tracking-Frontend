<script setup>
import { ref, onMounted, onUnmounted, defineEmits, defineProps } from 'vue'
import axiosClient from '../../../axios';
import { AnOutlinedNumber } from '@kalimahapps/vue-icons';
import { BsBoxFill } from '@kalimahapps/vue-icons';
import { FlFilledTextDescription } from '@kalimahapps/vue-icons';
import { BxSolidCategoryAlt } from '@kalimahapps/vue-icons';
import ConfirmationModal from '../../ConfirmationModal.vue';
import Loading from '../../Loading.vue';

// FOR THE TOAST
import emitter from "../../../eventBus";

const API_KEY = import.meta.env.VITE_API_KEY;

const isLoading = ref(false)

const props = defineProps({
    modelValue: Boolean,
    officeList: Object,
})

const showConfirmationModal = ref(false)

const confirmAction = (confirmed) => {
    if (confirmed) {
        confirmAddBorrower()
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

const borrowerName = ref('')
const borrowerContact = ref('')
const selectedOffice = ref(null)

const confirmAddBorrower = async () => {
    try {
        isLoading.value = true

        const addBorrower = {
            borrowers_name: borrowerName.value,
            borrowers_contact: borrowerContact.value,
            office_id: selectedOffice.value,
            is_deleted: 0,
            deleted_by: null
        }

        console.log("Add copy data sent: ", addBorrower)

        const response = await axiosClient.post(
            `/api/borrowers/`,
            addBorrower,
            {
                headers: {
                    "x-api-key": API_KEY,
                },
            }
        );
        console.log('Add Borrower API response:', response);
        emitter.emit("show-toast", { message: "Borrower added successfully!", type: "success" });
        closeModal()
    } catch (error) {
        console.error('Error adding borrower:', error);
        console.error('Error details:', error.response?.data);
        emitter.emit("show-toast", { message: "Error adding borrower. Please try again.", type: "error" });
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

        <!-- Main Add Borrower Form -->
        <div v-else ref="modalContainer"
            class="w-full max-w-[650px] max-h-[90vh] rounded-[20px] bg-white px-8 py-8 text-center border border-4 dark:bg-gray-950 dark:border-gray-100">
            <h3 class="text-3xl font-semibold mb-4">
                Add Borrower
            </h3>

            <!-- QUANTITY INPUT -->
            <div class="px-5 text-start max-h-[69vh] overflow-y-auto">
                <!-- BORROWER NAME -->
                <label class="block mb-2 text font-medium text-gray-900 dark:text-gray-200">Borrower Name:</label>
                <div class="relative ml-2 mb-2">
                    <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                        <BsBoxFill />
                    </div>
                    <input type="text" v-model="borrowerName"
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Ex. Juan Dela Cruz">
                </div>
                <!-- BORROWER CONTACT -->
                <label class="block mb-2 text font-medium text-gray-900 dark:text-gray-200">Borrower Contact:</label>
                <div class="relative ml-2">
                    <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                        <BsBoxFill />
                    </div>
                    <input type="text" v-model="borrowerContact"
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Ex. 09123456789">
                </div>
                <!-- BORROWER OFFICE -->
                <label class="block mt-2 mb-2 text font-medium text-gray-900 dark:text-gray-200">Borrower
                    Office:</label>

                <div class="relative mb-2">
                    <div class="absolute inset-y-0 start-2 flex items-center ps-3.5 pointer-events-none">
                        <BxSolidCategoryAlt />
                    </div>
                    <div class="pr-2">
                        <select v-model="selectedOffice"
                            class="border rounded-lg ml-2 w-full text-sm pl-9  dark:text-gray-100 h-10 dark:bg-gray-700 dark:border-gray-600 ">
                            <option v-for="office in props.officeList" :key="office.id" :value="office.id" class="hover:bg-gray-100">
                                {{ office.office_name }}
                            </option>
                        </select>
                    </div>
                </div>
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
                    <button @click="showConfirmationModal = true"
                        class="block w-full rounded-md border bg-primary p-3 text-center text-base font-medium text-white transition bg-green-700 hover:border-green-600 hover:bg-green-600 hover:text-white dark:text-white dark:border-green-700 dark:hover:border-green-400">
                        Add Borrower
                    </button>
                </div>
            </div>

            <!-- Confirmation Modal -->
            <ConfirmationModal v-model="showConfirmationModal" title="Confirm Addition"
                :message="`You are about to add this borrower.`"
                :messageData="`\nBorrower Name: ${borrowerName}\nBorrower Contact: ${borrowerContact}\nBorrower Office: ${officeList.find(office => office.id === selectedOffice)?.office_name || 'Unknown Office'}`"
                cancelText="Cancel" confirmText="Confirm Adding" @confirm="confirmAction" />
        </div>
    </div>
</template>
