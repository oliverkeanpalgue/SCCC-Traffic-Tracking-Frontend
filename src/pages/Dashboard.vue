<script setup>
import { PhotoIcon } from '@heroicons/vue/24/solid'
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import axiosClient from "../axios.js";
import router from "../router.js";
import ApexCharts from 'apexcharts';
import { initFlowbite } from 'flowbite'

// Reactive reference for the chart
const lineChart = ref(null);
const selectedPeriod = ref('Last week');

const selectedStartDate = ref('');
const selectedEndDate = ref('');

// Helper function to format date to 'yyyy-MM-dd'
const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // 'yyyy-MM-dd' format
};

// Watch for date changes and update the chart accordingly
watch([selectedStartDate, selectedEndDate], ([start, end]) => {
    if (start && end) {
        console.log("🚀 Fetching chart data for date range:", start, "to", end);
        fetchChartData(start, end);
    }
});

const handleDateChange = (dateRef) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/; // regex for yyyy-MM-dd format
    if (!regex.test(dateRef.value)) {
        alert("Please enter a valid date in the format yyyy-MM-dd");
        dateRef.value = ''; // Optionally clear the field if it's invalid
    }
};

// Apply date range when both dates are selected
const applyDateRange = () => {
    if (selectedStartDate.value && selectedEndDate.value) {
        console.log("🚀 Applying Selected Date Range:");
        console.log("Start Date:", selectedStartDate.value);
        console.log("End Date:", selectedEndDate.value);
        // fetchChartData(selectedStartDate.value, selectedEndDate.value);
    } else {
        console.log("🚨 Please select both start and end dates.");
    }
};

// Function to fetch new data based on selected date range
const fetchChartData = (start, end) => {
    console.log(`Fetching data from ${start} to ${end}`);
    // Here you can call an API or filter your local dataset
    // updateChart("Last week");
};

// Dummy data for different periods
const periodData = {
    'Yesterday': {
        borrowed: [65],
        returned: [60],
        categories: ['Yesterday']
    },
    'Today': {
        borrowed: [72],
        returned: [68],
        categories: ['Today']
    },
    'Last week': {
        borrowed: [65, 72, 58, 80, 74, 69],
        returned: [60, 68, 58, 78, 70, 65],
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    },
    'Last 30 days': {
        borrowed: [65, 72, 58, 80, 74, 69, 62, 75, 68, 82, 76, 71, 64, 73, 67, 81, 77, 70, 63, 76, 69, 83, 78, 72, 65, 74, 68, 82, 76, 71],
        returned: [60, 68, 58, 78, 70, 65, 61, 72, 66, 79, 73, 69, 62, 71, 66, 80, 75, 68, 61, 74, 67, 81, 76, 70, 63, 72, 67, 80, 74, 69],
        categories: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`)
    },
    'Last 90 days': {
        borrowed: Array.from({ length: 90 }, () => Math.floor(Math.random() * 100)),
        returned: Array.from({ length: 90 }, () => Math.floor(Math.random() * 100)),
        categories: Array.from({ length: 90 }, (_, i) => `Day ${i + 1}`)
    }
};

// Reactive chart options
const options = ref({
    chart: {
        height: "65%",
        maxWidth: "100%",
        type: "line",
        fontFamily: "Inter, sans-serif",
        dropShadow: {
            enabled: false,
        },
        toolbar: {
            show: false,
        },
    },
    tooltip: {
        enabled: true,
        x: {
            show: false,
        },
    },
    dataLabels: {
        enabled: false,
    },
    stroke: {
        width: 6,
        curve: 'smooth'
    },
    grid: {
        show: false,
        strokeDashArray: 1,
        padding: {
            left: 2,
            right: 2,
            top: -26
        },
    },
    series: [
        {
            name: "Borrowed",
            data: periodData['Last week'].borrowed,
            color: "#bf1029",
        },
        {
            name: "Returned",
            data: periodData['Last week'].returned,
            color: "#3f8f29",
        },
    ],
    legend: {
        show: false
    },
    xaxis: {
        categories: periodData['Last week'].categories,
        labels: {
            show: true,
            style: {
                fontFamily: "Inter, sans-serif",
                cssClass: 'text-xs font-normal fill-gray-500 dark:fill-gray-400'
            }
        },
        axisBorder: {
            show: false,
        },
        axisTicks: {
            show: false,
        },
    },
    yaxis: {
        show: false,
    },
});

// Chart instance
let chart = null;

// Update chart based on selected period
const updateChart = (period) => {
    selectedPeriod.value = period;

    // Update series and categories
    options.value.series = [
        {
            name: "Borrowed",
            data: periodData[period].borrowed,
            color: "#bf1029",
        },
        {
            name: "Returned",
            data: periodData[period].returned,
            color: "#3f8f29",
        }
    ];
    options.value.xaxis.categories = periodData[period].categories;

    // Re-render chart if it exists
    if (chart) {
        chart.updateOptions(options.value);
    }
};

onMounted(() => {
    initFlowbite();

    if (lineChart.value) {
        chart = new ApexCharts(lineChart.value, options.value);
        chart.render();
    }
});



// Optional: Clean up chart on unmount
onUnmounted(() => {
    if (chart) {
        chart.destroy();
    }
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

        <div class="flex gap-2 p-4">
            <!-- BAR GRAPH -->
            <div class="w-1/2">
                <div class="card border">
                </div>
            </div>

            <!-- LINE GRAPH -->
            <div class=" w-1/2">
                <div class="card border">
                    <div class="max-w-full w-full bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6">
                        <div class="flex justify-between mb-5">
                            <div class="grid gap-4 grid-cols-2">
                                <div>
                                    <h5
                                        class="inline-flex items-center text-gray-500 dark:text-gray-400 leading-none font-normal mb-2">
                                        Borrowed</h5>
                                    <p class="text-gray-900 dark:text-white text-2xl leading-none font-bold">418</p>
                                </div>
                                <div>
                                    <h5
                                        class="inline-flex items-center text-gray-500 dark:text-gray-400 leading-none font-normal mb-2">
                                        Returned</h5>
                                    <p class="text-gray-900 dark:text-white text-2xl leading-none font-bold">399</p>
                                </div>

                                <div v-if="selectedStartDate">
                                    <h5
                                        class="inline-flex items-center text-gray-500 dark:text-gray-400 leading-none font-normal mb-2">
                                        Start Date</h5>
                                    <p class="text-gray-900 dark:text-white text-2xl leading-none font-bold">
                                        {{ formatDisplayDate(selectedStartDate) }}
                                    </p>
                                </div>
                                <div v-if="selectedEndDate">
                                    <h5
                                        class="inline-flex items-center text-gray-500 dark:text-gray-400 leading-none font-normal mb-2">
                                        End Date</h5>
                                    <p class="text-gray-900 dark:text-white text-2xl leading-none font-bold">
                                        {{ formatDisplayDate(selectedEndDate) }}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <button id="linegraphfilter" data-dropdown-toggle="linegraphfilterdropdown"
                                    data-dropdown-placement="bottom" type="button"
                                    class="px-3 py-2 inline-flex items-center text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                                    {{ selectedPeriod }}
                                    <svg class="w-2.5 h-2.5 ms-2.5" aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                            stroke-width="2" d="m1 1 4 4 4-4" />
                                    </svg>
                                </button>
                                <div id="linegraphfilterdropdown"
                                    class="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700">
                                    <ul class="py-2 text-sm text-gray-700 dark:text-gray-200"
                                        aria-labelledby="linegraphfilter">
                                        <li>
                                            <a @click.prevent="updateChart('Yesterday')" href="#"
                                                class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Yesterday</a>
                                        </li>
                                        <li>
                                            <a @click.prevent="updateChart('Today')" href="#"
                                                class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Today</a>
                                        </li>
                                        <li>
                                            <a @click.prevent="updateChart('Last week')" href="#"
                                                class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Last
                                                week</a>
                                        </li>
                                        <li>
                                            <a @click.prevent="updateChart('Last 30 days')" href="#"
                                                class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Last
                                                30 days</a>
                                        </li>
                                        <li>
                                            <a @click.prevent="updateChart('Last 90 days')" href="#"
                                                class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Last
                                                90 days</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div ref="lineChart" id="line-chart" class="h-64"></div>
                        <div
                            class="grid grid-cols-1 items-center border-gray-200 border-t dark:border-gray-700 justify-between mt-2.5">
                            <div class="pt-5">
                                <a href="#"
                                    class="px-5 py-2.5 text-sm font-medium text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                    <svg class="w-3.5 h-3.5 text-white me-2 rtl:rotate-180" aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20">
                                        <path
                                            d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2Zm-3 15H4.828a1 1 0 0 1 0-2h6.238a1 1 0 0 1 0 2Zm0-4H4.828a1 1 0 0 1 0-2h6.238a1 1 0 1 1 0 2Z" />
                                        <path
                                            d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z" />
                                    </svg>
                                    View full report
                                </a>
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <label for="datepicker-range-start"
                                class="text-sm font-medium text-gray-700 dark:text-gray-400">Select Date Range:</label>
                            <div id="date-range-picker" date-rangepicker class="flex items-center">
                                <!-- Date Range Inputs -->
                                <div class="relative">
                                    <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                        <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true"
                                            xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                                        </svg>
                                    </div>
                                    <input type="text" 
    id="datepicker-range-start" 
    v-model="selectedStartDate" 
    @blur="handleDateChange(selectedStartDate)"
    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    placeholder="Start date (yyyy-MM-dd)"
    data-date-format="yyyy-MM-dd" >

                                </div>
                                <span class="mx-4 text-gray-500">to</span>
                                <div class="relative">
                                    <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                        <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true"
                                            xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                                        </svg>
                                    </div>
                                    <input type="text" 
    id="datepicker-range-end" 
    v-model="selectedEndDate" 
    @blur="handleDateChange(selectedEndDate)"
    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    placeholder="End date (yyyy-MM-dd)"
    data-date-format="yyyy-MM-dd" >

                                </div>
                                <div class="flex items-center gap-4 mt-4">
                                    <button @click="applyDateRange"
                                        class="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800">
                                        Apply
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Optional: Add any additional dark mode specific styles if needed */
</style>