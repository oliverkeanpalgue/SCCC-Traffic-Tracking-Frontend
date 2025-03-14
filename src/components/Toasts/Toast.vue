<script setup>
import { ref } from "vue";
import { JaClose } from '@kalimahapps/vue-icons';
import { AkCircleCheckFill } from '@kalimahapps/vue-icons';
import { BsExclamationTriangleFill } from '@kalimahapps/vue-icons';
import { IoCloseCircle } from '@kalimahapps/vue-icons';

const toasts = ref([]);

const addToast = (message, type = "success") => {
    const id = Date.now(); // Unique ID
    toasts.value.push({ id, message, type });

    // Remove toast after 10 seconds
    setTimeout(() => {
        removeToast(id);
    }, 10000);
};

const removeToast = (id) => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id);
};

// Expose the function so parent components can call it
defineExpose({ addToast });
</script>

<template>
    <div class="fixed top-20 right-5 flex flex-col items-end space-y-4 z-100">
        <div v-for="(toast) in toasts" :key="toast.id"
            class="grid grid-cols-10 items-center rounded-lg px-5 py-2 transition-all duration-500 bg-gradient-to-b border border-2 w-full w-[300px] sm:w-[350px] md:w-[400px]"
            :class="{
                'dark:from-green-950 dark:to-gray-950 dark:border-emerald-900': toast.type === 'success',
                'dark:from-red-950 dark:to-gray-950 dark:border-red-900': toast.type === 'error',
                'dark:from-yellow-950 dark:to-gray-950 dark:border-yellow-900': toast.type === 'warning',
            }">
            <!-- Icon -->
            <span class="col-span-1">
                <AkCircleCheckFill v-if="toast.type === 'success'" class="w-7 h-7 text-green-500 mr-4" />
                <BsExclamationTriangleFill v-else-if="toast.type === 'warning'" class="w-6 h-6 text-yellow-500 mr-2" />
                <IoCloseCircle v-else class="w-7 h-7 text-red-600 mr-4" />
            </span>

            <!-- Title -->
            <p class="col-span-8 font-semibold text-lg" :class="{
                'text-green-600 dark:text-green-500': toast.type === 'success',
                'text-red-600 dark:text-red-500': toast.type === 'error',
                'text-yellow-600 dark:text-yellow-500': toast.type === 'warning',
            }">
                {{ toast.type.charAt(0).toUpperCase() + toast.type.slice(1) }}
            </p>

            <!-- Close Button -->
            <button class="col-span-1 ml-4" @click="removeToast(toast.id)">
                <JaClose class="w-7 h-7" />
            </button>

            <!-- SPACER -->
            <div class="col-span-1"></div>

            <!-- Message -->
            <p class="col-span-9">{{ toast.message }}</p>
            
        </div>
    </div>
</template>