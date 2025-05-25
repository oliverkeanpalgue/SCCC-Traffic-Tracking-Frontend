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
    <div class="bg-dark flex flex-col items-center justify-center min-h-screen w-full relative">
        <div class="absolute inset-0 bg-black opacity-60 z-0"></div>

        <div class="relative z-10 rounded-3xl p-10 bg-black/80 backdrop-blur-md shadow-lg max-w-sm flex items-center justify-center flex-col">
            <img src="/img/Logo.png" alt="Logo" class="w-24 h-24 mb-6" />
            <h1 class="text-3xl font-semibold text-white mb-2">Email Not Verified</h1>
            <p class="text-white text-center mb-6">Oops! Your email is not verified yet. Please verify your email to continue.</p>
            <div class="flex flex-col space-y-2">
                <button @click="resendEmail" class="mt-3 cursor-pointer w-full px-6 py-2 bg-primary hover:bg-primary-100 text-white rounded-md shadow transition transform hover:scale-105">

                    Send Verification Email
                </button>
                <button @click="goLogout" class="mt-3 w-full cursor-pointer underline text-white rounded-md shadow transition transform hover:scale-105">
                    Back to Login
                </button>
                
            </div> 
        </div>
    </div>
</template>


