<script setup>

import GuestLayout from "../../components/GuestLayout.vue";
import { ref, watch, onMounted, computed } from "vue";
import axiosClient from "../../axios.js";
import router from "../../router.js";
import logo from "../../assets/baguio-logo.png";
import emitter from "../../eventBus.js";
import Loading from "../../components/Loading.vue";
import { useDatabaseStore } from "../../stores/databaseStore.js";

const API_KEY = import.meta.env.VITE_API_KEY;

// fetching users
const databaseStore = useDatabaseStore()

let refreshInterval = null;

onMounted(() => {
  databaseStore.fetchData()
  refreshInterval = setInterval(() => {
    databaseStore.fetchData()
  }, 30000)
})

const computedProperties = {
  users: "users",
};

const {
  users,
} = Object.fromEntries(
  Object.entries(computedProperties).map(([key, value]) => [key, computed(() => databaseStore[value])])
);

const data = ref({
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  password: '',
  password_confirmation: '',
  for_911: false,
  for_inventory: false,
  for_traffic: true,
  role: false,
})

const errors = ref({
  firstName: [],
  middleName: [],
  lastName: [],
  email: [],
  password: [],
  password_confirmation: [],
})


// fetching user data if there is a email in the users database and getting it's data
const foundUser = ref(null)

const checkEmailExists = () => {
  const userMatch = users.value.find(user => user.email === data.value.email);
  if (userMatch) {
    foundUser.value = userMatch;
    errors.value.email = ['Email is already registered'];
    return false;
  }
  foundUser.value = null;
  errors.value.email = [];
  return true;
}


// REGEXE s
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{8,}$/;


// Watch effects for real-time validation
watch(() => data.value.email, (newValue) => {
  if (!newValue) {
    errors.value.email = ["Email is required"];
  } else if (!emailRegex.test(newValue)) {
    errors.value.email = ["Please enter a valid email address"];
  } else {
    if (!checkEmailExists()) {
      errors.value.email = ['Email is already registered by another user'];
    }
  }
});

watch(() => data.value.password, (newValue) => {
  errors.value.password = [];
  if (!newValue) {
    errors.value.password = ["Password is required"];
  } else {
    if (!passwordRegex.test(newValue)) {
      errors.value.password = ["Password must contain special characters, letters and numbers"];
    }
    if (newValue.length < 8) {
      errors.value.password = ["Password must be at least 8 characters long"];
    }
  }
});

watch(() => data.value.password_confirmation, (newValue) => {
  if (!newValue) {
    errors.value.password_confirmation = ["Password confirmation is required"];
  } else if (newValue !== data.value.password) {
    errors.value.password_confirmation = ["Passwords don't match"];
  } else {
    errors.value.password_confirmation = [];
  }
});

// First name and last name validation
watch(() => data.value.firstName, (newValue) => {
  if (!newValue) {
    errors.value.firstName = ["First name is required"];
  } else {
    errors.value.firstName = [];
  }
});

watch(() => data.value.lastName, (newValue) => {
  if (!newValue) {
    errors.value.lastName = ["Last name is required"];
  } else {
    errors.value.lastName = [];
  }
});


const isLoading = ref(false);

function submit() {

  Object.keys(errors.value).forEach(key => {
    errors.value[key] = [];
  });

  let hasErrors = false;

  if (!data.value.firstName) {
    errors.value.firstName = ["First name is required"];
    hasErrors = true;
  }

  if (!data.value.lastName) {
    errors.value.lastName = ["Last name is required"];
    hasErrors = true;
  }

  if (!data.value.email) {
    errors.value.email = ["Email is required"];
    hasErrors = true;
  } else if (!emailRegex.test(data.value.email)) {
    errors.value.email = ["Please enter a valid email address"];
    hasErrors = true;
  } else if (!checkEmailExists()) { // Add this condition
    hasErrors = true;
  }

  if (!data.value.password) {
    errors.value.password = ["Password is required"];
    hasErrors = true;
  } else {
    if (!passwordRegex.test(data.value.password)) {
      errors.value.password = ["Password must contain special characters, letters and numbers"];
      hasErrors = true;
    }
    if (data.value.password.length < 8) {
      errors.value.password = ["Password must be at least 8 characters long"];
      hasErrors = true;
    }
  }

  // Validate password confirmation
  if (!data.value.password_confirmation) {
    errors.value.password_confirmation = ["Password confirmation is required"];
    hasErrors = true;
  } else if (data.value.password !== data.value.password_confirmation) {
    errors.value.password_confirmation = ["Passwords don't match"];
    hasErrors = true;
  }

  if (hasErrors) {
    return;
  }

  isLoading.value = true

  axiosClient.get('/sanctum/csrf-cookie')
    .then(() => {
      axiosClient.post("/register", data.value)
        .then(async (response) => {
          try {
            // Get the user ID from the response
            const userId = response.data.user.id;
            
            emitter.emit("show-toast", { 
              message: "Signed up successfully! Please check your email for verification.", 
              type: "success" 
            });
            router.push({ name: 'Login' });
          } catch (error) {
            console.error('Registration process error:', error);
            emitter.emit("show-toast", { message: "Error during registration", type: "error" });
          }
        })
        .catch(error => {
          console.error('Registration error:', error);
          if (error.response?.data?.errors) {
            errors.value = error.response.data.errors;
          }
          emitter.emit("show-toast", { message: "Registration failed", type: "error" });
        })
        .finally(() => {
          isLoading.value = false;
        });
    });
}

</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-dark">
    <div v-if="isLoading" class="h-[72vh] flex flex-col items-center justify-center">
      <Loading />
    </div>
    <!-- Main Container -->
    <div v-else class="flex flex-col md:flex-row items-center gap-1 z-10">
      <!-- City Logo and Title -->
      <div class="text-center flex w-md items-center mb-2 md:flex-col">
        <img :src="logo" alt="City of Baguio Logo" class="w-40 mx-auto md:w-65" />
      </div>

      <!-- Login Form -->
      <div class="bg-white p-6 rounded-xl shadow-lg max-w-lg">
        <p class="text-dark text-2xl font-bold">Traffic Management System</p>
        <p class="mb-4 text-gray-600">Create your Account</p>

        <form @submit.prevent="submit" class="flex grid grid-cols-3 gap-4">
          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-800">First Name *</label>
            <input type="text" name="firstName" id="firstName" v-model="data.firstName"
              class="mt-1 w-full px-3 py-2 border text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
            <p class="text-red-700 font-medium text-sm mt-1">{{ errors.firstName ? errors.firstName[0] : '' }}</p>
          </div>
          <div>
            <label for="middleName" class="block text-sm font-medium text-gray-800">Middle Name</label>
            <input type="text" v-model="data.middleName" id="middleName"
              class="mt-1 w-full px-3 py-2 border text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-800">Last Name *</label>
            <input type="text" v-model="data.lastName" id="lastName"
              class="mt-1 w-full px-3 py-2 border text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
            <p class="text-red-700 font-medium text-sm mt-1">{{ errors.lastName ? errors.lastName[0] : '' }}</p>

          </div>
          <div class="col-span-3">
            <div class="flex flex-row">
              <label for="email" class="block text-sm font-medium text-gray-800">Email *</label>
            </div>
            <input type="email" name="email" id="email" autocomplete="email" v-model="data.email"
              class="mt-1 w-full px-3 py-2 border text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
              <p class="text-red-700 font-medium text-sm mt-1">{{ errors.email ? errors.email[0] : '' }}</p>

            </div>

          <div class="col-span-3">
            <div class="flex flex-row">
              <label for="password" class="block text-sm font-medium text-gray-800">Password *</label>
            </div>
            <input type="password" name="password" id="password" v-model="data.password"
              class="mt-1 w-full px-3 py-2 border text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
              <p class="text-red-700 font-medium text-sm mt-1">{{ errors.password ? errors.password[0] : '' }}</p>

          </div>

          <div class="col-span-3">
            <div class="flex flex-row">
              <label for="confirmPassword" class="block text-sm font-medium text-gray-800">Confirm Password *</label>
          
            </div>
            <input type="password" name="password" id="passwordConfirmation" v-model="data.password_confirmation"
              class="mt-1 w-full px-3 py-2 border text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
              <p class="text-red-700 font-medium text-sm mt-1">{{ errors.password_confirmation ?
                errors.password_confirmation[0] : '' }}</p>
          </div>

          <button type="submit"
            class="col-span-3 w-full bg-primary text-white py-2 mt-1 font-semibold rounded-md hover:bg-primary-100 cursor-pointer">Sign
            Up</button>
        </form>

        <div class="text-sm text-center mt-4 text-dark">
          <span class="text-gray-600">Already have an account?</span> 
          <router-link :to="{ name: 'Login' }" class="text-md text-primary hover:underline">
            Sign
            in</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>