<script setup>
import Toast from "./components/Toasts/Toast.vue";
import useUserStore from "./stores/user.js";
import Loading from "./components/Loading.vue";

const userStore = useUserStore();
</script>

<template>
  <div>
    <Loading v-if="userStore.loading" />
    <RouterView v-else />
    <Toast />
  </div>
</template>
