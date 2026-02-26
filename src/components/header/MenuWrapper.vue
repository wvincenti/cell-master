<script setup>
import { ref } from 'vue';
import { Menubar } from 'primevue';

const menu = ref([
  {
    label: 'CM',
  },
  {
    label: 'Home',
    icon: 'pi pi-home'
  }
])

</script>

<template>

    <Menubar :model="menu" :pt="{ root: { class: 'rounded-0 border-0' } }"></Menubar>

</template>