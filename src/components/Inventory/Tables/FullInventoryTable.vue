<script setup>
import { defineProps, computed, ref, watch } from 'vue'

const props = defineProps({
    filteredInventory: Array,
    equipmentCopies: Array,
    categoryList: Array,
})

const getEquipmentCopyCount = (itemId) => {
    return props.equipmentCopies.filter(ec => ec.item_id === itemId).length;
};

const categoryLookup = computed(() => {
    const lookup = {};
    props.categoryList.forEach(category => {
        lookup[category.id] = category.category_name;
    });
    return lookup;
});

const sortedItems = computed(() => {
    const items = [...props.filteredInventory];

    return items.sort((a, b) => {
        const getFieldValue = (item, field) => {
            switch (field) {
                case 'itemName':
                    return item.equipment_name || item.supply_name;

                case 'description':
                    return item.equipment_description || item.supply_description;

                case 'category':
                    return categoryLookup.value[item.category_id] || 'Unknown Category';

                case 'quantity':
                    return item.type === 'Office Equipment' 
                        ? getEquipmentCopyCount(item.id) 
                        : item.supply_quantity || 0;
                default:
                    return '';
            }
        };

        const aVal = getFieldValue(a, sortBy.value);
        const bVal = getFieldValue(b, sortBy.value);

        if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1;
        return 0;
    });
});

const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return sortedItems.value.slice(start, end);
});

const currentPage = ref(1);
const itemsPerPage = ref(9);

const totalPages = computed(() => {
    return Math.ceil(sortedItems.value.length / itemsPerPage.value);
});

const sortBy = ref("itemName");
const sortDirection = ref("asc");

const sortByField = (field) => {
    if (sortBy.value === field) {
        sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
    } else {
        sortBy.value = field;
        sortDirection.value = "asc";
    }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

watch(() => props.filteredInventory, () => {
  currentPage.value = 1;
});
</script>

<template>
    <div>
        <div class="rounded-lg min-h-115 dark:bg-gray-900">
            <table class="w-full text-sm text-center text-gray-500 dark:text-gray-400">
              <thead class=" dark:bg-gray-600 dark:text-gray-300">
                    <tr class="">
                        <th class="py-3" @click="sortByField('itemName')">
                            Item Name
                            <span v-if="sortBy === 'itemName'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
                        </th>
                        <th class="py-3" @click="sortByField('description')">
                            Description
                            <span v-if="sortBy === 'description'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
                        </th>
                        <th class="py-3" @click="sortByField('category')">
                            Category
                            <span v-if="sortBy === 'category'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
                        </th>
                        <th class="px-4 py-2 border-b border-gray-600" @click="sortByField('quantity')">
                            Quantity / Copy
                            <span v-if="sortBy === 'quantity'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
                        </th>
                        <th class="px-4 py-2 border-b border-gray-600">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in paginatedItems" :key="index"
                    class="border-b font-medium text-gray-700 dark:border-gray-700 dark:text-gray-300 odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white">
                        <td class="px-4 py-3 border-b border-gray-700">{{ item.equipment_name || item.supply_name }}</td>
                        <td class="px-4 py-3 border-b border-gray-700">{{ item.equipment_description || item.supply_description }}</td>
                        <td class="px-4 py-3 border-b border-gray-700">{{ categoryLookup[item.category_id] || 'Unknown Category' }}</td>
                        <td v-if="item.type === 'Office Equipment'" class="px-4 py-3 border-b border-gray-700">{{ getEquipmentCopyCount(item.id) }}</td>
                        <td v-if="item.type === 'Office Supply'" class="px-4 py-3 border-b border-gray-700">{{ item.supply_quantity || 0 }}</td>
                        <td class="px-4 py-3 border-b border-gray-700">q</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <nav class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4" aria-label="Table navigation">
            <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
                Showing
                <span class="font-semibold text-gray-900 dark:text-white">
                    {{ (currentPage - 1) * itemsPerPage + 1 }} - 
                    {{ Math.min(currentPage * itemsPerPage, props.filteredInventory.length) }}
                </span>
                of
                <span class="font-semibold text-gray-900 dark:text-white">{{ props.filteredInventory.length }}</span>
            </span>

            <ul class="inline-flex items-stretch -space-x-px">
                <li>
                    <button @click="prevPage" :disabled="currentPage === 1" class="flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
                        <span class="sr-only">Previous</span>
                        <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </li>

                <li v-for="page in totalPages" :key="page">
                    <button @click="goToPage(page)"
                        :class="[
                            'flex items-center justify-center text-sm py-2 px-3 leading-tight border',
                            page === currentPage
                                ? 'text-primary-600 bg-primary-50 border-primary-300 hover:bg-primary-100 hover:text-primary-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white'
                                : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                        ]">
                        {{ page }}
                    </button>
                </li>

                <li>
                    <button @click="nextPage" :disabled="currentPage.value === totalPages.value" class="flex items-center justify-center h-full py-1.5 px-3 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
                        <span class="sr-only">Next</span>
                        <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </li>
            </ul>
        </nav>
    </div>
</template>
