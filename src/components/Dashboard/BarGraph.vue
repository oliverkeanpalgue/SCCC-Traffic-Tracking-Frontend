<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import ApexCharts from 'apexcharts';

const props = defineProps({
    dateRange: Object // Expecting { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }
});

const emit = defineEmits(['periodChange']);

// Reactive date range
const startDate = ref(null);
const endDate = ref(null);

// Function to generate sample data based on date range
const generateSampleData = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = [];
    const organic = [];
    const social = [];

    while (startDate <= endDate) {
        const currentDate = new Date(startDate);
        const formattedDate = currentDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
        days.push(formattedDate);

        organic.push(Math.floor(Math.random() * 500));
        social.push(Math.floor(Math.random() * 500));

        startDate.setDate(startDate.getDate() + 1);
    }

    return { organic, social, categories: days };
};

// Reactive chart options
const options = ref({
  colors: ["#bf1029", "#3f8f29"],
  series: [
    {
      name: "Organic",
      color: "#bf1029",
      data: [231, 122, 63, 421, 122, 323],
    },
    {
      name: "Social media",
      color: "#3f8f29",
      data: [232, 113, 341, 224, 522, 411],
    },
  ],
  chart: {
    type: "bar",
    height: "100%",
    fontFamily: "Inter, sans-serif",
    toolbar: {
      show: true,
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
    show: true,
  },
  fill: {
    opacity: 1,
  },
});

// Reference for the chart container
const barChart = ref(null);

// Chart instance
let chart = null;

// Update chart based on date range
const updateChart = () => {
    if (props.dateRange?.start && props.dateRange?.end) {
        const chartData = generateSampleData(props.dateRange.start, props.dateRange.end);
        options.value.series[0].data = chartData.organic;
        options.value.series[1].data = chartData.social;
        options.value.xaxis.categories = chartData.categories;

        emit('periodChange', props.dateRange);

        if (chart) {
            chart.updateOptions(options.value);
        }
    }
};

// Watch for date range changes
watch(() => props.dateRange, updateChart, { deep: true });

onMounted(() => {
    if (barChart.value) {
        chart = new ApexCharts(barChart.value, options.value);
        chart.render();
    }
});

onUnmounted(() => {
    if (chart) chart.destroy();
});

</script>

<template>
  <div class="h-full p-4 md:px-6 items-center bg-white rounded-lg bg-white dark:bg-gray-950">    
    <!-- BAR CHART -->
    <div ref="barChart"></div>
  </div>
</template>