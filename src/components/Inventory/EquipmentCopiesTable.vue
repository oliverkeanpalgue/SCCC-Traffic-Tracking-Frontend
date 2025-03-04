<script setup>
import { ref, onMounted, onUnmounted, defineEmits, defineProps, computed } from 'vue'
import { ClAddPlus } from '@kalimahapps/vue-icons';
import UpdateEquipmentCopy from '../Inventory/Modals/UpdateEquipmentCopy.vue';


const isOpenUpdateEquipmentCopyModal = ref(false);

const OpenUpdateEquipmentCopyModal = () => {
    isOpenUpdateEquipmentCopyModal.value = true;
}

const props = defineProps({
    selectedItem: Object,
    equipmentCopies: Object,
})

const filteredEquipmentCopies = computed(() => {
    return props.equipmentCopies
        .filter(copy =>
            copy.item_id === props.selectedItem.id
        )
});

</script>

<template>
    <div class="bg-black p-4 rounded-xl">
        <div class="grid grid-cols-4 pb-2">
            <p class="ml-2 text-xl font-semibold rounded-lg col-span-3">Copies of {{ selectedItem.equipment_name }}:</p>

            <button @click.stop="OpenUpdateEquipmentCopyModal()"
                class="flex items-center justify-center mx-auto w-fit px-8 py-1 rounded-lg dark:border-gray-600 dark:bg-green-800 dark:hover:bg-green-700">
                <ClAddPlus class="w-8 h-6" />
                <p class="ml-1">Add a Copy</p>
            </button>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full border-collapse text-sm text-gray-300 rounded-lg">
                <thead>
                    <tr class="bg-gray-700 text-gray-200 uppercase text-left text-xs rounded-lg">
                        <th class="px-4 py-2 border-b border-gray-600">Copy ID</th>
                        <th class="px-4 py-2 border-b border-gray-600">Available</th>
                        <th class="px-4 py-2 border-b border-gray-600">Borrow History</th>
                        <th class="px-4 py-2 border-b border-gray-600">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="equipmentCopy in filteredEquipmentCopies" :key="equipmentCopy.id"
                        class="odd:bg-gray-800 even:bg-gray-750 hover:bg-gray-700 transition">
                        <td class="px-4 py-3 border-b border-gray-700">{{ selectedItem.equipment_name ||
                            selectedItem.supply_name }} #{{ equipmentCopy.copy_num }}</td>
                        <td class="px-4 py-3 border-b border-gray-700">
                            {{ equipmentCopy.is_available ? 'Available' : 'Not Available' }}
                        </td>
                        <td class="px-4 py-3 border-b border-gray-700">...</td>
                        <td class="px-4 py-3 border-b border-gray-700">...</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <UpdateEquipmentCopy v-if="isOpenUpdateEquipmentCopyModal" v-model="isOpenUpdateEquipmentCopyModal" @click.stop />
    </div>
</template>