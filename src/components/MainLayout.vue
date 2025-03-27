<script setup>

import { ref, computed, onMounted, onUnmounted } from "vue";
import useUserStore from "../stores/user.js";
import axiosClient from "../axios.js";
import { FeLogOut } from '@kalimahapps/vue-icons';

const theme = ref(localStorage.getItem("theme") || "light");

const signout_visible = ref(false);

const sidebarVisible = ref(false);

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

const toggleSidebar = () => {
    sidebarVisible.value = !sidebarVisible.value;
}

const closeSidebar = () => {
    sidebarVisible.value = false;
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
    { name: 'Categories', to: { name: 'Categories' }, icon: 'category' },
    { name: 'Borrowers', to: { name: 'Borrowers' }, icon: 'transfer_within_a_station' },
    { name: 'Users', to: { name: 'Users' }, icon: 'groups' },
    { name: 'Reports', to: { name: 'Reports' }, icon: 'analytics' },
    { name: 'Borrowed', to: { name: 'Borrowed' }, icon: 'transfer_within_a_station' },
    { name: 'Upload', to: { name: 'Upload' }, icon: 'upload' },
    { name: 'My Images', to: { name: 'MyImages' }, icon: 'photo_library' },
]

function logout() {
    axiosClient.post('/logout').then(() => {
        window.location.reload();
    });
}

const profileSettingsDropdownOpen = ref(false)
const profileSettingsDropdownButtonRef = ref(null)

const toggleProfileSettingsDropdown = () => {
    profileSettingsDropdownOpen.value = !profileSettingsDropdownOpen.value
}

// Custom composition function to handle click outside
const handleClickOutside = (event) => {
    if (
        profileSettingsDropdownButtonRef.value &&
        !profileSettingsDropdownButtonRef.value.contains(event.target)
    ) {
        profileSettingsDropdownOpen.value = false
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})

const openSignOutModal = () => {
    signout_visible.value = true;
};

const closeSignOutModal = () => {
    signout_visible.value = false;
};
</script>

<template>
    <div>
        <nav class="fixed top-0 z-50 w-full bg-white border-b-2 border-gray-300 dark:bg-black dark:border-black">
            <div class="px-3 py-3 lg:px-5 lg:pl-3">
                <div class="flex items-center justify-between">
                    <div class="flex items-center justify-start rtl:justify-end">
                        <button @click="toggleSidebar" aria-controls="logo-sidebar" type="button"
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

                    <section class="">
                        <div class="">
                            <div
                                class="border-2 relative inline-block min-w-30 rounded-2xl px-4 py-1 bg-gray-200 border-gray-400 dark:bg-gray-800 dark:border-gray-600 ">
                                <button @click="toggleProfileSettingsDropdown" ref="profileSettingsDropdownButtonRef"
                                    class="flex items-center text-left">
                                    <div class="relative mr-4 h-9 w-9 rounded-full">
                                        <img src="https://cdn.tailgrids.com/2.2/assets/core-components/images/avatar/image-05.jpg"
                                            alt="avatar"
                                            class="h-full w-full rounded-full object-cover object-center" />
                                    </div>
                                    <span class="text-base font-medium text-dark dark:text-white"> {{ user.firstName }}
                                    </span>
                                </button>
                                <div v-show="profileSettingsDropdownOpen"
                                    class="absolute right-0 top-full z-40 w-[200px] space-y-1 mt-1 rounded-xl bg-gray-300 p-2 shadow-card border-2 font-bold border-gray-500 dark:bg-gray-800 dark:shadow-box-dark dark:border-gray-700">
                                    <button @click="toggleTheme"
                                        class="block w-full text-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white">
                                        <div v-if="theme === 'light'">🌞 Light Mode</div>
                                        <div v-else>🌙 Dark Mode</div>
                                    </button>
                                    <button @click="openSignOutModal()" data-modal-target="popup-modal"
                                        data-modal-toggle="popup-modal"
                                        class="w-full flex flex-row text-start block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                                        type="button">
                                        
                                <FeLogOut class="w-5 h-5 mr-1"/>
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </nav>

        <aside id="logo-sidebar"
            class="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform  bg-white border-r-2 border-gray-300 lg:translate-x-0 dark:bg-black dark:border-black"
            :class="sidebarVisible ? 'translate-x-0' : '-translate-x-full'" aria-label="Sidebar">
            <div class="h-full px-3 pb-4 overflow-y-auto">
                <ul class="space-y-2 font-medium">
                    <li>
                        <RouterLink v-for='item in navigation' :to="item.to" :key="item.name"
                            :class="[$route.name === item.to.name ? 'text-gray-900 bg-white-400 hover:text-gray-800 hover:bg-white-300 dark:text-gray-300 dark:bg-gray-600 dark:hover:text-gray-300 dark:hover:bg-gray-600' : 'text-gray-900 hover:text-gray-700 hover:bg-gray-300 dark:text-white dark:hover:text-gray-400 dark:hover:bg-gray-700', 'flex my-2 items-center p-2 rounded-lg group']"
                            @click="closeSidebar()">
                            <span
                                :class="[$route.name === item.to.name ? 'text-gray-900 group-hover:text-gray-800 dark:text-gray-300 dark:group-hover:text-gray-300' : 'text-gray-900 group-hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-400 dark:group-hover:text-gray-400', 'material-icons w-5 h-5 transition duration-75']">
                                {{ item.icon }}
                            </span>
                            <span class="ms-3">{{ item.name }}</span>
                        </RouterLink>
                    </li>
                </ul>
            </div>
        </aside>


        <div class="min-h-screen max-h-full pt-14 p-4 lg:ml-64 bg-gray-200 dark:bg-gray-900 dark:text-gray-200">
            <!-- MAIN CONTENT -->
            <router-view class="" />

            <!-- SIGN OUT modal -->
            <div v-show="signout_visible" class="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                <div class="relative p-4 w-full max-w-md">
                    <div class="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
                        <button type="button"
                            class="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                            @click="closeSignOutModal()">
                            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                                viewBox="0 0 14 14">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                            </svg>
                        </button>
                        <div class="p-4 md:p-5 text-center">
                            <div class="flex w-full items-center justify-center">
                                <FeLogOut class="w-10 h-10 "/>
                            </div>
                            <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want
                                to sign out?</h3>
                            <button @click="logout" type="button"
                                class="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">
                                Yes, Sign Out
                            </button>
                            <button @click="closeSignOutModal()" type="button"
                                class="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                                No, Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    </div>
</template>