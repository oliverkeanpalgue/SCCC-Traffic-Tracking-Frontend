<script setup>
import { ref, onMounted, onUnmounted, defineEmits, defineProps } from "vue";
import { MdDeleteForever } from "@kalimahapps/vue-icons";
import axiosClient from "../../../axios";

const API_KEY = import.meta.env.VITE_API_KEY;

const isLoading = ref(false);

const props = defineProps({
  modelValue: Boolean, // v-model binding for modal open state
  transactionName: String, // Pass the transaction name
  transaction: Object,
});


const emit = defineEmits(["update:modelValue", "confirmDelete"]);

const modalContainer = ref(null);

const closeModal = () => {
  emit("update:modelValue", false); // Notify parent to close modal
};

const confirmUpdate = async () => {
  console.log("confirm Update");
};

const handleClickOutside = (event) => {
  if (modalContainer.value && !modalContainer.value.contains(event.target)) {
    closeModal();
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div
    v-if="modelValue"
    class="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-dark/90 px-4 py-5"
  >
    <div
      ref="modalContainer"
      class="w-full max-w-[570px] rounded-[20px] bg-white px-8 py-8 text-center dark:bg-dark-2 border dark:bg-gray-700"
    >
      <h3 class="text-3xl mb-5 mt-1 font-semibold text-dark dark:text-white">
        Update Transaction
      </h3>
      <p class="text-base mb-2 leading-relaxed text-body-color dark:text-dark-6">
        Are you sure you want to delete this Transaction?
      </p>
      <div class="grid grid-cols-2 mb-5 text-md pl-25 pr-15">
        <div class="grid-cols-1 text-start mr-2 font-bold">
          <p>Borrower:</p>
          <p>Borrow Date:</p>
          <p>Lender:</p>
        </div>
        <div class="grid-cols-1 text-start">
          <p>{{ transaction.borrowers?.borrowers_name }}</p>
          <p>{{ transaction.borrow_date }}</p>
          <p>{{ transaction.lenderName }}</p>
        </div>
      </div>
      <div class="-mx-3 flex flex-wrap">
        <div class="w-1/2 px-3">
          <button
            @click="closeModal"
            class="block w-full rounded-md border border-stroke p-3 text-center text-base font-medium text-dark transition bg-gray-200 hover:border-red-800 hover:bg-red-800 hover:text-white dark:text-black"
          >
            No, Cancel.
          </button>
        </div>
        <div class="w-1/2 px-3">
          <button
            @click="confirmUpdate"
            class="block w-full rounded-md border bg-primary p-3 text-center text-base font-medium text-white transition bg-green-700 hover:border-green-600 hover:bg-green-600 hover:text-white dark:text-white"
          >
            Yes, Update!
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
