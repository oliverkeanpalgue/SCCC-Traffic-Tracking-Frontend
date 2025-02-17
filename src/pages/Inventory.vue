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
    orientation: 'bottom'
  });

  const endDatePicker = new Datepicker(document.getElementById('datepicker-range-end'), {
    format: 'yyyy-mm-dd',
    autohide: true,
    maxDate: new Date(),
    todayHighlight: true,
    orientation: 'bottom'
  });

  startDatePicker.setDate(new Date());
  endDatePicker.setDate(new Date());

  document.getElementById('datepicker-range-start').addEventListener('changeDate', (event) => {
    startDate.value = event.detail.date;
    console.log(`Start Date: ${startDate.value}`);
  });

  document.getElementById('datepicker-range-end').addEventListener('changeDate', (event) => {
    endDate.value = event.detail.date;
    console.log(`End Date: ${endDate.value}`);
  });
});
</script>

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
      <div class="flex items-center space-x-4">
        <div class="relative">
          <label for="datepicker-range-start" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Start Date</label>
          <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none z-10">
            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
            </svg>
          </div>
          <input id="datepicker-range-start" type="text"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Select start date">
        </div>
        <span class="text-gray-500 mt-6">to</span>
        <div class="relative">
          <label for="datepicker-range-end" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">End Date</label>
          <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none z-10">
            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
            </svg>
          </div>
          <input id="datepicker-range-end" type="text"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Select end date">
        </div>
      </div>
    </main>
  </div>
</template>
