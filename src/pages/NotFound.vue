<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
    router.push('/');
};
</script>

<template>
    <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-200">
        <h1 class="text-6xl font-bold">404</h1>
        <p class="text-xl mt-2">Oops! The page you're looking for doesn't exist.</p>
        <button 
            @click="goHome"
            class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
            Go Home
        </button>
    </div>
</template>
