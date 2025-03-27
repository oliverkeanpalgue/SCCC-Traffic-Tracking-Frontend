<script setup>
import { ref, computed, onMounted, watch } from "vue";
import axiosClient from "../../axios.js";
import router from "../../router.js";
import logo from "../../assets/baguio-logo.png";
import { useDatabaseStore } from "../../stores/databaseStore.js";
import { MdNavigateNext } from '@kalimahapps/vue-icons';
import emitter from "../../eventBus.js";

const API_KEY = import.meta.env.VITE_API_KEY;

const isLoading = ref(false);

// fetching data
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
  email: '',
  password: '',
  password_confirmation: '',
})

const errors = ref({
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
    console.log("Found user:", foundUser.value);
    return true;
  } else {
    errors.value.email = ['Email not found in our records'];
    return false;
  }
}

const forgotPassword = async () => {
  try {
    isLoading.value = true

    if (data.value.password !== data.value.password_confirmation) {
      errors.value.password_confirmation = ['Passwords do not match'];
      return;
    }

    const updatePassword = {
      firstName: foundUser.value.firstName,
      middleName: foundUser.value.middleName,
      lastName: foundUser.value.lastName,
      email: foundUser.value.email,
      is_deleted: foundUser.value.is_deleted,
      password: data.value.password
    }

    console.log("Forgot password data sent: ", updatePassword)

    const response = await axiosClient.put(
      `/api/users/${foundUser.value.id}`,
      updatePassword,
      {
        headers: {
          "x-api-key": API_KEY,
        },
      }
    );
    console.log('Forgot Password API response:', response);
    emitter.emit("show-toast", { message: "Password updated successfully!", type: "success" });
    router.push('/login')
  } catch (error) {
    console.error('Error updating password:', error);
    console.error('Error details:', error.response?.data);
    emitter.emit("show-toast", { message: "Error updating password. Please try again.", type: "error" });
  } finally {
    isLoading.value = false;
  }
}

const breadcrumbItems = ref([
  { text: 'Input Email' },
  { text: 'Input Password' },
])

const phaseNum = ref(1)

const phaseOne = () => {
  phaseNum.value = 1
}

const phaseTwo = () => {
  if (checkEmailExists()) {
    phaseNum.value = 2;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-blue-900 relative">
    <!-- Main Container -->
    <div class="flex flex-col items-center gap-1 z-10 bg-gray-200 rounded-xl p-8 min-h-[30vh]">

      <!-- TITLE -->
      <h2 class="text-gray-900 text-2xl text-center font-bold mb-2">Forgot Password</h2>

      <!-- BREAD CRUMB -->
      <div class="w-full px-1 mb-4  ">
        <ul class="flex items-center">
          <li class="flex items-center">
            <a class="text-md font-medium" @click="phaseOne"
              :class="{ 'text-blue-600': phaseNum === 1, 'text-gray-800': phaseNum !== 1 }">Enter Email</a>
          </li>
          <li class="flex items-center">
            <span class="text-body-color dark:text-dark-6 px-3">
              <MdNavigateNext class="w-5 h-5" />
            </span>
            <span class="text-md font-medium"
              :class="{ 'text-blue-600': phaseNum === 2, 'text-gray-800': phaseNum !== 2 }">Enter Password</span>
          </li>
        </ul>
      </div>

      <!-- FOR PHASE 1 -->
      <div v-if="phaseNum === 1">
        <div
          class="bg-gray-100 mb-4 px-6 rounded-xl shadow-lg min-w-[900px] min-h-[21vh] flex justify-center items-center w-full">

          <div class="w-full">
            <label for="email" class="block text-md font-medium text-gray-700">Enter Email</label>
            <input type="email" name="email" id="email" autocomplete="email" v-model="data.email"
              class="mt-1 w-full px-3 py-2 border text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p class="text-sm mt-1 text-red-600">
              {{ errors.email ? errors.email[0] : '' }}
            </p>
          </div>

        </div>
        <div class="flex justify-center">
          <button @click="phaseTwo"
            class="w-full items-center bg-blue-600 text-white py-2 mt-1 font-semibold rounded-md hover:bg-blue-700">Next</button>
        </div>
      </div>

      <!-- FOR PHASE 2 -->
      <div v-if="phaseNum === 2">
        <div class="bg-white p-6 rounded-xl shadow-lg min-w-[900px] mb-4 min-h-[21vh]">

          <div class="">
            <label for="password" class="block text-md font-medium text-gray-700">Password</label>
            <input type="password" name="password" id="password" v-model="data.password"
              class="mt-1 w-full px-3 py-2 border text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p class="text-sm mt-1 text-red-600">
              {{ errors.password ? errors.password[0] : '' }}
            </p>
          </div>

          <div class="">
            <label for="confirmPassword" class="block text-md font-medium text-gray-700">Confirm Password</label>
            <input type="password" name="password" id="passwordConfirmation" v-model="data.password_confirmation"
              class="mt-1 w-full px-3 py-2 border text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p class="text-sm mt-1 text-red-600">
              {{ errors.password_confirmation ? errors.password_confirmation[0] : '' }}
            </p>
          </div>
        </div>


        <div class="flex gap-2">
          <button @click="phaseOne"
            class="w-full bg-blue-600 text-white py-2 mt-1 font-semibold rounded-md hover:bg-blue-700">Back</button>
          <button @click="forgotPassword"
            class="w-full bg-blue-600 text-white py-2 mt-1 font-semibold rounded-md hover:bg-blue-700">Change
            Password</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>