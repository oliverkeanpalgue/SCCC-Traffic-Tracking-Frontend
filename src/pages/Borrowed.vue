<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const officeDropDownFilter = ref(false)
const officeDropDownButtonRef = ref(null)
const officeDropDownMenuRef = ref(null) // Reference to officeDropDown menu

const officeDropDownItems = ref([
   { id: 1, type: 'Office Supplies', isActive: true },
   { id: 2, type: 'Office Equipments', isActive: true },
])

const toggleofficeDropDown = () => {
   officeDropDownFilter.value = !officeDropDownFilter.value
}

// Function to handle checkbox toggle
const handleCheckboxChange = (id, event) => {
   event.stopPropagation() // Prevent event from closing the officeDropDown
   const item = officeDropDownItems.value.find((item) => item.id === id)
   if (item) {
      item.isActive = !item.isActive
   }
}

// Custom function to handle click outside
const handleClickOutside = (event) => {
   if (
      officeDropDownButtonRef.value &&
      !officeDropDownButtonRef.value.contains(event.target) &&
      officeDropDownMenuRef.value &&
      !officeDropDownMenuRef.value.contains(event.target)
   ) {
      officeDropDownFilter.value = false
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
   <!-- ====== officeDropDowns Section Start -->
   <section class="pt-20 pb-10 lg:pt-[120px] lg:pb-20 dark:bg-dark">
      <div class="container">
         <div class="flex flex-wrap -mx-4">
            <!-- one -->
            <div ref="domNode" class="w-full px-4 sm:w-1/2 lg:w-1/4">
               <div class="py-8 text-center">
                  <div class="relative inline-block mb-8 text-left">
                     <button @click="toggleofficeDropDown" ref="officeDropDownButtonRef"
                        class="flex items-center rounded-[5px] px-5 py-[13px] bg-dark dark:bg-dark-2 text-base font-medium text-white">
                        Filter
                        <span class="pl-4">
                           <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                              xmlns="http://www.w3.org/2000/svg" class="fill-current">
                              <path
                                 d="M10 14.25C9.8125 14.25 9.65625 14.1875 9.5 14.0625L2.3125 7C2.03125 6.71875 2.03125 6.28125 2.3125 6C2.59375 5.71875 3.03125 5.71875 3.3125 6L10 12.5312L16.6875 5.9375C16.9688 5.65625 17.4063 5.65625 17.6875 5.9375C17.9687 6.21875 17.9687 6.65625 17.6875 6.9375L10.5 14C10.3437 14.1563 10.1875 14.25 10 14.25Z" />
                           </svg>
                        </span>
                     </button>
                     <div v-show="officeDropDownFilter" ref="officeDropDownMenuRef"
                        class="shadow-1 dark:shadow-box-dark absolute left-0 z-40 mt-2 w-full rounded-md bg-dark dark:bg-dark-2 py-[10px] transition-all"
                        :class="{
                           'top-full opacity-100 visible': officeDropDownFilter,
                           'top-[110%] invisible opacity-0': !officeDropDownFilter
                        }">
                        <label class="flex items-center cursor-pointer select-none text-dark dark:text-white"
                           v-for="item in officeDropDownItems" :key="item.id">
                           <div class="relative">
                              <input 
                                 type="checkbox" 
                                 class="sr-only" 
                                 :checked="item.isActive" 
                                 @change="handleCheckboxChange(item.id, $event)" 
                              />
                              <div
                                 class="box mr-4 flex h-5 w-5 items-center justify-center rounded border border-stroke dark:border-dark-3">
                                 <span :class="{ 'opacity-100': item.isActive, 'opacity-0': !item.isActive }">
                                    <svg width="11" height="8" viewBox="0 0 11 8" fill="none"
                                       xmlns="http://www.w3.org/2000/svg">
                                       <path
                                          d="M10.0915 0.951972L10.0867 0.946075L10.0813 0.940568C9.90076 0.753564 9.61034 0.753146 9.42927 0.939309L4.16201 6.22962L1.58507 3.63469C1.40401 3.44841 1.11351 3.44879 0.932892 3.63584C0.755703 3.81933 0.755703 4.10875 0.932892 4.29224L0.932878 4.29225L0.934851 4.29424L3.58046 6.95832C3.73676 7.11955 3.94983 7.2 4.1473 7.2C4.36196 7.2 4.55963 7.11773 4.71406 6.9584L10.0468 1.60234C10.2436 1.4199 10.2421 1.1339 10.0915 0.951972ZM4.2327 6.30081L4.2317 6.2998C4.23206 6.30015 4.23237 6.30049 4.23269 6.30082L4.2327 6.30081Z"
                                          fill="#3056D3" stroke="#3056D3" strokeWidth="0.4"></path>
                                    </svg>
                                 </span>
                              </div>
                           </div>
                           {{ item.type }}
                        </label>
                     </div>
                  </div>
               </div>
            </div>
            <!-- End -->
         </div>
      </div>
   </section>
   <!-- ====== officeDropDowns Section End -->
</template>
