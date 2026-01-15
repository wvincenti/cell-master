<script setup>
import TableGrid from './TableGrid.vue';
import GridControls from './GridControls.vue';
import { useSpreadsheetStore } from '@/stores/spreadsheet';
import { onMounted, ref } from 'vue'

//const activeTab = ref(blankSheetId);
const spreadsheetStore = useSpreadsheetStore();

const onLaunch = () => {
    spreadsheetStore.setMaxSheetId();
    

}

await onLaunch();

// const addView = () => {
//     spreadsheetStore.views.push([]);
//     spreadsheetStore.setActiveView(spreadsheetStore.views.length - 1);
// }

onMounted(() => {
    
    //const sheet = spreadsheetStore.sheets['1'];
   // spreadsheetStore.loadToView( sheet, 0);
    
})

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
                <li class="nav-item" v-for="(sheet, idx) in spreadsheetStore.views"><input type="button"
                        :value="'View ' + idx" :class="{ 'active': activeTab === idx }" class="nav-link"
                        @click="() => spreadsheetStore.setActiveView(idx)"></li>
                <li><i @click="() => addView()" class="bi bi-plus-circle-fill nav-link fs-5"></i></li>
            </ul>
            <div class="tab-content">
                <div class="tab-pane fade" v-for="(sheet, idx) in spreadsheetStore.views"
                    :class="{ 'show active': spreadsheetStore.activeView === idx }">
                    <TableGrid v-if="spreadsheetStore.activeView === idx" :rows="10" :cols="10" :tableId="sheet.id" :view="spreadsheetStore.getView(idx)" >
                    </TableGrid>
                </div>
            </div>
        </div>
    </div>

</template>

<style scoped>
.tab-content {
    overflow: scroll;
}
</style>