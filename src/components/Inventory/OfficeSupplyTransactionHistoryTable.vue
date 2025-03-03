<script setup>
import { ref, onMounted, onUnmounted, defineEmits, defineProps, computed } from 'vue'

const props = defineProps({
    selectedItem: Object,
    transactionItems: Object,
    transactionHistory: Object,
    users: Object,
    officeList: Object,
    borrowers: Object,
})

const filteredTransactionItems = computed(() => {
    return props.transactionItems
        .filter(item => 
            item.item_type === "Office Supply" && item.item_copy_id === props.selectedItem.id
        )
        .reverse(); // Reverse to show the latest transaction first
});

const formatDate = (dateString) => {
  if (!dateString) return "N/A"; // Handle null values
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};
</script>

<template>
    <div class="overflow-x-auto">
        <table class="w-full border-collapse text-sm text-gray-300">
            <thead>
                <tr class="bg-gray-700 text-gray-200 uppercase text-left text-xs">
                    <th class="px-4 py-2 border-b border-gray-600">ID</th>
                    <th class="px-4 py-2 border-b border-gray-600">Borrower</th>
                    <th class="px-4 py-2 border-b border-gray-600">Office</th>
                    <th class="px-4 py-2 border-b border-gray-600">Lender</th>
                    <th class="px-4 py-2 border-b border-gray-600">Return Date & Time</th>
                    <th class="px-4 py-2 border-b border-gray-600">Borrow Date & Time</th>
                    <th class="px-4 py-2 border-b border-gray-600">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="transactionItem in filteredTransactionItems" :key="transactionItem.id"
                    class="odd:bg-gray-800 even:bg-gray-750 hover:bg-gray-700 transition">
                    <td class="px-4 py-3 border-b border-gray-700">{{ transactionItem.id }}</td>
                    <td class="px-4 py-3 border-b border-gray-700">
                        {{ borrowers.find(u => u.id === transactionHistory.find(t => t.id === transactionItem.transaction_id)?.borrower_id)?.borrowers_name || 'N/A' }}
                    </td>
                    <td class="px-4 py-3 border-b border-gray-700">
                        {{ officeList.find(o => o.id === borrowers.find(u => u.id === transactionHistory.find(t => t.id === transactionItem.transaction_id).borrower_id).office_id)?.office_name || 'N/A' }}
                    </td>
                    <td class="px-4 py-3 border-b border-gray-700">
                        {{ users.find(u => u.id === transactionHistory.find(t => t.id === transactionItem.transaction_id)?.lender_id)?.firstName || 'N/A' }}
                    </td>   
                    <td class="px-4 py-3 border-b border-gray-700">
                        {{ formatDate(transactionHistory?.returned_date) ?? 'N/A' }}
                    </td>
                    <td class="px-4 py-3 border-b border-gray-700">
                        {{ formatDate(transactionHistory.find(t => t.id === transactionItem.transaction_id)?.borrow_date) || 'N/A'}}
                    </td>
                    <td class="px-4 py-3 border-b border-gray-700">...</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>