<script setup>

import axiosClient from "../../axios.js";
import { ref, onMounted, onUnmounted } from "vue";
import router from "../../router.js";
import logo from '../../assets/baguio-logo.png';
import Loading from "../../components/Loading.vue";
import emitter from "../../eventBus.js";
import { useDatabaseStore } from "../../stores/databaseStore";

const isLoading = ref(false);

const data = ref({
  email: '',
  password: '',
})

const errors = ref({
  email: [],
  password: []
})

// REGEXE s
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{8,}$/;

function submit() {
  Object.keys(errors.value).forEach(key => {
    errors.value[key] = [];
  });

  let hasErrors = false;

  if (!data.value.email) {
    errors.value.email = ["Email is required"];
    hasErrors = true;
  } else if (!emailRegex.test(data.value.email)) {
    errors.value.email = ["Please enter a valid email address"];
    hasErrors = true;
  }

  if (!data.value.password) {
    errors.value.password = ["Password is required"];
    hasErrors = true;
  } 

  if (hasErrors) {
    return;
  }

  isLoading.value = true

  axiosClient.get('/sanctum/csrf-cookie').then(response => {
    axiosClient.post("/login", data.value)
      .then(response => {
        emitter.emit("show-toast", { message: "Login successfully!", type: "success" });
        router.push({ name: 'Admin' })

      })
      .catch(error => {
        console.log(error.response)
        emitter.emit("show-toast", { message: "These credentials do not match our records.", type: "error" });
        isLoading.value = false
      })
  });
}

// fetching data
const databaseStore = useDatabaseStore()

let refreshInterval = null;

onMounted(() => {
  databaseStore.fetchData()
  // Optionally, set an interval to auto-refresh:
  refreshInterval = setInterval(() => {
    databaseStore.fetchData()
  }, 30000)
})

onUnmounted(() => {
  clearInterval(refreshInterval)
})

</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-dark relative">
    <div v-if="isLoading" class="h-[72vh] flex flex-col items-center justify-center">
      <Loading />
    </div>

    <!-- Main Container -->
    <div v-else class="flex flex-col md:flex-row items-center gap-2 z-10">
      <!-- City Logo and Title -->
      <div class="text-center flex w-md items-center md:flex-col">
        <img :src="logo" alt="City of Baguio Logo" class="w-40 mx-auto md:w-65" />
        <!-- <div class="w-3xs mx-auto md:w-xs">
          <p class="text-white font-semibold leading-tight text-xl">
          Traffic Tracking System
          </p>
        </div> -->
      </div>

      <!-- Login Form -->
      <div class="bg-white p-6 rounded-xl shadow-lg w-md h-full">
        <p class="text-dark text-2xl font-bold">Traffic Management System</p>
        <p class="mb-4 text-gray-600">Login to your Account</p>

        <form @submit.prevent="submit" class="flex flex-col gap-4">
          <div>
            <div class="flex flex-row">
              <label for="email" class="block text-sm font-semibold text-dark">Email</label>
            </div>
            <input name="email" id="email" autocomplete="email" v-model="data.email" class="mt-1 w-full px-3 py-2 border text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
              <p class="text-red-700 font-medium text-sm mt-1">
                {{ errors.email ? errors.email[0] : '' }}
              </p>
          </div>
          <div>
            <div class="flex flex-row justify-between align-center">

              <label for="password" class="block text-sm font-semibold text-dark">Password</label>

              <div class="text-sm text-center">
                <RouterLink :to="{ name: 'ForgotPassword' }" class="text-md font-medium text-primary hover:underline">Forgot
                  Password?
                </RouterLink>
              </div>
            </div>

            <input type="password" name="password" id="password" autocomplete="current-password" v-model="data.password"
              class="mt-1 w-full px-3 py-2 border text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
              <p class="text-red-700 font-medium text-sm mt-1">{{ errors.password ? errors.password[0] : '' }}</p>

            </div>

          <button type="submit"
            class="w-full bg-primary text-white py-2 mt-1 font-semibold rounded-md hover:bg-primary-100 cursor-pointer">Sign
            in</button>
        </form>

        <!-- <div class="text-sm text-center mt-4 gap-1 flex justify-center align-center">
          <span class="text-gray-600">Don't have an account?</span> 
          <RouterLink :to="{ name: 'Signup' }" class="text-md text-primary hover:underline">Sign
            up
          </RouterLink>
        </div> -->
      </div>
    </div>
  </div>
</template>

<style scoped></style>