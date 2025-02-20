<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import ApexCharts from 'apexcharts';

const props = defineProps({
    dateRange: Object // Expecting an object like { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }
});

const emit = defineEmits(['periodChange']);

// Function to fetch data based on selected date range
// const fetchData = async (start, end) => {
//     console.log("Fetching data for:", start, end);

//     try {
//         // Example API call - Replace with your actual API
//         const response = await fetch(`/api/data?start=${start}&end=${end}`);
//         const data = await response.json();

//         return {
//             borrowed: data.borrowed || [],
//             returned: data.returned || [],
//             categories: data.categories || []
//         };
//     } catch (error) {
//         console.error("Error fetching data:", error);
//         return {
//             borrowed: [65, 72, 58, 80, 74, 69],
//             returned: [60, 68, 58, 78, 70, 65],
//             categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
//         };
//     }
// };

// Function to generate sample data based on date range
const generateSampleData = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = [];
    const borrowed = [];
    const returned = [];

    // Loop through each day in the range
    while (startDate <= endDate) {
        // Create a new date object to prevent mutation
        const currentDate = new Date(startDate);

        // Format date correctly using local time instead of UTC
        const formattedDate = currentDate.toLocaleDateString('en-CA'); // 'YYYY-MM-DD' format
        days.push(formattedDate);

        // Generate random borrowed/returned values
        borrowed.push(Math.floor(Math.random() * 100) + 50); // Between 50-150
        returned.push(Math.floor(Math.random() * 100) + 40); // Between 40-140

        // Move to the next day
        startDate.setDate(startDate.getDate() + 1);
    }

    return { borrowed, returned, categories: days };
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

// Update chart data
const updateChart = () => {
    let chartData;

    if (props.dateRange?.start && props.dateRange?.end) {
        chartData = generateSampleData(props.dateRange.start, props.dateRange.end);
    } else {
        // Default sample data
        chartData = {
            borrowed: [65, 72, 58, 80, 74, 69],
            returned: [60, 68, 58, 78, 70, 65],
            categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        };
    }

    // Update options with new data
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

    // Emit event with new period
    emit('periodChange', props.dateRange);

    // Re-render the chart if it exists
    if (chart) {
        chart.updateOptions(options.value);
    }
};

// Watch for changes in the date range and update chart
watch(() => props.dateRange, updateChart, { deep: true });

onMounted(() => {
    if (lineChart.value) {
        chart = new ApexCharts(lineChart.value, options.value);
        chart.render();
    }
});

// Optional: Clean up chart and event listeners on unmount
onUnmounted(() => {
    if (chart) {
        chart.destroy();
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
        </div>

        <div class="items-center bg-white rounded-lg shadow-sm dark:bg-gray-800 p-2">
            <div ref="lineChart" id="line-chart" class="h-80 w-full"></div>
        </div>
    </div>
</template>

<style scoped>
/* Optional: Add any additional dark mode specific styles if needed */
</style>
