<script setup>
import { FlCheckboxChecked, FlCheckboxUnchecked } from "@kalimahapps/vue-icons";

defineProps({
    invAccess: Object,
    userId: Number,
    type: String,
    onToggle: Function,
    user: Object,
});
</script>

<template>
  <label
    class="flex w-full justify-center cursor-pointer select-none text-dark dark:text-white"
    v-if="invAccess?.user_id === userId"
  >
    <div class="relative">
      <input
        type="checkbox"
        class="sr-only"
        :checked="invAccess[type] === 1"
        @change="onToggle(user, invAccess.id, type)"
      />
      <span v-if="invAccess[type] === 1">
        <FlCheckboxChecked class="h-6 w-6 text-green-600" />
      </span>
      <span v-else>
        <FlCheckboxUnchecked class="h-6 w-6 text-red-500" />
      </span>
    </div>
  </label>
</template>
