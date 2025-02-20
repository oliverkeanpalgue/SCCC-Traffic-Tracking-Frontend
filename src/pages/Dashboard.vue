<script setup>
import { ref, onMounted } from "vue";
import LineGraph from '../components/Dashboard/LineGraph.vue';
import BarGraph from "../components/Dashboard/BarGraph.vue";
import TransactionHistoryTable from "../components/Dashboard/TransactionHistoryTable.vue";
import DateRangePicker from "../components/Dashboard/DateRangePicker.vue";


const formatDate = (date) => date.toISOString().split('T')[0]; // Format as YYYY-MM-DD

const currentDate = ref(new Date());
const selectedEndDate = ref(formatDate(new Date())); // Current day
const selectedStartDate = ref(formatDate(new Date(new Date().setDate(new Date().getDate() - 6)))); // 6 days ago

const selectedDateRange = ref({ start: selectedStartDate.value, end: selectedEndDate.value });

const updateDateRange = (range) => {
  selectedDateRange.value = range;
};

onMounted(() => {
  updateDateRange({ start: selectedStartDate.value, end: selectedEndDate.value });
});
</script>

<template>
    <div>
        <header class="shadow">
            <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <h1 class="text-3xl font-bold tracking-tight dark:text-gray-200 ">
                    Dashboard
                </h1>
            </div>
        </header>


        <div class="grid p-4 grid-cols-2">
            <!-- Date Range Picker -->
            <DateRangePicker @dateRangeSelected="updateDateRange" class="dark:text-gray-200 px-4"/>
            
            <div class="grid grid-cols-2 items-center text-center">
                <div class="bg-gray-700 p-2 pb-5 rounded mx-5">
                    <h5 class="inline-flex items-center text-gray-500 dark:text-gray-400 leading-none font-normal mb-2">
                        Borrowed</h5>
                    <p class="text-gray-900 dark:text-white text-2xl leading-none font-bold">418</p>
                </div>
                <div class="bg-gray-700 p-2 pb-5 rounded mx-5">
                    <h5 class="inline-flex items-center text-gray-500 dark:text-gray-400 leading-none font-normal mb-2">
                        Returned</h5>
                    <p class="text-gray-900 dark:text-white text-2xl leading-none font-bold">399</p>
                </div>
            </div>
        </div>

        <div class="flex gap-3 p-4 h-120 dark:text-gray-800">
            <!-- BAR GRAPH -->
            <div class=" w-1/2">
                <div class="card w-full h-full bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6 flex justify-between mb-5 ">
                    <BarGraph 
                        :dateRange="selectedDateRange"
                        class="w-full "
                    />
                </div>
            </div>

            <!-- LINE GRAPH -->
            <div class=" w-1/2">
                <div class="card w-full h-full bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6 flex justify-between mb-5 ">
                    <LineGraph 
                        :dateRange="selectedDateRange"
                        class="w-full "
                    />
                </div>
            </div>
        </div>

        <!-- HISTORY TABLE -->
        <div class="mb-10">
            <TransactionHistoryTable />
        </div>
    </div>
</template>

<style scoped>
/* Optional: Add any additional dark mode specific styles if needed */
</style>