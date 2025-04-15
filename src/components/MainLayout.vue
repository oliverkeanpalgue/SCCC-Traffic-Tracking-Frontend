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
    <div class="bg-gradient-to-br from-blue-300 from-0% via-blue-200 via-12% to-white to-90% dark:from-blue-900 dark:from-0% dark:via-blue-950 dark:via-12% dark:to-black dark:to-80%">
        <nav class="fixed top-0 z-50 w-full border-b-2 border-gray-300  dark:border-black">
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
                                        class="w-full flex flex-row text-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                                        type="button">

                                        <FeLogOut class="w-5 h-5 mr-1" />
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
            class="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform border-r-2 border-gray-300 lg:translate-x-0 dark:border-white/10"
            :class="sidebarVisible ? 'translate-x-0' : '-translate-x-full'" aria-label="Sidebar">
            <div class="h-full px-3 pb-4 overflow-y-auto">
                <ul class="space-y-2 font-medium">
                    <li>
                        <RouterLink to="/"
                            :class="[$route.name === 'Dashboard' ? 'text-gray-900 bg-white-400 hover:text-gray-800 hover:bg-white-300 dark:text-gray-300 dark:bg-gray-600 dark:hover:text-gray-300 dark:hover:bg-gray-600' : 'text-gray-900 hover:text-gray-700 hover:bg-gray-300 dark:text-white dark:hover:text-gray-400 dark:hover:bg-gray-700', 'flex my-2 items-center p-2 rounded-lg group']"
                            @click="closeSidebar()" v-if="inventoryAccess.for_dashboard === 1">
                            <span
                                :class="[$route.name === 'Dashboard' ? 'text-gray-900 group-hover:text-gray-800 dark:text-gray-300 dark:group-hover:text-gray-300' : 'text-gray-900 group-hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-400 dark:group-hover:text-gray-400', 'material-icons w-5 h-5 transition duration-75']">
                                <MdDashboard />
                            </span>
                            <span class="ms-3">Dashboard</span>
                        </RouterLink>
                    </li>
                    <li>
                        <RouterLink to="/inventory"
                            :class="[$route.name === 'Inventory' ? 'text-gray-900 bg-white-400 hover:text-gray-800 hover:bg-white-300 dark:text-gray-300 dark:bg-gray-600 dark:hover:text-gray-300 dark:hover:bg-gray-600' : 'text-gray-900 hover:text-gray-700 hover:bg-gray-300 dark:text-white dark:hover:text-gray-400 dark:hover:bg-gray-700', 'flex my-2 items-center p-2 rounded-lg group']"
                            @click="closeSidebar()" v-if="inventoryAccess.for_inventory === 1">
                            <span
                                :class="[$route.name === 'Inventory' ? 'text-gray-900 group-hover:text-gray-800 dark:text-gray-300 dark:group-hover:text-gray-300' : 'text-gray-900 group-hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-400 dark:group-hover:text-gray-400', 'material-icons w-5 h-5 transition duration-75']">
                                <MdInventory2 />
                            </span>
                            <span class="ms-3">Inventory</span>
                        </RouterLink>
                    </li>
                    <li>
                        <RouterLink to="/categories"
                            :class="[$route.name === 'Categories' ? 'text-gray-900 bg-white-400 hover:text-gray-800 hover:bg-white-300 dark:text-gray-300 dark:bg-gray-600 dark:hover:text-gray-300 dark:hover:bg-gray-600' : 'text-gray-900 hover:text-gray-700 hover:bg-gray-300 dark:text-white dark:hover:text-gray-400 dark:hover:bg-gray-700', 'flex my-2 items-center p-2 rounded-lg group']"
                            @click="closeSidebar()" v-if="inventoryAccess.for_categories === 1">
                            <span
                                :class="[$route.name === 'Categories' ? 'text-gray-900 group-hover:text-gray-800 dark:text-gray-300 dark:group-hover:text-gray-300' : 'text-gray-900 group-hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-400 dark:group-hover:text-gray-400', 'material-icons w-5 h-5 transition duration-75']">
                                <MdRoundCategory />
                            </span>
                            <span class="ms-3">Categories</span>
                        </RouterLink>
                    </li>
                    <li>
                        <RouterLink to="/borrowers"
                            :class="[$route.name === 'Borrowers' ? 'text-gray-900 bg-white-400 hover:text-gray-800 hover:bg-white-300 dark:text-gray-300 dark:bg-gray-600 dark:hover:text-gray-300 dark:hover:bg-gray-600' : 'text-gray-900 hover:text-gray-700 hover:bg-gray-300 dark:text-white dark:hover:text-gray-400 dark:hover:bg-gray-700', 'flex my-2 items-center p-2 rounded-lg group']"
                            @click="closeSidebar()" v-if="inventoryAccess.for_borrowers === 1">
                            <span
                                :class="[$route.name === 'Borrowers' ? 'text-gray-900 group-hover:text-gray-800 dark:text-gray-300 dark:group-hover:text-gray-300' : 'text-gray-900 group-hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-400 dark:group-hover:text-gray-400', 'material-icons w-5 h-5 transition duration-75']">
                                <FlFilledPeopleSwap />
                            </span>
                            <span class="ms-3">Borrowers</span>
                        </RouterLink>
                    </li>
                    <li>
                        <RouterLink to="/users"
                            :class="[$route.name === 'Users' ? 'text-gray-900 bg-white-400 hover:text-gray-800 hover:bg-white-300 dark:text-gray-300 dark:bg-gray-600 dark:hover:text-gray-300 dark:hover:bg-gray-600' : 'text-gray-900 hover:text-gray-700 hover:bg-gray-300 dark:text-white dark:hover:text-gray-400 dark:hover:bg-gray-700', 'flex my-2 items-center p-2 rounded-lg group']"
                            @click="closeSidebar()" v-if="inventoryAccess.for_users === 1">
                            <span
                                :class="[$route.name === 'Users' ? 'text-gray-900 group-hover:text-gray-800 dark:text-gray-300 dark:group-hover:text-gray-300' : 'text-gray-900 group-hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-400 dark:group-hover:text-gray-400', 'material-icons w-5 h-5 transition duration-75']">
                                <FaUserGear />
                            </span>
                            <span class="ms-3">Users</span>
                        </RouterLink>
                    </li>
                    <li>
                        <RouterLink to="/offices"
                            :class="[$route.name === 'Offices' ? 'text-gray-900 bg-white-400 hover:text-gray-800 hover:bg-white-300 dark:text-gray-300 dark:bg-gray-600 dark:hover:text-gray-300 dark:hover:bg-gray-600' : 'text-gray-900 hover:text-gray-700 hover:bg-gray-300 dark:text-white dark:hover:text-gray-400 dark:hover:bg-gray-700', 'flex my-2 items-center p-2 rounded-lg group']"
                            @click="closeSidebar()" v-if="inventoryAccess.for_offices === 1">
                            <span
                                :class="[$route.name === 'Offices' ? 'text-gray-900 group-hover:text-gray-800 dark:text-gray-300 dark:group-hover:text-gray-300' : 'text-gray-900 group-hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-400 dark:group-hover:text-gray-400', 'material-icons w-5 h-5 transition duration-75']">
                                <BxSolidBuildings />
                            </span>
                            <span class="ms-3">Offices</span>
                        </RouterLink>
                    </li>
                </ul>
            </div>
        </aside>


        <div class="min-h-screen max-h-full pt-16 p-4 lg:ml-64 dark:text-gray-200">
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