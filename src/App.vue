<script setup>
import Toast from "./components/Toasts/Toast.vue";
import useUserStore from "./stores/user.js";
import MainLoading from "./components/MainLoading.vue";

const userStore = useUserStore();
</script>

<template>
  <div>
    <MainLoading v-if="userStore.loading" />
    <RouterView v-else />
    <Toast />
  </div>
</template>
