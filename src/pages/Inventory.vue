<script setup>
import { ref, onMounted } from "vue";
import 'flowbite';
import { Datepicker } from 'flowbite-datepicker';

const startDate = ref("");
const endDate = ref("");

onMounted(() => {
  const startDatePicker = new Datepicker(document.getElementById('datepicker-range-start'), {
    format: 'yyyy-mm-dd',
    autohide: true,
    maxDate: new Date(),
    todayHighlight: true,
    orientation: 'bottom',
    updateCells: true  // Enable custom cell updates
  });

  const endDatePicker = new Datepicker(document.getElementById('datepicker-range-end'), {
    format: 'yyyy-mm-dd',
    autohide: true,
    maxDate: new Date(),
    todayHighlight: true,
    orientation: 'bottom',
    updateCells: true  // Enable custom cell updates
  });

  startDatePicker.setDate(new Date());
  endDatePicker.setDate(new Date());

  function updateRangeHighlight(startDate, endDate) {
    const cells = document.querySelectorAll('.datepicker-cell');
    cells.forEach(cell => {
      cell.classList.remove('range', 'range-start', 'range-end');
    });

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      cells.forEach(cell => {
        const cellDate = new Date(cell.dataset.date);
        
        if (cellDate >= start && cellDate <= end) {
          cell.classList.add('range');
        }
        
        if (cellDate.toDateString() === start.toDateString()) {
          cell.classList.add('range-start');
        }
        
        if (cellDate.toDateString() === end.toDateString()) {
          cell.classList.add('range-end');
        }
      });
    }
  }

  document.getElementById('datepicker-range-start').addEventListener('changeDate', (event) => {
    startDate.value = event.detail.date;
    console.log(`Start Date: ${startDate.value}`);
    
    if (endDate.value) {
      updateRangeHighlight(startDate.value, endDate.value);
    }
  });

  document.getElementById('datepicker-range-end').addEventListener('changeDate', (event) => {
    endDate.value = event.detail.date;
    console.log(`End Date: ${endDate.value}`);
    
    if (startDate.value) {
      updateRangeHighlight(startDate.value, endDate.value);
    }
  });
});
</script>

<style>
/* Custom CSS for range highlighting */
.datepicker-cell.range {
  background-color: rgba(59, 130, 246, 0.2) !important; /* Light blue background */
  color: #3b82f6 !important; /* Blue text color */
}
.datepicker-cell.range-start {
  background-color: #3b82f6 !important; /* Solid blue for start date */
  color: white !important;
}
.datepicker-cell.range-end {
  background-color: #3b82f6 !important; /* Solid blue for end date */
  color: white !important;
}
</style>

<template>
  <div>
    <header class="shadow">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold tracking-tight dark:text-gray-200">
          Inventory
        </h1>
      </div>
    </header>

    <main class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
      
<div id="date-range-picker" date-rangepicker class="flex items-center">
  <div class="relative">
    <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
         <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
          <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
        </svg>
    </div>
    <input id="datepicker-range-start" name="start" type="text" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Select date start">
  </div>
  <span class="mx-4 text-gray-500">to</span>
  <div class="relative">
    <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
         <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
          <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
        </svg>
    </div>
    <input id="datepicker-range-end" name="end" type="text" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Select date end">
</div>
</div>

    </main>
  </div>
</template>
