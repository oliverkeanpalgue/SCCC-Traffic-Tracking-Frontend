<script setup>
import { ref, onMounted } from "vue";
import LineGraph from '../components/Dashboard/LineGraph.vue';
import BarGraph from "../components/Dashboard/BarGraph.vue";
import TransactionHistoryTable from "../components/Dashboard/TransactionHistoryTable.vue";
import DateRangePicker from "../components/Dashboard/DateRangePicker.vue";

// Reactive reference for the chart
const selectedPeriod = ref('Last week');

const selectedDateRange = ref({ start: null, end: null })

const updateDateRange = (range) => {
  selectedDateRange.value = range
}

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

        <!-- Date Range Picker -->
        <DateRangePicker @dateRangeSelected="updateDateRange" />

        <div class="flex gap-3 p-4 h-120">
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