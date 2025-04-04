<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import ApexCharts from 'apexcharts';
import { useDatabaseStore } from "../../stores/databaseStore";

const props = defineProps({
  dateRange: Object // Expecting { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }
});

const emit = defineEmits(['periodChange']);

// Access database store
const databaseStore = useDatabaseStore();

// Reference for the chart container
const barChart = ref(null);

// Chart instance
let chart = null;

// Compute borrowed and returned items per day
const dailyStats = computed(() => {
  if (!databaseStore.transactionHistory) return { borrowed: [], returned: [], categories: [] };

  const startDate = new Date(props.dateRange.start);

  const endDate = new Date(props.dateRange.end);

  // Adjust the end date to GMT+8
  endDate.setHours(23);
  endDate.setMinutes(59);
  endDate.setSeconds(59);
  endDate.setMilliseconds(999);

  const categoryStartDate = startDate;
  categoryStartDate.setHours(startDate.getHours() + 8);

  const days = [];
  const borrowedCounts = [];
  const returnedCounts = [];

  const transactions = databaseStore.transactionHistory.filter(transaction => {
  const borrowDate = new Date(transaction.borrow_date);
  const hasMatchingItem = databaseStore.transactionItems.some(
    item => item.transaction_id === transaction.id
  );
  return borrowDate >= startDate && borrowDate <= endDate && hasMatchingItem;
});


  const formatDateGMT8 = (dateStr) => {
      const date = new Date(dateStr);
      const gmt8Date = new Date(date.getTime() + 8 * 60 * 60 * 1000);
      return gmt8Date.toISOString().split('T')[0];
    }

  while (categoryStartDate <= endDate) {
    const formattedDate = startDate.toISOString().split('T')[0];
    days.push(formattedDate);

    const borrowedCount = transactions.filter(t =>
      t.borrow_date && formatDateGMT8(t.borrow_date) === formattedDate
    ).length;

    const returnedCount = transactions.filter(t =>
      t.return_date && formatDateGMT8(t.borrow_date) === formattedDate
    ).length;

    borrowedCounts.push(borrowedCount);
    returnedCounts.push(returnedCount);

    startDate.setDate(startDate.getDate() + 1); // Move to the next day
  }

  return { borrowed: borrowedCounts, returned: returnedCounts, categories: days };
});

const options = ref({
  colors: ["#3f8f29", "#bf1029"], // Returned first (bottom), Still Borrowed (top)
  series: [
    { name: "Returned", color: "#3f8f29", data: [] },
    { name: "Still Borrowed", color: "#bf1029", data: [] }
  ],
  chart: {
    type: "bar",
    height: "100%",
    stacked: true, // ✅ Enable stacked bars
    fontFamily: "Inter, sans-serif",
    toolbar: { show: true }
  },
  plotOptions: {
    bar: { horizontal: false, columnWidth: "70%", borderRadius: 8 }
  },
  tooltip: { shared: true, intersect: false },
  stroke: { show: true, width: 0, colors: ["transparent"] },
  grid: { show: false, strokeDashArray: 4 },
  dataLabels: { enabled: false },
  legend: { show: true }, // ✅ Show legend now
  xaxis: {
    categories: [],
    labels: {
      show: true,
      style: {
        cssClass: 'text-xs font-normal fill-gray-500 dark:fill-gray-400'
      }
    },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: { show: true },
  fill: { opacity: 1 }
});

// Update chart with real data
const updateChart = () => {
  const stats = dailyStats.value;

  const borrowed = stats.borrowed;
  const returned = stats.returned;

  // Compute "still borrowed"
  const stillBorrowed = borrowed.map((b, i) => Math.max(b - returned[i], 0));
  const adjustedReturned = returned.map((r, i) => Math.min(r, borrowed[i]));

  options.value.series = [
    {
      name: "Returned",
      color: "#3f8f29",
      data: adjustedReturned
    },
    {
      name: "Still Borrowed",
      color: "#bf1029",
      data: stillBorrowed
    }
  ];

  options.value.xaxis.categories = stats.categories;

  emit('periodChange', props.dateRange);

  if (chart) {
    chart.updateOptions(options.value);
  }
};

// Watch for date range changes
watch(() => props.dateRange, updateChart, { deep: true });

// Initialize chart
onMounted(() => {
  if (barChart.value) {
    chart = new ApexCharts(barChart.value, options.value);
    chart.render();
  }
});

// Destroy chart on unmount
onUnmounted(() => {
  if (chart) chart.destroy();
});
</script>

<template>
  <div class="h-full p-4 md:px-6 items-center bg-white rounded-lg dark:bg-gray-950 z-10">
    <!-- BAR CHART -->
     <!-- Borrowed vs Returned - Daily -->
    <div ref="barChart"></div>
  </div>
</template>
