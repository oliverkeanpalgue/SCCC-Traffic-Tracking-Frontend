<script setup>
import LoadingAnimation from '../assets/baguio-logo.png';
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen bg-black">
    <img class="w-80 h-80 animate-pulse" :src="LoadingAnimation" alt="Loading..." />
    
    <div class="animated-text mt-6">Smart City Command Center</div>
    <div class="animated-text">Inventory System</div>
  </div>
</template>

<style scoped>
.animated-text {
  color: white;
  font-weight: bold;
  font-size: 1.875rem; /* text-3xl */
  animation: fadeInUp 1s ease-out forwards;
  opacity: 0;
}

.animated-text:nth-child(2) {
  animation-delay: 0.5s;
}

.animated-text:nth-child(3) {
  animation-delay: 1s;
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
