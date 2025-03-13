<script setup>
import { PhotoIcon } from '@heroicons/vue/24/solid'
import { ref, computed } from "vue";
import axiosClient from "../axios.js";
import router from "../router.js";

const data = ref({
  image: null,
  label: ''
})

function submit() {
  const formData = new FormData()
  formData.append('image', data.value.image)
  formData.append('label', data.value.label)
  axiosClient.post('/api/image', formData)
    .then(res => {
      router.push({ name: 'MyImages' })
    })
}

import Toast from '../components/Toasts/SuccessToast.vue';
const toastRef = ref(null);

const showSuccessToast = () => {
  toastRef.value?.addToast("Operation successful!", "success");
};

const showErrorToast = () => {
  toastRef.value?.addToast("Something went wrong!", "error");
};

const showWarningToast = () => {
  toastRef.value?.addToast("This is a warning message!", "warning");
};
</script>

<template>
  <div>
    <header class="shadow">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold tracking-tight">
          Reports
        </h1>
      </div>
    </header>
    
    <main class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
      <div class="p-6 rounded-lg shadow border-2 border-gray-500">
        <form @submit.prevent="submit">
          <div class="mb-4">
            <label 
              for="cover-photo" 
              class="block text-sm/6 font-medium"
            >
              Image
            </label>
            <div class="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 dark:border-gray-600/50 px-6 py-10">
              <div class="text-center">
                <PhotoIcon 
                  class="mx-auto size-12"
                  aria-hidden="true" 
                />
                <div class="mt-4 flex text-sm/6">
                  <label 
                    for="file-upload"
                    class="relative cursor-pointer rounded-md font-semibold focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500 text-indigo-600"
                  >
                    <span>Upload a file</span>
                    <input 
                      id="file-upload" 
                      name="file-upload" 
                      type="file" 
                      @change="data.image = $event.target.files[0]"
                      class="sr-only" 
                    />
                  </label>
                  <p class="pl-1">or drag and drop</p>
                </div>
                <p class="text-xs/5 ">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>
          </div>
          
          <div class="mb-4">
            <label 
              for="label" 
              class="block text-sm/6 font-medium"
            >
              Label
            </label>
            <div class="mt-2">
              <input 
                type="text" 
                name="label" 
                id="label" 
                v-model="data.label"
                class="block w-full rounded-md px-3 py-1.5 text-base outline outline-1 -outline-offset-1 outline-gray-300 dark:outline-gray-600 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>
          
          <button 
            type="submit"
            class="rounded-md bg-indigo-600 text-white px-3 py-2 text-sm font-semibold shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Upload
          </button>
        </form>
      </div>
    </main>

    <div class="p-10">
    <button @click="showSuccessToast" class="px-4 py-2 bg-green-500 text-white rounded mr-2">Success</button>
    <button @click="showErrorToast" class="px-4 py-2 bg-red-500 text-white rounded mr-2">Error</button>
    <button @click="showWarningToast" class="px-4 py-2 bg-yellow-500 text-white rounded">Warning</button>

    <Toast ref="toastRef" />
  </div>
  </div>
</template>

<style scoped>
/* Optional: Add any additional dark mode specific styles if needed */
</style>