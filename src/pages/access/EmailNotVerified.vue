<script setup>
import { useRouter } from 'vue-router';
import errorBg from '../../assets/errorBg.jpg';
import { GlGoBack } from '@kalimahapps/vue-icons';
import { FlFilledCalendarQuestionMark } from '@kalimahapps/vue-icons';
import axiosClient from '../../axios.js';
import useUserStore from '../../stores/user.js';
import emitter from '../../eventBus.js';

const userStore = useUserStore();

const router = useRouter();

function goLogout() {
    console.log('Logout clicked');
    if (userStore.user) {
        axiosClient.post('/logout').then(() => {
            router.push('/login');
        });
    } else {
        router.push('/login');
    }
}

const resendEmail = () => {
    axiosClient.post('/email/verification-notification')
        .then(response => {
            // Handle success
            console.log('Verification email sent:', response.data);
            // alert('Verification email has been sent! Please check your inbox.');
            emitter.emit("show-toast", { message: "Verification email has been sent! Please check your inbox.", type: "success" });
        })
        .catch(error => {
            // Handle error
            console.error('Error sending verification email:', error);
            // alert('Failed to send verification email. Please try again later.');
            emitter.emit("show-toast", { message: "Failed to send verification email. Please try again later.", type: "error" });
        });
};

</script>

<template>
    <div class="flex flex-col items-center justify-center min-h-screen w-full bg-dark">
        <div class="absolute inset-0 bg-dark/50 z-0"></div>

        <div class="animate-rotate-border rounded-3xl p-1.5 transition-all duration-500 ease-out bg-conic/[from_var(--border-angle)] from-dark/30 via-dark/50 to-dark/30">
            <div
                class="bg-dark/80 backdrop-blur-lg rounded-3xl p-12 flex flex-col items-center justify-center text-white">
                <img src="/img/Logo.png" alt="City of Baguio Logo" class="w-40 mb-6" />
                <h1 class="text-3xl font-bold mb-4">EMAIL NOT VERIFIED</h1>
                <p class="text-md">
                    Please verify your email address before accessing this page.
                </p>
                <div class="flex flex-row w-full items-center justify-center gap-2 mt-8">
                    <button @click="goLogout"
                        class="h-10 py-2 px-4 text-center cursor-pointer underline text-white hover:text-gray-300 font-medium transition-all duration-300">
                        Back to Login
                    </button>
                    <button @click="resendEmail"
                        class="h-10 py-2 px-4 text-center cursor-pointer rounded-lg bg-primary text-white hover:bg-primary-100 font-medium shadow-md transition-all duration-300 ml-2">
                        Send Verification Email
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
