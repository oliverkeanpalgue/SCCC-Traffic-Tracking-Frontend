<script setup>
import { ref } from "vue";

// Sample images (Replace with actual data)
const images = ref([
   { id: 1, title: "Image 1", src: "https://flowbite.com/docs/images/people/profile-picture-5.jpg", description: "This is the first image." },
   { id: 2, title: "Image 2", src: "https://flowbite.com/docs/images/people/profile-picture-5.jpg", description: "This is the second image." },
   { id: 3, title: "Image 3", src: "https://flowbite.com/docs/images/people/profile-picture-5.jpg", description: "This is the third image." },
   { id: 4, title: "Image 4", src: "https://flowbite.com/docs/images/people/profile-picture-5.jpg", description: "This is the fourth image." },
   { id: 5, title: "Image 5", src: "https://flowbite.com/docs/images/people/profile-picture-5.jpg", description: "This is the first image." },
   { id: 6, title: "Image 6", src: "https://flowbite.com/docs/images/people/profile-picture-5.jpg", description: "This is the second image." },
   { id: 7, title: "Image 7", src: "https://flowbite.com/docs/images/people/profile-picture-5.jpg", description: "This is the third image." },
   { id: 8, title: "Image 8", src: "https://flowbite.com/docs/images/people/profile-picture-5.jpg", description: "This is the fourth image." },
   { id: 9, title: "Image 9", src: "https://flowbite.com/docs/images/people/profile-picture-5.jpg", description: "This is the first image." },
   { id: 10, title: "Image 10", src: "https://flowbite.com/docs/images/people/profile-picture-5.jpg", description: "This is the second image." },
   { id: 11, title: "Image 11", src: "https://flowbite.com/docs/images/people/profile-picture-5.jpg", description: "This is the third image." },
   { id: 12, title: "Image 12", src: "https://flowbite.com/docs/images/people/profile-picture-5.jpg", description: "This is the fourth image." },
   { id: 13, title: "Image 13", src: "https://flowbite.com/docs/images/people/profile-picture-5.jpg", description: "This is the first image." },
   { id: 14, title: "Image 14", src: "https://flowbite.com/docs/images/people/profile-picture-5.jpg", description: "This is the second image." },
   { id: 15, title: "Image 15", src: "https://flowbite.com/docs/images/people/profile-picture-5.jpg", description: "This is the third image." },
   { id: 16, title: "Image 16", src: "https://flowbite.com/docs/images/people/profile-picture-5.jpg", description: "This is the fourth image." },
   { id: 17, title: "Image 17", src: "https://flowbite.com/docs/images/people/profile-picture-5.jpg", description: "This is the first image." },
   { id: 18, title: "Image 18", src: "https://flowbite.com/docs/images/people/profile-picture-5.jpg", description: "This is the second image." },
   { id: 19, title: "Image 19", src: "https://flowbite.com/docs/images/people/profile-picture-5.jpg", description: "This is the third image." },
   { id: 20, title: "Image 20", src: "https://flowbite.com/docs/images/people/profile-picture-5.jpg", description: "This is the fourth image." },
]);

const selectedImage = ref(null);

// Function to handle image click (toggle behavior)
const selectImage = (image) => {
   selectedImage.value = selectedImage.value?.id === image.id ? null : image;
};

// Function to close image details
const closeDetails = () => {
   selectedImage.value = null;
};
</script>

<template>
   <div>
      <!-- HEADER -->
      <header class="shadow">
         <div class="p-4 md:px-6 md:py-6 sm:px-6">
            <h1 class="text-3xl font-bold tracking-tight dark:text-gray-200">
               Inventory
            </h1>
         </div>
      </header>

      <!-- MAIN CONTAINER -->
      <div class="border p-4">
         <div :class="selectedImage ? 'grid grid-cols-2 gap-4' : 'grid grid-cols-1'">

            <!-- IMAGE LIST -->
            <div class="grid gap-4" :class="selectedImage ? 'grid grid-cols-3' : 'grid grid-cols-5'">
               <div v-for="image in images" :key="image.id" @click="selectImage(image)"
                  class="cursor-pointer p-2 border rounded-lg hover:shadow-lg transition"
                  :class="selectedImage && selectedImage.id === image.id ? 'bg-blue-200' : ''">
                  <img :src="image.src" :alt="image.title" class="w-full h-32 object-cover rounded-lg" />
                  <p class="text-center mt-2 font-medium">{{ image.title }}</p>
               </div>
            </div>

            <!-- IMAGE DETAILS (Shown when an image is clicked) -->
            <div v-if="selectedImage" class="relative p-4 border rounded-lg">
               <!-- CLOSE BUTTON -->
               <button @click="closeDetails"
                  class="absolute top-2 right-2 bg-gray-200 text-gray-700 px-2 py-1 rounded-full hover:bg-gray-300 transition">
                  ✕
               </button>

               <h2 class="text-2xl font-semibold mb-4">{{ selectedImage.title }}</h2>
               <img :src="selectedImage.src" :alt="selectedImage.title" class="w-full h-40 object-cover rounded-lg" />
               <p class="mt-4 text-gray-700">{{ selectedImage.description }}</p>
            </div>

         </div>
      </div>
   </div>
</template>

<style scoped>
/* Additional styling if needed */
</style>
