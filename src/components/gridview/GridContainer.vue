<script setup>
import TableGrid from './TableGrid.vue';
import GridControls from './GridControls.vue';
import { useSpreadsheetStore } from '@/stores/spreadsheet';
import {ref} from 'vue'

//const activeTab = ref(blankSheetId);
const spreadsheetStore = useSpreadsheetStore(); 

const onLaunch = async () => {
  await spreadsheetStore.setMaxSheetId();
}

await onLaunch();

//const activeTab = ref(spreadsheetStore.maxSheetId);
</script>

<template>

<div class="row">
    <div class="col">
        <GridControls></GridControls>
    </div>
</div>
<div class="row">
    <div class="col">
        <ul class="nav nav-tabs">
            <li v-for="sheet in spreadsheetStore.sheets"><input type="button" :value="sheet.id" :class="{'active': activeTab === sheet.id}" class="nav-link" @click="() => spreadsheetStore.setActiveSheetId(sheet.id)"></li>
            
        </ul>
        <div class="tab-content">
            <template v-for="sheet in spreadsheetStore.sheets">
                <TableGrid v-if="spreadsheetStore.activeSheetId === sheet.id"  class="tab-pane active"  :rows="10" :cols="10" :tableId="sheet.id"></TableGrid>
            </template>
        </div>
    </div>
</div>

</template>

<style scoped>
.tab-content {
  overflow: scroll;
}
</style>