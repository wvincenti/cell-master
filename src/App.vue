<script setup>
import { useSpreadsheetStore } from '@/stores/spreadsheet'; // '@' starts at /src
import { useDbStore } from './stores/dbview';
import { onMounted } from 'vue';

import GridContainer from './components/gridview/GridContainer.vue';
import CellTablesContainer from './components/celltables/CellTablesContainer.vue';
import ViewContainer from './components/tableviews/ViewContainer.vue';

const rows = [];
const cols = [];
const tWidht = 10;

for (let i = 0; i < tWidht; i++) {
  rows[i] = i
  for (let j = 0; j < tWidht; j++) {
    cols[j] = j;
  }
}



</script>

<template>
  <div class="text-center display-6 bg-dark text-light">CELL MASTER</div>
  <div class="container-fluid">
    <div class="row">
      <div id="grid-view-container" class="col">
        <Suspense>
          <GridContainer></GridContainer>
        </Suspense>
      </div>
    </div>
    <div class="row px-0">
      <div class="col-6">
        <CellTablesContainer></CellTablesContainer>
      </div>
      <div class="col-6">
        <ViewContainer></ViewContainer>
      </div>

    </div>
  </div>

</template>


<style scoped></style>