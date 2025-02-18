<script setup>
import { PhotoIcon } from '@heroicons/vue/24/solid'
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import axiosClient from "../axios.js";
import router from "../router.js";
import ApexCharts from 'apexcharts';
import { initFlowbite } from 'flowbite'
import LineGraph from '../components/Dashboard/LineGraph.vue';

// Reactive reference for the chart
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
        // fetchChartData(start, end);
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

// FOR THE BAR GRAPH

const barChartOptions = {
    colors: ["#1A56DB", "#FDBA8C"],
    series: [
        {
            name: "Organic",
            color: "#1A56DB",
            data: [
                { x: "Mon", y: 231 },
                { x: "Tue", y: 122 },
                { x: "Wed", y: 63 },
                { x: "Thu", y: 421 },
                { x: "Fri", y: 122 },
                { x: "Sat", y: 323 },
                { x: "Sun", y: 111 },
            ],
        },
        {
            name: "Social media",
            color: "#FDBA8C",
            data: [
                { x: "Mon", y: 232 },
                { x: "Tue", y: 113 },
                { x: "Wed", y: 341 },
                { x: "Thu", y: 224 },
                { x: "Fri", y: 522 },
                { x: "Sat", y: 411 },
                { x: "Sun", y: 243 },
            ],
        },
    ],
    chart: {
        type: "bar",
        height: "320px",
        fontFamily: "Inter, sans-serif",
        toolbar: {
            show: false,
        },
    },
    plotOptions: {
        bar: {
            horizontal: false,
            columnWidth: "70%",
            borderRadiusApplication: "end",
            borderRadius: 8,
        },
    },
    tooltip: {
        shared: true,
        intersect: false,
        style: {
            fontFamily: "Inter, sans-serif",
        },
    },
    states: {
        hover: {
            filter: {
                type: "darken",
                value: 1,
            },
        },
    },
    stroke: {
        show: true,
        width: 0,
        colors: ["transparent"],
    },
    grid: {
        show: false,
        strokeDashArray: 4,
        padding: {
            left: 2,
            right: 2,
            top: -14
        },
    },
    dataLabels: {
        enabled: false,
    },
    legend: {
        show: false,
    },
    xaxis: {
        floating: false,
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
    fill: {
        opacity: 1,
    },
}

if (document.getElementById("column-chart") && typeof ApexCharts !== 'undefined') {
    const chart = new ApexCharts(document.getElementById("column-chart"), barChartOptions);
    chart.render();
}

onMounted(() => {
    initFlowbite();
});

// Update chart based on selected period
const updateChart = (period) => {
    // Update the selectedPeriod
    selectedPeriod.value = period;
};
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
            <div class=" w-1/2">
                <div class="card w-full">
                    <div class="w-full bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6">
                        <div class="flex justify-between mb-5 w-full">
                            <div class="w-full">
                                <LineGraph 
                                    :selectedPeriod="selectedPeriod" 
                                    @periodChange="updateChart"
                                    class="w-full "
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- LINE GRAPH -->
            <div class=" w-1/2">
                <div class="card w-full">
                    <div class="w-full bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6">
                        <div class="flex justify-between mb-5 w-full">
                            <div class="w-full">
                                <LineGraph 
                                    :selectedPeriod="selectedPeriod" 
                                    @periodChange="updateChart"
                                    class="w-full "
                                />
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