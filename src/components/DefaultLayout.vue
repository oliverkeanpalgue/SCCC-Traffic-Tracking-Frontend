<template>
  <div class="flex flex-row min-h-screen relative">
    <!-- Sidebar -->
    <aside :class="[
      is_expanded ? 'w-full md:w-64' : 'w-16',
      'flex flex-col bg-gray-900 text-white p-4 transition-all duration-200 ease-in-out overflow-hidden',
      is_expanded && isMobileOrTablet ? 'fixed inset-0 z-50' : 'relative'
    ]">
      <!-- Logo Section -->
      <div class="mb-4 flex items-center">
        <img :src="logoURL" alt="Logo" class="w-8 h-8" />
        <span class="ml-4 transition-opacity duration-300 ease-in-out"
          :class="{ 'opacity-100': is_expanded, 'opacity-0': !is_expanded }">Home</span>
      </div>

      <!-- Toggle Button -->
      <div class="flex justify-end mb-4 transition-all duration-200 ease-in-out" :class="{ '-top-12': is_expanded }">
        <button @click="ToggleMenu" class="transition-transform duration-200 ease-in-out transform"
          :class="{ 'rotate-180': is_expanded }">
          <span
            class="material-icons text-2xl text-white hover:text-indigo-500 transition-transform duration-200 ease-out hover:translate-x-2">
            keyboard_double_arrow_right
          </span>
        </button>
      </div>

      <!-- Menu -->
      <h3 class="text-gray-400 text-sm uppercase mb-2 transition-opacity duration-300 ease-in-out"
        :class="{ 'opacity-100': is_expanded, 'opacity-0': !is_expanded }">
        Menu
      </h3>

      <div class="-mx-4">
        <RouterLink v-for='item in navigation' :to="item.to" :key="item.name"
          :class="[$route.name === item.to.name ? 'bg-gray-800 border-r-4 border-indigo-500' : ' hover:bg-gray-800', 'flex items-center p-2 pl-4 transition duration-200 ease-in-out']">
          <span class="material-icons text-2xl text-white">{{ item.icon }}</span>
          <span class="ml-4" :class="{ 'opacity-100': is_expanded, 'opacity-0': !is_expanded }">Home</span>
        </RouterLink>
      </div>

      <div class="flex-1"></div>

      <div class="-mx-4">
        <router-link to="/settings"
          class="flex items-center p-2 pl-4 hover:bg-gray-800 transition duration-200 ease-in-out"
          :class="{ 'bg-gray-800 border-r-4 border-indigo-500': route.path === '/settings' }">
          <span class="material-icons text-2xl text-white">settings</span>
          <span class="ml-4" :class="{ 'opacity-100': is_expanded, 'opacity-0': !is_expanded }">Settings</span>
        </router-link>

        <button @click="themeStore.toggleTheme"
          class="ml-4 px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
          Toggle Theme
        </button>

       <!-- Profile Section -->
<div class="relative border-t border-gray-700 pb-3 pt-4">
  <!-- Profile Button -->
  <button @click="toggleProfileDropdown" class="flex items-center px-5 w-full hover:bg-gray-800 rounded-md transition duration-200">
    <img class="size-10 rounded-full" src="https://randomuser.me/api/portraits/men/81.jpg" alt="Profile" />
    <div class="ml-3 text-left">
      <div class="text-base font-medium text-white">{{ user?.name || 'Guest' }}</div>
      <div class="text-sm font-medium text-gray-400">{{ user?.email || 'No email' }}</div>
    </div>
    <span class="material-icons ml-auto text-gray-400 transition-transform" :class="{ 'rotate-180': isProfileDropdownOpen }">
      expand_more
    </span>
  </button>

  <!-- Dropdown Menu -->
  <div v-if="isProfileDropdownOpen" class="absolute right-4 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50">
    <button @click="editProfile" class="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
      Edit Profile
    </button>
    <button @click="logout" class="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
      Sign Out
    </button>
  </div>
</div>

      </div>
    </aside>



    <!-- Backdrop for Mobile/Tablet -->
    <div v-if="is_expanded && isMobileOrTablet" class="fixed inset-0 bg-black bg-opacity-50 z-40" @click="ToggleMenu">
    </div>

    <!-- Main Content Area -->
    <main class="flex-1 transition-all duration-300 ease-in-out">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import logoURL from '../assets/baguio-logo.png';
import axiosClient from "../axios.js";
import router from "../router.js";
import useUserStore from "../stores/user.js";
import { useThemeStore } from '../stores/themeStore';
import { DisclosureButton, Disclosure, DisclosurePanel } from '@headlessui/vue'

const is_expanded = ref(localStorage.getItem("is_expanded") === "true");

const ToggleMenu = () => {
  is_expanded.value = !is_expanded.value;
  localStorage.setItem("is_expanded", is_expanded.value);
};

const route = useRoute();
const userStore = useUserStore();
const themeStore = useThemeStore();
const user = computed(() => userStore.user);

const isMobileOrTablet = ref(window.innerWidth < 1024);
const handleResize = () => {
  isMobileOrTablet.value = window.innerWidth < 1024;
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

const navigation = [
  { name: 'Upload', to: { name: 'Home' }, icon: 'home' },
  { name: 'My Images', to: { name: 'MyImages' }, icon: 'collections' },
]

const isProfileDropdownOpen = ref(false);

// Toggle dropdown visibility
const toggleProfileDropdown = () => {
  isProfileDropdownOpen.value = !isProfileDropdownOpen.value;
};

// Dummy edit profile function (replace with actual navigation)
const editProfile = () => {
  router.push({ name: 'EditProfile' }); // Make sure this route exists
};

function logout() {
  axiosClient.post('/logout').then(() => {
    router.push({ name: 'Login' });
  });
}
</script>

<style scoped>
@media (max-width: 1024px) {
  aside {
    height: 100vh;
  }
}
</style>
