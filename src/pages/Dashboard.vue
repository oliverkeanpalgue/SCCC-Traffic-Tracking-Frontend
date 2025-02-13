<script setup>
import { PhotoIcon } from '@heroicons/vue/24/solid'
import { ref, computed, onMounted } from "vue";
import axiosClient from "../axios.js";
import router from "../router.js";
import { useThemeStore } from '../stores/themeStore';

const themeStore = useThemeStore();

</script>

<template>
    <div>
        <header class="shadow">
            <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <h1 class="text-3xl font-bold tracking-tight">
                    Dashboard
                </h1>
            </div>
        </header>

        <div class="flex gap-2 p-4">
            <!-- BAR GRAPH -->
            <div class="w-1/2">
                <div class="card border">
                    <Chart type="bar" :data="barChartData" :options="barChartOptions" class="h-[30rem]" />
                </div>
            </div>

            <!-- LINE GRAPH -->
            <div class="w-1/2">
                <div class="card border">
                    <Chart type="line" :data="lineChartData" :options="lineChartOptions" class="h-[30rem]" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Optional: Add any additional dark mode specific styles if needed */
</style>