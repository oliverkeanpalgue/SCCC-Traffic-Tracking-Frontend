<script setup>
import { ref } from "vue";

// Create reactive references for start and end dates
const startDate = ref("");
const endDate = ref("");

// Method to log the date range when they are selected
const logDateRange = () => {
  console.log(`Start Date: ${startDate.value}, End Date: ${endDate.value}`);
};

// Trigger the calendar to open on focus
const showCalendar = (picker) => {
  const input = document.querySelector(`#datepicker-range-${picker}`);
  if (input) {
    input.showPicker(); // This forces the date picker to appear
  }
};
</script>


<template>
  <div>
    <header class="shadow">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold tracking-tight dark:text-gray-200">
          Borrowed
        </h1>
      </div>
    </header>

    <main class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
      <!-- Date range picker matching Flowbite design -->
      <div class="flex items-center">
        <!-- Start Date Picker -->
        <div class="relative">
          <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg
              class="w-4 h-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"
              />
            </svg>
          </div>
          <input
            id="datepicker-range-start"
            type="date"
            v-model="startDate"
            @focus="showCalendar('start')"
            @change="logDateRange"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Select date start"
          />
        </div>

        <!-- 'to' separator -->
        <span class="mx-4 text-gray-500">to</span>

        <!-- End Date Picker -->
        <div class="relative">
          <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg
              class="w-4 h-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"
              />
            </svg>
          </div>
          <input
            id="datepicker-range-end"
            type="date"
            v-model="endDate"
            @focus="showCalendar('end')"
            @change="logDateRange"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Select date end"
          />
        </div>
      </div>
    </main>
  </div>
</template>


<style scoped>
input[type="date"]::-webkit-calendar-picker-indicator {
  display: none;
  -webkit-appearance: none;
}
</style>