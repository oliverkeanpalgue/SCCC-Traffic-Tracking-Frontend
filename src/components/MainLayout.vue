<script setup>

import { ref, computed, onMounted, onUnmounted } from "vue";
import useUserStore from "../stores/user.js";
import axiosClient from "../axios.js";
import { FeLogOut } from '@kalimahapps/vue-icons';
import { ClCloseMd } from '@kalimahapps/vue-icons';
import { MdDashboard } from '@kalimahapps/vue-icons';
import { MdInventory2 } from '@kalimahapps/vue-icons';
import { MdRoundCategory } from '@kalimahapps/vue-icons';
import { FlFilledPeopleSwap } from '@kalimahapps/vue-icons';
import { FaUserGear } from '@kalimahapps/vue-icons';
import { BxSolidBuildings } from '@kalimahapps/vue-icons';
import lightBlueBg from "../assets/lightBlueBg.jpg";
import darkBlueBg from "../assets/darkBlueBg.jpg";
import { MdRoundDarkMode } from '@kalimahapps/vue-icons';
import { MdRoundLightMode } from '@kalimahapps/vue-icons';

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
    document.addEventListener('click', handleClickOutside);
});

const userStore = useUserStore();
const user = computed(() => userStore.user);
const inventoryAccess = computed(() => userStore.inventoryAccess);

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
const toggleButtonRef = ref(null);
const sidebarRef = ref(null);

// Custom composition function to handle click outside
const handleClickOutside = (event) => {
    console.log("clicked outside");
    if (
        profileSettingsDropdownButtonRef.value &&
        !profileSettingsDropdownButtonRef.value.contains(event.target)
    ) {
        profileSettingsDropdownOpen.value = false;
    }
    if (
        sidebarVisible.value &&
        sidebarRef.value &&
        toggleButtonRef.value &&
        !sidebarRef.value.contains(event.target) &&
        !toggleButtonRef.value.contains(event.target)
    ) {
        sidebarVisible.value = false;
    }
};

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
    <div :style="{ backgroundImage: `url(${theme === 'dark' ? darkBlueBg : lightBlueBg})` }"
        class="bg-cover bg-center min-h-screen">

        <aside id="logo-sidebar" ref="sidebarRef"
            class="fixed top-0 left-0 w-64 h-screen pt-4 pl-3 xl:pt-4 transition-transform z-100 xl:z-5 backdrop-blur-sm xl:translate-x-0 bg-gray-200/80 dark:bg-gray-900/80 xl:bg-transparent xl:dark:bg-transparent"
            :class="sidebarVisible ? 'translate-x-0' : '-translate-x-full'" aria-label="Sidebar">
            <div class="h-full px-3 pb-4 overflow-y-auto flex flex-col justify-between">

                <ul class="space-y-2 font-medium">
                    <div class="mb-4">
                        <div class="flex">
                            <img src="../assets/baguio-logo.png" class="h-12 me-1" alt="Smart City Baguio" />
                            <span
                                class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">SCCC-Inventory</span>
                        </div>
                        <div
                            class="h-0.5 bg-gradient-to-r from-blue-100 via-blue-500 to-blue-100 dark:from-blue-950 dark:via-blue-500 dark:to-blue-950">
                        </div>
                    </div>
                    <li>
                        <RouterLink to="/" @click="closeSidebar()" v-if="inventoryAccess.for_dashboard === 1"
                            :class="[$route.name === 'Dashboard' ?
                                'bg-gray-400/30 hover:bg-gray-400/35 dark:bg-gray-200/35 dark:hover:bg-gray-300/30' :
                                'bg-gray-200/30 hover:bg-gray-400/30 dark:bg-gray-500/5 dark:hover:bg-gray-300/30',
                                'flex my-2 items-center p-1.5 px-3 rounded-xl group hover:scale-105 transition duration-75']">
                            <span :class="[$route.name === 'Dashboard' ?
                                'bg-blue-500 dark:bg-blue-600 text-blue-100 dark:text-blue-100' :
                                'bg-gray-300 group-hover:bg-blue-300 dark:bg-gray-800 dark:group-hover:bg-gray-300/70 text-blue-500 group-hover:text-blue-700 dark:text-blue-500 dark:group-hover:text-blue-500',
                                'p-1.5 rounded-xl transition duration-75']">
                                <MdDashboard class="w-6 h-6" />
                            </span>
                            <span :class="[$route.name === 'Dashboard' ? 'font-semibold dark:font-bold' : '']"
                                class="ml-3 text-gray-800 dark:text-white ">Dashboard</span>
                        </RouterLink>
                    </li>
                    <li>
                        <RouterLink to="/inventory" @click="closeSidebar()" v-if="inventoryAccess.for_inventory === 1"
                            :class="[$route.name === 'Inventory' ?
                                'bg-gray-400/30 hover:bg-gray-400/35 dark:bg-gray-200/35 dark:hover:bg-gray-300/30' :
                                'bg-gray-200/30 hover:bg-gray-400/30 dark:bg-gray-500/5 dark:hover:bg-gray-300/30',
                                'flex my-2 items-center p-1.5 px-3 rounded-xl group hover:scale-105 transition duration-75']">
                            <span :class="[$route.name === 'Inventory' ?
                                'bg-blue-500 dark:bg-blue-600 text-blue-100 dark:text-blue-100' :
                                'bg-gray-300 group-hover:bg-blue-300 dark:bg-gray-800 dark:group-hover:bg-gray-300/70 text-blue-500 group-hover:text-blue-700 dark:text-blue-500 dark:group-hover:text-blue-500',
                                'p-1.5 rounded-xl transition duration-75']">
                                <MdInventory2 class="w-6 h-6" />
                            </span>
                            <span :class="[$route.name === 'Inventory' ? 'font-semibold dark:font-bold' : '']"
                                class="ml-3 text-gray-800 dark:text-white ">Inventory</span>
                        </RouterLink>
                    </li>
                    <li>
                        <RouterLink to="/categories" @click="closeSidebar()" v-if="inventoryAccess.for_categories === 1"
                            :class="[$route.name === 'Categories' ?
                                'bg-gray-400/30 hover:bg-gray-400/35 dark:bg-gray-200/35 dark:hover:bg-gray-300/30' :
                                'bg-gray-200/30 hover:bg-gray-400/30 dark:bg-gray-500/5 dark:hover:bg-gray-300/30',
                                'flex my-2 items-center p-1.5 px-3 rounded-xl group hover:scale-105 transition duration-75']">
                            <span :class="[$route.name === 'Categories' ?
                                'bg-blue-500 dark:bg-blue-600 text-blue-100 dark:text-blue-100' :
                                'bg-gray-300 group-hover:bg-blue-300 dark:bg-gray-800 dark:group-hover:bg-gray-300/70 text-blue-500 group-hover:text-blue-700 dark:text-blue-500 dark:group-hover:text-blue-500',
                                'p-1.5 rounded-xl transition duration-75']">
                                <MdRoundCategory class="w-6 h-6" />
                            </span>
                            <span :class="[$route.name === 'Categories' ? 'font-semibold dark:font-bold' : '']"
                                class="ml-3 text-gray-800 dark:text-white ">Categories</span>
                        </RouterLink>
                    </li>
                    <li>
                        <RouterLink to="/borrowers" @click="closeSidebar()" v-if="inventoryAccess.for_borrowers === 1"
                            :class="[$route.name === 'Borrowers' ?
                                'bg-gray-400/30 hover:bg-gray-400/35 dark:bg-gray-200/35 dark:hover:bg-gray-300/30' :
                                'bg-gray-200/30 hover:bg-gray-400/30 dark:bg-gray-500/5 dark:hover:bg-gray-300/30',
                                'flex my-2 items-center p-1.5 px-3 rounded-xl group hover:scale-105 transition duration-75']">
                            <span :class="[$route.name === 'Borrowers' ?
                                'bg-blue-500 dark:bg-blue-600 text-blue-100 dark:text-blue-100' :
                                'bg-gray-300 group-hover:bg-blue-300 dark:bg-gray-800 dark:group-hover:bg-gray-300/70 text-blue-500 group-hover:text-blue-700 dark:text-blue-500 dark:group-hover:text-blue-500',
                                'p-1.5 rounded-xl transition duration-75']">
                                <FlFilledPeopleSwap class="w-6 h-6" />
                            </span>
                            <span :class="[$route.name === 'Borrowers' ? 'font-semibold dark:font-bold' : '']"
                                class="ml-3 text-gray-800 dark:text-white ">Borrowers</span>
                        </RouterLink>
                    </li>
                    <li>
                        <RouterLink to="/users" @click="closeSidebar()" v-if="inventoryAccess.for_users === 1"
                            :class="[$route.name === 'Users' ?
                                'bg-gray-400/30 hover:bg-gray-400/35 dark:bg-gray-200/35 dark:hover:bg-gray-300/30' :
                                'bg-gray-200/30 hover:bg-gray-400/30 dark:bg-gray-500/5 dark:hover:bg-gray-300/30',
                                'flex my-2 items-center p-1.5 px-3 rounded-xl group hover:scale-105 transition duration-75']">
                            <span :class="[$route.name === 'Users' ?
                                'bg-blue-500 dark:bg-blue-600 text-blue-100 dark:text-blue-100' :
                                'bg-gray-300 group-hover:bg-blue-300 dark:bg-gray-800 dark:group-hover:bg-gray-300/70 text-blue-500 group-hover:text-blue-700 dark:text-blue-500 dark:group-hover:text-blue-500',
                                'p-1.5 rounded-xl transition duration-75']">
                                <FaUserGear class="w-6 h-6" />
                            </span>
                            <span :class="[$route.name === 'Users' ? 'font-semibold dark:font-bold' : '']"
                                class="ml-3 text-gray-800 dark:text-white ">Users</span>
                        </RouterLink>
                    </li>
                    <li>
                        <RouterLink to="/offices" @click="closeSidebar()" v-if="inventoryAccess.for_offices === 1"
                            :class="[$route.name === 'Offices' ?
                                'bg-gray-400/30 hover:bg-gray-400/35 dark:bg-gray-200/35 dark:hover:bg-gray-300/30' :
                                'bg-gray-200/30 hover:bg-gray-400/30 dark:bg-gray-500/5 dark:hover:bg-gray-300/30',
                                'flex my-2 items-center p-1.5 px-3 rounded-xl group hover:scale-105 transition duration-75']">
                            <span :class="[$route.name === 'Offices' ?
                                'bg-blue-500 dark:bg-blue-600 text-blue-100 dark:text-blue-100' :
                                'bg-gray-300 group-hover:bg-blue-300 dark:bg-gray-800 dark:group-hover:bg-gray-300/70 text-blue-500 group-hover:text-blue-700 dark:text-blue-500 dark:group-hover:text-blue-500',
                                'p-1.5 rounded-xl transition duration-75']">
                                <BxSolidBuildings class="w-6 h-6" />
                            </span>
                            <span :class="[$route.name === 'Offices' ? 'font-semibold dark:font-bold' : '']"
                                class="ml-3 text-gray-800 dark:text-white ">Offices</span>
                        </RouterLink>
                    </li>
                </ul>

                <div class="w-full space-y-2 font-medium">
                    <button
                        class="flex w-full my-2 items-center p-1.5 px-3 rounded-xl group hover:scale-105 transition duration-75 bg-gray-200/30 hover:bg-gray-400/30 dark:bg-gray-500/5 dark:hover:bg-gray-300/30">
                        <span
                            class="p-1.5 rounded-xl transition duration-75 bg-gray-300 group-hover:bg-blue-300 dark:bg-gray-800 dark:group-hover:bg-gray-300/70 text-blue-500 group-hover:text-blue-700 dark:text-blue-500 dark:group-hover:text-blue-500">
                            <BxSolidBuildings class="w-6 h-6" />
                        </span>
                        <span class="ml-3 text-gray-800 dark:text-white">{{ user.firstName }}</span>
                    </button>
                    <button @click="toggleTheme"
                        class="flex w-full my-2 items-center p-1.5 px-3 rounded-xl group hover:scale-105 transition duration-75 bg-gray-200/30 hover:bg-gray-400/30 dark:bg-gray-500/5 dark:hover:bg-gray-300/30">
                        <span
                            class="p-1.5 rounded-xl transition duration-75 bg-gray-300 group-hover:bg-blue-300 dark:bg-gray-800 dark:group-hover:bg-gray-300/70 text-blue-500 group-hover:text-blue-700 dark:text-blue-500 dark:group-hover:text-blue-500">
                            <MdRoundLightMode v-if="theme === 'light'" class="w-6 h-6" />
                            <MdRoundDarkMode v-else class="w-6 h-6" />
                        </span>
                        <span v-if="theme === 'light'" class="ml-3 text-gray-800 dark:text-white">Light Mode</span>
                        <span v-else class="ml-3 text-gray-800 dark:text-white">Dark Mode</span>
                    </button>
                    <button @click="openSignOutModal()" data-modal-target="popup-modal" data-modal-toggle="popup-modal"
                        class="flex w-full my-2 items-center p-1.5 px-3 rounded-xl group hover:scale-105 transition duration-75 bg-gray-200/30 hover:bg-gray-400/30 dark:bg-gray-500/5 dark:hover:bg-gray-300/30">
                        <span
                            class="p-1.5 rounded-xl transition duration-75 bg-gray-300 group-hover:bg-blue-300 dark:bg-gray-800 dark:group-hover:bg-gray-300/70 text-blue-500 group-hover:text-blue-700 dark:text-blue-500 dark:group-hover:text-blue-500">
                            <FeLogOut class="w-6 h-6" />
                        </span>
                        <span class="ml-3 text-gray-800 dark:text-white">Sign Out</span>
                    </button>
                </div>
            </div>
        </aside>

        <nav class="fixed top-0 w-full">
            <div class="px-3 py-3 xl:px-5 xl:pl-3">
                <div class="flex items-center xl:pl-64 justify-between">
                    <div class="flex items-center justify-start rtl:justify-end">
                        <button @click="toggleSidebar" aria-controls="logo-sidebar" type="button" ref="toggleButtonRef"
                            class="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg xl:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
                            <span class="sr-only">Open sidebar</span>
                            <svg class="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg">
                                <path clip-rule="evenodd" fill-rule="evenodd"
                                    d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z">
                                </path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <div class="min-h-[100vh] max-h-[100vh] overflow-auto px-4 pl-8 xl:pl-4 xl:ml-64 dark:text-gray-200">
            <!-- MAIN CONTENT -->
            <router-view class="" />

            <!-- SIGN OUT modal -->
            <div v-show="signout_visible" class="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
                <div class="relative p-4 w-full max-w-md">
                    <div
                        class="relative bg-white rounded-lg shadow-sm border-2 border-gray-700 dark:bg-gray-800 dark:border-gray-500">
                        <button type="button"
                            class="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                            @click="closeSignOutModal()">
                            <ClCloseMd class="w-6 h-6" aria-hidden="true" />
                        </button>
                        <div class="p-4 md:p-5 text-center">
                            <div class="flex mb-5 w-full items-center justify-center ">
                                <FeLogOut class="w-10 h-10 " />
                            </div>
                            <h3 class="mb-6 text-lg font-normal text-gray-800 dark:text-gray-200">Are you sure you want
                                to sign out?</h3>
                            <button @click="logout" type="button"
                                class="text-white bg-red-700 hover:bg-red-500 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">
                                Yes, Sign Out
                            </button>
                            <button @click="closeSignOutModal()" type="button"
                                class="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-400 hover:bg-green-500 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                                No, Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    </div>
</template>