<script setup>

import GuestLayout from "../../components/GuestLayout.vue";
import axiosClient from "../../axios.js";
import { ref } from "vue";
import router from "../../router.js";
import logo from '../../assets/baguio-logo.png';

const data = ref({
  email: '',
  password: '',
})
const errorMessage = ref('')

function submit() {
  axiosClient.get('/sanctum/csrf-cookie').then(response => {
    axiosClient.post("/login", data.value)
      .then(response => {
        router.push({ name: 'Dashboard' })
      })
      .catch(error => {
        console.log(error.response)
        errorMessage.value = error.response.data.message;
      })
  });
}

</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-blue-900 relative">

    <!-- Main Container -->
    <div class="flex flex-col md:flex-row items-center gap-2 z-10">
      <!-- City Logo and Title -->
      <div class="text-center flex w-md items-center md:flex-col">
        <img :src="logo" alt="City of Baguio Logo" class="w-40 mx-auto md:w-65" />
        <div class="w-3xs mx-auto md:w-xs">
          <p class="text-white text-2xl font-bold leading-tight md:text-3xl">
            Smart City Command and Control Center Inventory System
          </p>
        </div>
      </div>

      <!-- Login Form -->
      <div class="bg-white p-6 rounded-xl shadow-lg w-md h-94">
        <p class="text-gray-800 text-2xl text-center font-bold mb-4">Sign in to your Account</p>

        <form @submit.prevent="submit" class="flex flex-col gap-4">
          <div v-if="errorMessage" class="mt-4 py-2 px-3 rounded text-white bg-red-400">
            {{ errorMessage }}
          </div>
          <div>
            <label for="email" class="block text-md font-medium text-gray-700">Email</label>
            <input type="email" name="email" id="email" autocomplete="email" required="" v-model="data.email"
              class="mt-1 w-full px-3 py-2 border text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label for="password" class="block text-md font-medium text-gray-700">Password</label>
            <input type="password" name="password" id="password" autocomplete="current-password" required=""
              v-model="data.password"
              class="mt-1 w-full px-3 py-2 border text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <button type="submit" class="w-full bg-blue-600 text-white py-2 mt-1 font-semibold rounded-md hover:bg-blue-700">Sign in</button>
        </form>

        <div class="text-sm text-center mt-4">
          <RouterLink :to="{ name: 'Signup' }" class="text-md text-blue-600 hover:underline">Don't have an account? Sign up
          </RouterLink>
        </div>

        <div class="text-sm text-center mt-2">
          <RouterLink :to="{ name: 'ForgotPassword' }" class="text-md text-blue-600 hover:underline">Forgot Password?
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>