<template>
  <div class="h-100 d-flex flex-column bg-secondary">
    <HeaderContainer></HeaderContainer>
    <RouterView />

    <footer ref="footerRef" class="text-center align-middle bg-dark text-light"
      style="font-size: xx-small; height: 1rem;">
      by wvvincenti
    </footer>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router';
import { useSpreadsheetStore } from './stores/spreadsheet';
import HeaderContainer from './components/header/HeaderContainer.vue';
import { provide } from 'vue';

const spreadsheetStore = useSpreadsheetStore();

provide('deleteSheet', spreadsheetStore.deleteSheetFromDB);

</script>


<style scoped>
.splitpanes--horizontal,
.splitpanes--vertical {
  display: flex;
  width: 100% !important;
  height: 100% !important;
}

/* Ensure the pane content doesn't overflow hiddenly */
.splitpanes__pane {
  display: flex;
  flex-direction: column;
  /* This helps children like .container-fluid fill the height */
}

.main-layout {
  flex-grow: 1;
  height: 100% !important;
  /* Forces the flexbox to calculate the height based on available space */

}

.pane-wrapper {
  height: calc(100vh - 3rem);
}
</style>