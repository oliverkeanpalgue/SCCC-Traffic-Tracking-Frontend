<script setup>
import { defineProps, onMounted, ref } from 'vue'
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

// Modified print handler to use new window
const handlePrint = () => {
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>SCCC - MITD Inventory QR Codes</title>
        <style>
          .qr-container {
            display: inline-block;
            margin: 10px;
            padding: 15px;
            border: 1px solid #ccc;
            text-align: center;
            page-break-inside: avoid;
            width: 25%;
          }
          .qr-details {
            margin-top: 10px;
            font-size: 12px;
          }
          #qr-codes {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
          }
          img {
            width: 180px;
            height: 180px;
          }
          @media print {
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div id="qr-codes">
          ${props.qrCodes.map((qrData, index) => `
            <div class="qr-container">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify(qrData))}" />
              <div class="qr-details">
                <p style="font-size: 16px; font-weight: bold;">SCCC - MITD Inventory</p>
                ${qrData.type === 'supply'
      ? `<p>${qrData.name} (Qty: ${qrData.quantity})</p>`
      : `<p>${qrData.name} #${qrData.copyNumber}</p>`
    }
                ${qrData.serialNumber ? `<p class="serial-number">SN: ${qrData.serialNumber}</p>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.onload = function () {
    printWindow.focus();
    printWindow.print();
    setTimeout(() => {
      printWindow.close();
    }, 1000);
  };
}

</script>

<template>
  <div class="flex flex-col items-center mt-2">
    <p class="text-3xl mb-8 text-start">Generated QR Codes</p>

    <!-- Preview section -->
    <div class="w-full p-4 pl-2 rounded-xl dark:bg-gray-800">
      <div class="grid grid-cols-3 gap-4 p-2 w-full max-h-[60vh] overflow-auto">
        <div v-for="(qrData, index) in qrCodes" :key="index" class="border p-4 rounded-lg dark:bg-gray-950">
          <QRCode :value="JSON.stringify(qrData)" :size="250" level="M" class="m-auto border-8" render-as="svg" />
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
    </div>

    <!-- Control buttons -->
    <div class="mt-4 flex gap-2 justify-center ">
      <button @click="handlePrint" class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
        Print QR Codes
      </button>
      <button @click="onClose" class="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
        Close
      </button>
    </div>
  </div>
</template>