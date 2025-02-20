<script setup>
import { ref } from "vue";
import DateRangePicker from "../components/Dashboard/DateRangePicker.vue";

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
      

      <DateRangePicker />
    </main>
  </div>
</template>


<style scoped>
input[type="date"]::-webkit-calendar-picker-indicator {
  display: none;
  -webkit-appearance: none;
}
</style>