<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import ApexCharts from 'apexcharts';

// Props to make the component configurable
const emit = defineEmits(['periodChange']);

// Reactive date range
const startDate = ref(null);
const endDate = ref(null);

// Dummy data generation function with date range support
const generateDateRangeData = (start, end) => {
    // If no dates are selected, use default last week data
    if (!start || !end) {
        return {
            borrowed: [65, 72, 58, 80, 74, 69],
            returned: [60, 68, 58, 78, 70, 65],
            categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        };
    }

    // Calculate the number of days between start and end dates
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Generate data based on the date range
    const borrowed = Array.from({ length: diffDays }, () => Math.floor(Math.random() * 50));
    const returned = Array.from({ length: diffDays }, () => Math.floor(Math.random() * 50));

    // Generate categories (dates)
    const categories = Array.from({ length: diffDays }, (_, i) => {
        const currentDate = new Date(start);
        currentDate.setDate(start.getDate() + i);

        // Ensure proper formatting and no extra characters
        return `${currentDate.toLocaleString('en-US', { month: 'short' })} ${currentDate.getDate()}`;
    });



    return {
        borrowed,
        returned,
        categories
    };
};

// Reactive chart options
const options = ref({
    chart: {
        height: "100%",
        maxWidth: "90%",
        type: "area",
        fontFamily: "Inter, sans-serif",
        dropShadow: {
            enabled: false,
        },
        toolbar: {
            show: true,
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
            data: [65, 72, 58, 80, 74, 69],
            color: "#bf1029",
        },
        {
            name: "Returned",
            data: [60, 68, 58, 78, 70, 65],
            color: "#3f8f29",
        },
    ],
    legend: {
        show: false
    },
    xaxis: {
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
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

// Reference for the chart container
const lineChart = ref(null);

// Chart instance
let chart = null;

// Update chart based on date range
const updateChart = (start = null, end = null) => {
    let chartData;

    // Prioritize date range if available
    if (start && end) {
        chartData = generateDateRangeData(start, end);
    } else {
        // Fallback to default data
        chartData = {
            borrowed: [65, 72, 58, 80, 74, 69],
            returned: [60, 68, 58, 78, 70, 65],
            categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        };
    }

    // Update series and categories
    options.value.series = [
        {
            name: "Borrowed",
            data: chartData.borrowed,
            color: "#bf1029",
        },
        {
            name: "Returned",
            data: chartData.returned,
            color: "#3f8f29",
        }
    ];
    options.value.xaxis.categories = chartData.categories;

    // Emit the date range change to parent
    emit('periodChange', { start, end });

    // Re-render chart if it exists
    if (chart) {
        chart.updateOptions(options.value);
    }
};

// Watch for date range changes
const onDateRangeChange = (event) => {
    const inputs = event.target.closest('[date-rangepicker]').querySelectorAll('input');
    const start = new Date(inputs[0].value);
    const end = new Date(inputs[1].value);

    // Ensure date is set correctly without time
    startDate.value = start.toISOString().split("T")[0]; // YYYY-MM-DD format
    endDate.value = end.toISOString().split("T")[0];

    // Update chart with new date range
    updateChart(start, end);
};


onMounted(() => {
    if (lineChart.value) {
        chart = new ApexCharts(lineChart.value, options.value);
        chart.render();
    }

    // Add event listener to date range picker
    const dateRangePicker = document.getElementById('date-range-picker');
    if (dateRangePicker) {
        dateRangePicker.addEventListener('change', onDateRangeChange);
    }
});

// Optional: Clean up chart and event listeners on unmount
onUnmounted(() => {
    if (chart) {
        chart.destroy();
    }

    const dateRangePicker = document.getElementById('date-range-picker');
    if (dateRangePicker) {
        dateRangePicker.removeEventListener('change', onDateRangeChange);
    }
});
</script>

<template>
    <div class="">
        <div class="grid grid-cols-3 ">
            <div class="grid grid-cols-2 items-center text-start">
                <div>
                    <h5 class="inline-flex items-center text-gray-500 dark:text-gray-400 leading-none font-normal mb-2">
                        Borrowed</h5>
                    <p class="text-gray-900 dark:text-white text-2xl leading-none font-bold">418</p>
                </div>
                <div>
                    <h5 class="inline-flex items-center text-gray-500 dark:text-gray-400 leading-none font-normal mb-2">
                        Returned</h5>
                    <p class="text-gray-900 dark:text-white text-2xl leading-none font-bold">399</p>
                </div>
            </div>

            <div class="flex col-span-2 items-center gap-4">
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
                        <input type="text" id="datepicker-range-start" v-model="startDate" @blur="onDateRangeChange"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Start date (yyyy-MM-dd)" data-date-format="yyyy-MM-dd">
                    </div>

                    <div class="relative">
                        <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                            </svg>
                        </div>
                        <input type="text" id="datepicker-range-end" v-model="endDate" @blur="onDateRangeChange"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="End date (yyyy-MM-dd)" data-date-format="yyyy-MM-dd">
                    </div>
                </div>
            </div>
        </div>

        <div class="items-center bg-white rounded-lg shadow-sm dark:bg-gray-800 p-2">
            <div ref="lineChart" id="line-chart" class="h-80 w-full"></div>
        </div>
    </div>
</template>

<style scoped>
/* Optional: Add any additional dark mode specific styles if needed */
</style>
