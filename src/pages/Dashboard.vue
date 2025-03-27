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
    <div class="">
        <header class="">
            <div class="p-4 md:px-6 md:py-6 sm:px-6 ">
                <h1 class="text-3xl font-bold tracking-tight dark:text-gray-200">
                    Dashboard
                </h1>
            </div>
        </header>

        <div class="grid h-25 md:p-4 grid-cols-3 md:grid-cols-2">
            <!-- Date Range Picker -->
            <DateRangePicker @dateRangeSelected="updateDateRange" class="px-4 col-span-2 md:col-span-1 dark:text-gray-200"/>
            
            <div class="grid grid-cols-2 items-center text-center">
                <div class="border-2 shadow-lg p-2 pb-5 rounded-lg mx-1 md:mx-5 bg-slate-300 border-gray-400 dark:bg-gray-950 dark:border-gray-700">
                    <h5 class="inline-flex items-center text-gray-900 dark:text-gray-400 leading-none font-normal mb-2">
                        Borrowed</h5>
                    <p class="text-gray-900 dark:text-white text-2xl leading-none font-bold">418</p>
                </div>
                <div class="border-2 p-2 pb-5 rounded-lg mx-1 md:mx-5 bg-slate-300 border-gray-400 dark:bg-gray-950 dark:border-gray-700">
                    <h5 class="inline-flex items-center text-gray-900 dark:text-gray-400 leading-none font-normal mb-2">
                        Returned</h5>
                    <p class="text-gray-900 dark:text-white text-2xl leading-none font-bold">399</p>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 p-4 pb-0 h-160 md:h-130 md:grid-cols-2 md:gap-3 dark:text-gray-800 ">
            <!-- BAR GRAPH -->
            <div class="w-full h-80 md:h-125 md:span-cols-1">
                <div class="card w-full h-full bg-white rounded-lg shadow-sm dark:bg-gray-800 flex justify-between">
                    <BarGraph 
                        :dateRange="selectedDateRange"
                        class="w-full"
                    />
                </div>
            </div>

            <!-- LINE GRAPH -->
            <div class="w-full h-70 md:h-125 md:span-cols-1">
                <div class="card w-full h-full bg-white rounded-lg shadow-sm dark:bg-gray-800 flex justify-between ">
                    <LineGraph 
                        :dateRange="selectedDateRange"
                        class="w-full "
                    />
                </div>
            </div>
        </div>

        <!-- HISTORY TABLE -->
        <div class="mb-6 md:mb-10 md:mt-2">
            <TransactionHistoryTable />
        </div>
    </div>
</template>

<style scoped>
/* Optional: Add any additional dark mode specific styles if needed */
</style>