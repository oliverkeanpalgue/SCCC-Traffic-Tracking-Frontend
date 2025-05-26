<script setup>
import { useRouter } from 'vue-router';
import { IoOutlineArrowForward } from '@kalimahapps/vue-icons';

const router = useRouter();

const goHome = () => {
    router.push('/admin');
};
</script>

<template>
    <div class="bg-dark flex flex-col items-center justify-center min-h-screen w-full relative">
        <div class="absolute inset-0 bg-black opacity-60 z-0"></div>

        <div class="relative z-10 rounded-3xl p-10 bg-black/80 backdrop-blur-md shadow-lg max-w-sm flex items-center justify-center flex-col">
            <img src="/img/Logo.png" alt="Logo" class="w-24 h-24 mb-6" />
            <h1 class="text-3xl font-semibold text-green-500 mb-2">Email Verified</h1>
            <p class="text-white text-center mb-6">Your email has been successfully verified! You can now access the website.</p>
            <div class="flex flex-col space-y-2">
                <button @click="goHome"
                    class="mt-3 cursor-pointer w-full px-6 py-2 bg-primary hover:bg-primary-100 text-white rounded-md shadow transition transform hover:scale-105 flex items-center justify-center gap-2">
                    Go to Dashboard
                    <IoOutlineArrowForward class="w-5 h-5" />
                </button>
            </div>
        </div>
    </div>
</template>
