<script setup>
import { defineProps } from 'vue'
import QRCode from 'qrcode.vue'

const props = defineProps({
  qrCodes: {
    type: Array,
    required: true
  },
  onPrint: {
    type: Function,
    required: true
  },
  onClose: {
    type: Function,
    required: true
  }
})
</script>

<template>
  <div class="flex flex-col items-center mt-8">
    <p class="text-3xl mb-8 text-center mt-8">Generated QR Codes</p>
    <div class="grid grid-cols-3 gap-4 w-full">
      <div v-for="(qrData, index) in qrCodes" :key="index" class="border p-4 rounded-lg dark:bg-gray-900">
        <QRCode :value="JSON.stringify(qrData)" :size="250" level="I" class="m-auto border-8" />
        <div class="mt-2 text-lg">
    <p class="font-bold">SCCC - MITD Inventory</p>
    <p v-if="qrData.type === 'supply'">
      {{ qrData.name }} (Qty: {{ qrData.quantity }})
    </p>
    <p v-else>
      {{ `${qrData.name} #${qrData.copyNumber}` }}
    </p>
    <p v-if="qrData.serialNumber" class="text-gray-600 text-lg">
      SN: {{ qrData.serialNumber }}
    </p>
  </div>
      </div>
    </div>
    <div class="mt-4 flex gap-2 justify-center">
      <button @click="onPrint" class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
        Print QR Codes
      </button>
      <button @click="onClose" class="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
        Close
      </button>
    </div>
  </div>
</template>