<!-- components/Modal.vue -->
<script setup>
import { ref, onMounted, onUnmounted, defineEmits, defineProps } from 'vue'

const props = defineProps({
  modelValue: Boolean, // v-model binding for modal open state
})

const emit = defineEmits(['update:modelValue'])

const modalContainer = ref(null)
const trigger = ref(null)

const closeModal = () => {
  emit('update:modelValue', false) // Update parent component state
}

const handleClickOutside = (event) => {
  if (
    modalContainer.value &&
    !modalContainer.value.contains(event.target) &&
    event.target !== trigger.value
  ) {
    closeModal()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div
    v-if="modelValue"
    class="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-dark/90 px-4 py-5"
  >
    <div
      ref="modalContainer"
      class="w-full max-w-[570px] rounded-[20px] bg-white px-8 py-12 text-center dark:bg-dark-2 md:px-[70px] md:py-[60px] border dark:bg-gray-700 "
    >
      <h3 class="pb-[18px] text-xl font-semibold text-dark dark:text-white sm:text-2xl">
        Your Message Sent Successfully
      </h3>
      <span class="mx-auto mb-6 inline-block h-1 w-[90px] rounded bg-primary"></span>
      <p class="mb-10 text-base leading-relaxed text-body-color dark:text-dark-6">
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
        been the industry's standard dummy text ever since.
      </p>
      <div class="-mx-3 flex flex-wrap">
        <div class="w-1/2 px-3">
          <button
            @click="closeModal"
            class="block w-full rounded-md border border-stroke p-3 text-center text-base font-medium text-dark transition hover:border-red-600 hover:bg-red-600 hover:text-white dark:text-white"
          >
            Cancel
          </button>
        </div>
        <div class="w-1/2 px-3">
          <button
            class="block w-full rounded-md border border-primary bg-primary p-3 text-center text-base font-medium text-white transition hover:bg-blue-dark"
          >
            <a href="/">View Details</a>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
