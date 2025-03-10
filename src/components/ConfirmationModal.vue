<script setup>
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  title: String,
  message: String,
  cancelText: { type: String, default: "Cancel" },
  confirmText: { type: String, default: "Confirm" },
  modelValue: Boolean, // Controls visibility
})

const emit = defineEmits(["update:modelValue", "confirm"])

const closeModal = () => {
  emit("update:modelValue", false) // Close modal
}

const confirmAction = () => {
  emit("confirm", 1) // Return 1 when confirmed
  closeModal()
}
</script>

<template>
  <div v-if="modelValue" class="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black/55">
    <div class="w-full max-w-[600px] rounded-3xl p-8 text-center border-4 dark:bg-gray-950">
      <h3 class="mb-6 text-3xl">
        {{ title }}
      </h3>
      <p class="text-center mb-6">
        {{ message }}
      </p>
      <div class="-mx-3 flex flex-wrap">
        <div class="w-1/2 px-3">
          <button @click="closeModal"
            class="block w-full rounded-md border border-stroke p-3 text-center text-base font-medium text-dark transition hover:border-red-600 hover:bg-red-600 hover:text-white dark:text-white">
            {{ cancelText }}
          </button>
        </div>
        <div class="w-1/2 px-3">
          <button @click="confirmAction"
            class="block w-full rounded-md border bg-primary p-3 text-center text-base font-medium text-white transition hover:bg-blue-dark">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
