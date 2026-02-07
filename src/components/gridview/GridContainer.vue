<script setup>
import TableGrid from './TableGrid.vue';
import GridControls from './GridControls.vue';
import { useSpreadsheetStore } from '@/stores/spreadsheet';
import { onMounted, ref } from 'vue';


//const activeTab = ref(blankSheetId);
const spreadsheetStore = useSpreadsheetStore();

const onLaunch = async () => {
    // const maxSheetId = spreadsheetStore.setMaxSheetId();
    // spreadsheetStore.views.push([]);
    // console.log(maxSheetId);
    // spreadsheetStore.addSheetToView();

    // ** SET UP NEWEST SHEET ID 
    const latestSheetId = await spreadsheetStore.fetchLatestSheetId();
    console.log(latestSheetId);

    spreadsheetStore.latestSheetId = latestSheetId + 1;
    console.log(spreadsheetStore.latestSheetId);


}

await onLaunch();

const addView = async () => {

    spreadsheetStore.views.push([]);
    console.log(spreadsheetStore.views);

    const newViewIdx = spreadsheetStore.views.length - 1;

    let newSheetId = spreadsheetStore.latestSheetId || await spreadsheetStore.latestSheetId;
    newSheetId++;

    spreadsheetStore.latestSheetId = newSheetId

    let sheetIdx = spreadsheetStore.addSheetToView(newSheetId, newViewIdx);


    //const latestViewIdx = spreadsheetStore.views.length;

    const range = spreadsheetStore.addRangeToViewSheet(newViewIdx, sheetIdx);

    console.log(range);

    spreadsheetStore.viewRows.push(0);
    spreadsheetStore.setActiveSheetId(newSheetId);
    spreadsheetStore.setActiveView(newViewIdx);

}

onMounted(() => {
    // spreadsheetStore.setActiveView(spreadsheetStore.views.length - 1);
    //const sheet = spreadsheetStore.sheets['1'];
    // spreadsheetStore.loadToView( sheet, 0);
    addView()
})

const plusButtonHoverd = ref(false);

</script>

<template>
    <div class="row h-100">
        <div class="col px-0 h-100">
            <nav>
                <div class="nav nav-tabs" role="tablist">
                    <button class="nav-link border-0">
                        <i @mouseenter="plusButtonHoverd = true" @mouseleave="plusButtonHoverd = false"
                            @click="() => addView()" class="bi bi-plus-circle-fill fs-5"
                            :class="{ 'text-success': plusButtonHoverd == true }"></i>
                    </button>
                    <button class="nav-link" v-for="(sheet, idx) in spreadsheetStore.views"
                        :class="{ 'active': spreadsheetStore.activeView === idx }"
                        @click="() => spreadsheetStore.setActiveView(idx)">{{ 'View ' + idx }}
                    </button>
                </div>
            </nav>
            <div class="tab-content h-100">
                <div class="tab-pane h-100" v-for="(sheet, idx) in spreadsheetStore.views"
                    :class="{ 'show active': spreadsheetStore.activeView === idx }">
                    <TableGrid v-if="spreadsheetStore.activeView == idx" :rows="10" :cols="26" :tableId="sheet.id"
                        :viewIdx="idx">
                    </TableGrid>
                </div>
            </div>
        </div>
    </div>
    <div class="row border bg-secondary align-items-center" style="height: 20px; z-index: 100;">
        <div class="col-1">
            <i class="bi bi-floppy2-fill align-middle text-white z-3" @click="spreadsheetStore.flushSheet()"></i>
        </div>
        <div class="col-1">
            <input type="range" step="10" class="form-range align-middle" id="rangeInput" min="0" max="100" value="50">
        </div>
    </div>
</template>

<style scoped>
/*
.tab-content {
    overflow: scroll;
    max-height: 100%;
}
    */
</style>