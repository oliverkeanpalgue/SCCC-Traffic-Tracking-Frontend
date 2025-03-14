<script setup>
import emitter from "../eventBus";

const showSuccessToast = () => {
  emitter.emit("show-toast", { message: "Operation successful!", type: "success" });
};

const showErrorToast = () => {
  emitter.emit("show-toast", { message: "Something went wrong!", type: "error" });
};

const showWarningToast = () => {
  emitter.emit("show-toast", { message: "This is a warning!", type: "warning" });
};
</script>

<template>
  <div>
    <button @click="showSuccessToast" class="px-4 py-2 bg-green-500 text-white rounded">Success</button>
    <button @click="showErrorToast" class="px-4 py-2 bg-red-500 text-white rounded">Error</button>
    <button @click="showWarningToast" class="px-4 py-2 bg-yellow-500 text-white rounded">Warning</button>
  </div>
</template>
