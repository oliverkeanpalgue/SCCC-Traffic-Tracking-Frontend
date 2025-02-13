<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  header: {
    type: String,
    default: 'Modal'
  },
  width: {
    type: String,
    default: '25rem'
  }
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

const closeModal = () => {
  emit('update:modelValue', false);
  emit('cancel');
};

const confirmModal = () => {
  emit('update:modelValue', false);
  emit('confirm');
};
</script>

<template>
  <Dialog 
    v-bind="modelValue"
    modal 
    :header="header" 
    :style="{ width: width }"
    v-on="modelValue"
  >
    <slot name="content">
      <span class="text-surface-500 dark:text-surface-400 block mb-8">
        Default modal content
      </span>
    </slot>

    <template #footer>
      <slot name="footer">
        <div class="flex justify-end gap-2">
          <Button 
            type="button" 
            label="Cancel" 
            severity="secondary" 
            @click="closeModal"
          ></Button>
          <Button 
            type="button" 
            label="Confirm" 
            @click="confirmModal"
          ></Button>
        </div>
      </slot>
    </template>
  </Dialog>
</template>

<style scoped>
/* Add any specific modal styles here */
</style>