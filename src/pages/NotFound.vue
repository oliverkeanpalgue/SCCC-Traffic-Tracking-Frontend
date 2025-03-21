<script setup>
import { ref } from "vue";
import Loading from "../components/Loading.vue";
import UsersTable from "../components/Users/UsersTable.vue";

const isLoading = ref(false);

const API_KEY = import.meta.env.VITE_API_KEY;
</script>

<template>
    <div class="dark:bg-gray-950">
        
    </div>
</template>

<style scoped>
/* Additional styling if needed */
</style>
