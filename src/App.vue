<script setup>
import { useSpreadsheetStore } from '@/stores/spreadsheet'; // '@' starts at /src
import { useDbStore } from './stores/dbview';
import { onMounted } from 'vue';
import DbView from './components/celltables/DbView.vue';
import GridContainer from './components/gridview/GridContainer.vue';
import CellTablesContainer from './components/celltables/CellTablesContainer.vue';

const spreadsheetStore = useSpreadsheetStore();
const dbStore = useDbStore();

// Now you can use store.fetchCells() or store.cells
onMounted(async () => {
  try {
    // const cells = await spreadsheetStore.fetchCells()
    // console.log(cells)
    await dbStore.fetchDb();
  } catch (error) {
    console.error(error)
  }
})

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
  <div class="container-fluid bg-dark h-100">
    <div class="row">
      <div id="grid-view-container"  class="col">
        <Suspense>
         <GridContainer></GridContainer>
        </Suspense>
      </div>
    </div>
    <div class="row">
      <CellTablesContainer></CellTablesContainer>
    </div>

  </div>
 
</template>


<style scoped>


</style>