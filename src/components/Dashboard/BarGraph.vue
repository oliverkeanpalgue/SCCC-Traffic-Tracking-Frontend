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
      organic: [231, 122, 63, 421, 122, 323],
      social: [232, 113, 341, 224, 522, 411],
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    };
  }

  // Calculate the number of days between start and end dates
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  // Generate data based on the date range
  const organic = Array.from({ length: diffDays }, () => Math.floor(Math.random() * 500));
  const social = Array.from({ length: diffDays }, () => Math.floor(Math.random() * 500));

  // Generate categories (dates)
  const categories = Array.from({ length: diffDays }, (_, i) => {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);

    // Ensure proper formatting and no extra characters
    return `${currentDate.toLocaleString('en-US', { month: 'short' })} ${currentDate.getDate()}`;
  });

  return {
    organic,
    social,
    categories
  };
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
    height: "320px",
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
    show: false,
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
const updateChart = (start = null, end = null) => {
  let chartData;

  // Prioritize date range if available
  if (start && end) {
    chartData = generateDateRangeData(start, end);
  } else {
    // Fallback to default data
    chartData = {
      organic: [231, 122, 63, 421, 122, 323],
      social: [232, 113, 341, 224, 522, 411],
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    };
  }

  // Update series and categories
  options.value.series = [
    {
      name: "Organic",
      color: "#1A56DB",
      data: chartData.organic,
    },
    {
      name: "Social media",
      color: "#FDBA8C",
      data: chartData.social,
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
  if (barChart.value) {
    chart = new ApexCharts(barChart.value, options.value);
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
  <div class="w-full bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6">
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
    
    <!-- BAR CHART -->
    <div ref="barChart"></div>
  </div>
</template>