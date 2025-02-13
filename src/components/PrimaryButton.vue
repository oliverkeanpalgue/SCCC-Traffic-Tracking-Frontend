<script setup>
import { ref } from 'vue';
import { useThemeStore } from '../stores/themeStore';

defineProps({
    class_prop: String,
    name_prop: String,
    type_prop: String
})

const props = ref({
    class_prop: 'null',
    name_prop: 'null',
    type_prop: 'null'
})

const themeStore = useThemeStore();

</script>

<template>
    <button :type="type_prop" :name="name_prop" :class="class_prop" class="rounded-md bg-indigo-600 text-white px-3 py-2 text-sm font-semibold shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">{{ name_prop }}</button>
</template>