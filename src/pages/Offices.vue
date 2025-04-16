<script setup>
import { ref } from "vue";
import Loading from "../components/Loading.vue";
import OfficeTable from "../components/Category/CategoryTable.vue";

const isLoading = ref(false);

const API_KEY = import.meta.env.VITE_API_KEY;
</script>

<template>
    <div class="">
        <!-- HEADER -->
        <header class="shadow">
            <div class="p-4 md:px-6 md:py-6 sm:px-6">
                <h1 class="text-3xl font-bold tracking-tight dark:text-gray-200">Offices</h1>
            </div>
        </header>

        <!-- MAIN CONTAINER -->
        <!-- <div class="border-2 px-4 border-gray-300 dark:border-gray-800 dark:bg-black rounded-xl">
            <div class="h-[78vh]">
                <OfficeTable />
            </div>
        </div> -->
    </div>
</template>

<style scoped>
/* Additional styling if needed */
</style>
