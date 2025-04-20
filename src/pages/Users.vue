<script setup>
import { ref } from "vue";
import Loading from "../components/Loading.vue";
import UsersTable from "../components/Users/UsersTable.vue";

const isLoading = ref(false);

const API_KEY = import.meta.env.VITE_API_KEY;
</script>

<template>
    <div class="">
        <div
            class="sticky top-2 z-20 backdrop-blur-sm px-6 py-4 border-2 rounded-2xl bg-gray-200/45 border-blue-500/85 dark:bg-gray-800/45 dark:border-gray-300/85">
            <h1 class="text-3xl font-bold tracking-tight text-gray-950 dark:text-gray-100">
                Users
            </h1>
        </div>

        <!-- MAIN CONTAINER -->
        <div class="border-2 mt-4 px-4 border-gray-300 dark:border-gray-800 dark:bg-black rounded-xl">
            <div v-if="isLoading" class="h-[72vh] flex items-center justify-center">
                <Loading />
            </div>
            <div class="h-[78vh]">
                <UsersTable />
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Additional styling if needed */
</style>
