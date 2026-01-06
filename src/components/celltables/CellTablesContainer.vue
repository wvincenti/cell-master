<script setup>
import DbView from './DbView.vue';
import { useDbStore } from '@/stores/dbview';
import { onMounted } from 'vue';

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

</script>

<template>

<div class="col-6">
    <div class="h3">CELL TABLES</div>
    <div class="row">
        <DbView :tables="dbStore.tables"></DbView>
    </div>
</div>
</template>