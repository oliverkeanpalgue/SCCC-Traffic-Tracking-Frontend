<script setup>

import { ref, computed, onMounted } from "vue";
import useUserStore from "../stores/user.js";
import axiosClient from "../axios.js";

const theme = ref(localStorage.getItem("theme") || "light");

const signout_visible = ref(false);

const toggleTheme = () => {
    if (theme.value === "light") {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
        theme.value = "dark";
    } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
        theme.value = "light";
    }
};

onMounted(() => {
    if (localStorage.getItem("theme") === "dark") {
        document.documentElement.classList.add("dark");
        theme.value = "dark";
    }
});

const userStore = useUserStore();
const user = computed(() => userStore.user);

const navigation = [
    { name: 'Dashboard', to: { name: 'Dashboard' }, icon: 'dashboard' },
    { name: 'Inventory', to: { name: 'Inventory' }, icon: 'inventory' },
    { name: 'Reports', to: { name: 'Reports' }, icon: 'analytics' },
    { name: 'Borrowed', to: { name: 'Borrowed' }, icon: 'transfer_within_a_station' },
    { name: 'Upload', to: { name: 'Home' }, icon: 'upload' },
    { name: 'My Images', to: { name: 'MyImages' }, icon: 'photo_library' },
]

function logout() {
    axiosClient.post('/logout').then(() => {
        window.location.reload();
    });
}

</script>

<template>
    <div>
        <nav class="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-black dark:border-black">
            <div class="px-3 py-3 lg:px-5 lg:pl-3">
                <div class="flex items-center justify-between">
                    <div class="flex items-center justify-start rtl:justify-end">
                        <button data-drawer-target="logo-sidebar" data-drawer-toggle="logo-sidebar"
                            aria-controls="logo-sidebar" type="button"
                            class="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
                            <span class="sr-only">Open sidebar</span>
                            <svg class="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg">
                                <path clip-rule="evenodd" fill-rule="evenodd"
                                    d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z">
                                </path>
                            </svg>
                        </button>
                        <a href="#" class="flex ms-2 md:me-24">
                            <img src="../assets/baguio-logo.png" class="h-10 me-3" alt="Smart City Baguio" />
                            <span
                                class="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">SCCC-Inventory
                                System</span>
                        </a>
                    </div>

                    <div class="flex items-center">
                        <div class="flex items-center ms-3">

                            <div>
                                <button type="button"
                                    class="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                                    aria-expanded="false" data-dropdown-toggle="dropdown-user">
                                    <span class="sr-only">Open user menu</span>
                                    <img class="w-8 h-8 rounded-full"
                                        src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                                        alt="user photo">
                                </button>
                            </div>
                            <div class="z-50 w-40 hidden my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-sm shadow-sm dark:bg-gray-700 dark:divide-gray-600"
                                id="dropdown-user">
                                <div class="px-4 py-3" role="none">
                                    <p class="text-sm text-gray-900 dark:text-white" role="none">
                                        {{ user?.firstname || 'Guest' }}
                                    </p>
                                    <p class="text-sm font-medium text-gray-900 truncate dark:text-gray-300"
                                        role="none">
                                        {{ user?.email || 'No email' }}
                                    </p>
                                </div>
                                <ul class="py-1" role="none">
                                    <li>
                                        <button @click="toggleTheme"
                                            class="block w-full text-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white">
                                            <div v-if="theme === 'light'">🌞 Light Mode</div>
                                            <div v-else>🌙 Dark Mode</div>
                                        </button>
                                    </li>
                                    <li>
                                        <button @click="signout_visible = true" data-modal-target="popup-modal"
                                            data-modal-toggle="popup-modal"
                                            class="w-full text-start block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                                            type="button">
                                            Sign out
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <aside id="logo-sidebar"
            class="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-gray-200 lg:translate-x-0 dark:bg-black dark:border-black"
            aria-label="Sidebar">
            <div class="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-black">
                <ul class="space-y-2 font-medium">
                    <li>
                        <RouterLink v-for='item in navigation' :to="item.to" :key="item.name"
                            :class="[$route.name === item.to.name ? 'text-gray-700 bg-gray-300 hover:text-gray-700 hover:bg-gray-300 dark:text-gray-300 dark:bg-gray-600 dark:hover:text-gray-300 dark:hover:bg-gray-600' : 'text-gray-900 hover:text-gray-700 hover:bg-gray-300 dark:text-white dark:hover:text-gray-400 dark:hover:bg-gray-700', 'flex my-2 items-center p-2 rounded-lg group']">
                            <span
                                :class="[$route.name === item.to.name ? 'text-gray-700 group-hover:text-gray-700 dark:text-gray-300 dark:group-hover:text-gray-300' : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-400 dark:group-hover:text-gray-400', 'material-icons w-5 h-5 transition duration-75']">
                                {{ item.icon }}
                            </span>
                            <span class="ms-3">{{ item.name }}</span>
                        </RouterLink>
                    </li>
                </ul>
            </div>
        </aside>

        <div class="h-screen pt-14 p-4 lg:ml-64 dark:bg-gray-900">
            <!-- MAIN CONTENT -->
            <router-view />

            <Dialog :visible="signout_visible" modal header="Sign out" :style="{ width: '25rem' }">
                <span class="text-surface-500 dark:text-surface-400 block mb-8">Are you sure you want to sign
                    out?</span>
                <div class="flex justify-end gap-2">
                    <Button type="button" label="Cancel" severity="secondary"
                        @click="signout_visible = false">Cancel</Button>
                    <Button type="button" label="Sign out" @click="logout">Sign out</Button>
                </div>
            </Dialog>

            <!-- SIGN OUT modal -->
            <div id="popup-modal" tabindex="-1"
                class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
                <div class="relative p-4 w-full max-w-md max-h-full">
                    <div class="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
                        <button type="button"
                            class="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                            data-modal-hide="popup-modal">
                            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                                viewBox="0 0 14 14">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                            </svg>
                            <span class="sr-only">Close modal</span>
                        </button>
                        <div class="p-4 md:p-5 text-center">
                            <svg class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want
                                to sign out?</h3>
                            <button @click="logout" type="button" data-modal-hide="popup-modal"
                                class="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">
                                Yes, I'm sure
                            </button>
                            <button data-modal-hide="popup-modal" type="button"
                                class="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">No,
                                cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>