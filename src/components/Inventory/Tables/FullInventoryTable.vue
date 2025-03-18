<script setup>
import { ref, onMounted, onUnmounted, defineEmits, defineProps, computed, watch } from 'vue'
import IncreaseSupplyQty from '../Modals/IncreaseSupplyQty.vue';
import { ClAddPlus } from '@kalimahapps/vue-icons';
import UpdateSelectedSupply from '../Modals/UpdateSelectedSupply.vue';

const props = defineProps({
    filteredInventory: Object,
    equipmentCopies: Object,
})

const getEquipmentCopyCount = (itemId) => {
    return props.equipmentCopies.filter(ec => ec.item_id === itemId).length;
};
</script>

<template>
    <div class="overflow-x-auto max-h-[70vh] overflow-y-auto rounded-xl">
        <table class="w-full border-collapse text-sm text-gray-300">
            <thead>
                <tr class="bg-gray-700 text-gray-200 uppercase text-left text-xs">
                    <th class="px-4 py-2 border-b border-gray-600">Name</th>
                    <th class="px-4 py-2 border-b border-gray-600">Description</th>
                    <th class="px-4 py-2 border-b border-gray-600">Category</th>
                    <th class="px-4 py-2 border-b border-gray-600">Quantity / Copy</th>
                    <th class="px-4 py-2 border-b border-gray-600">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in filteredInventory" :key="item.id" class="odd:bg-gray-800 even:bg-gray-750 hover:bg-gray-700 transition">
                    <td class="px-4 py-3 border-b border-gray-700">{{ item.equipment_name || item.supply_name }}</td>
                    <td class="px-4 py-3 border-b border-gray-700">{{ item.equipment_description || item.supply_description }}</td>
                    <td class="px-4 py-3 border-b border-gray-700">{{ item.category_id }}</td>
                    <td v-if="item.type === 'Office Equipment'" class="px-4 py-3 border-b border-gray-700">{{ getEquipmentCopyCount(item.id) }}</td>
                    <td v-if="item.type === 'Office Supply'" class="px-4 py-3 border-b border-gray-700">{{ item.supply_quantity || 0 }}</td>
                    <td class="px-4 py-3 border-b border-gray-700">q</td>
                </tr>
            </tbody>
        </table>
    </div>
</template> 