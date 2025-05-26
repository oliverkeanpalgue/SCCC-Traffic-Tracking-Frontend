<template>
    <nav class="fixed top-0 z-50 w-full bg-[#1b1a1a]">
        <div class="py-3 lg:px-5 lg:pl-3">
            <div class="flex items-center justify-between">
                <div class="flex items-center justify-start mt-2">
                    <button data-drawer-target="logo-sidebar" data-drawer-toggle="logo-sidebar"
                        aria-controls="logo-sidebar" type="button"
                        class="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
                    </button>
                    <a href="/" class="flex justify-center items-center gap-2 md:me-24 mt">
                        <img src="/img/Logo.png" alt="Logo" class="w-[50px] h-full" />
                        <span
                            class="self-center flex items-center text-xl font-semibold whitespace-nowrap dark:text-white">Traffic Monitoring System</span>
                    </a>

                </div>

                <div class="flex items-center relative">
                    <div>
                        <button type="button"
                            class="flex cursor-pointer text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                            @click="toggleDropdown" aria-expanded="false">
                            <img class="w-8 h-8 rounded-full" src="/img/Logo.png" alt="user photo" />
                        </button>
                    </div>

                    <div v-show="isDropdownOpen"
                        class="absolute z-50 my-4 border border-1 border-gray-800 text-base list-none bg-[#1b1a1a] divide-y divide-gray-100 right-10 top-10 w-58 rounded-sm shadow-sm"
                        id="dropdown-user">
                        <div class="px-4 py-3" role="none">
                            <p class="text-sm text-gray-900 dark:text-white" role="none">
                                {{ currentUserName }}
                            </p>
                        </div>
                        <ul class="py-1" role="none">
                            <li>
                                <button @click="logout"
                                    class="block w-full cursor-pointer text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                                    role="menuitem">Sign out</button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </nav>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useDatabaseStore } from "../../stores/databaseStore";
import axiosClient from "../../axios.js";

const isDropdownOpen = ref(false);
const databaseStore = useDatabaseStore();

const props = defineProps({
  isLoggedIn: Boolean,
  user: Object
});

const currentUserName = computed(() => {
  if (!props.user) return 'User';
  return [
    props.user.firstName,
    props.user.middleName,
    props.user.lastName
  ].filter(Boolean).join(' ');
});

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value;
}

function logout() {
  axiosClient.post('/logout').then(() => {
    window.location.reload();
  });
}

onMounted(async () => {
  await databaseStore.fetchCurrentUser();
});
</script>