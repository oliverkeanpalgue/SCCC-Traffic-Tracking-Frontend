<!-- ILALAGAY SA MODAL -->
<script setup>
import { ref, onMounted, onUnmounted, defineEmits, defineProps, computed } from 'vue'
import Loading from '../components/Loading.vue';
import { GlCloseXs } from '@kalimahapps/vue-icons';

const isLoading = ref(false)

const props = defineProps({
    modelValue: Boolean,
    selectedUser: Object,
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

</script>

<template>
    <div v-if="modelValue"
        class="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black/55 px-4 py-5 z-50 ">
        <!-- Loading State -->
        <Loading v-if="isLoading" />

        <!-- Main Add Copy Form -->
        <div v-else ref="modalContainer"
            class="min-w-[80vw] max-h-[90vh] rounded-[20px] bg-white px-8 py-8 text-center border border-4 dark:bg-gray-950 dark:border-gray-100">
            <div class="flex justify-between">
                <div class="w-full text-2xl font-semibold mb-4 flex flex-row justify-center items-center">
                    <p class=" text-3xl ">Transaction History</p>
                </div>
                <button @click="closeModal()"
                    class="bg-gray-200 max-h-fit ml-4 text-gray-700 px-1 py-1 rounded-full hover:bg-gray-300 transition">
                    <GlCloseXs class="w-8 h-8" />
                </button>
            </div>
            <div class="rounded-lg max-h-[70vh] overflow-y-auto dark:bg-gray-900 ">
                <table class="w-full text-sm text-center text-gray-500 dark:text-gray-400">
                    <thead class=" dark:bg-gray-600 dark:text-gray-300">
                        <tr class="bg-gray-700 text-gray-200 uppercase text-center text-xs rounded-lg">
                            <th class="py-3">Item Name</th>
                            <th class="py-3">Item Type</th>
                            <th class="py-3 w-100">Quantity/Copy</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            class="border-b font-medium text-gray-700 dark:border-gray-700 dark:text-gray-300 odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white">
                            <td class="px-4 py-3 ">a</td>
                            <td class="px-4 py-3 ">a</td>
                            <td class="px-4 py-3 ">a</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>