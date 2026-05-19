<script setup>
import { onMounted, ref, computed, onBeforeUpdate, onBeforeMount } from 'vue';
import { useSpreadsheetStore } from '@/stores/spreadsheet';
import TabWrapper from './TabWrapper.vue';
import { useElementSize } from '@vueuse/core';
import { storeToRefs } from 'pinia';

const props = {
    containerHeight: { type: Number, isTableResize: Boolean }
}

const spreadsheetStore = useSpreadsheetStore();

console.log('GRID HEIGHT: ' + props.containerHeight);

const activeTab = computed(() => spreadsheetStore.activeTab);

// const sheetNames = computed(() => {
//     return Array.from(spreadsheetStore.sheets.values(), (sheet) => sheet.name);
// });
const { activeSheetNames } = storeToRefs(spreadsheetStore);

const { activeTable } = storeToRefs(spreadsheetStore);


console.log('TABLE DATA ***')

const tabContainerRef = ref(null);

const { height } = useElementSize(tabContainerRef);

onBeforeMount(async () => {
    // await spreadsheetStore.fetchLatestSheetId();
    console.log('**** sheets ***');
    console.log(spreadsheetStore.sheets)
    if (spreadsheetStore.activeTableOrderedIds == 0) {

        spreadsheetStore.addNewSheet(true);

    }
});

onBeforeUpdate(() => {
    console.log('UPDATING GRID CONTAINER');
});

function onCellEdited(newValue, row, col, activeTab) {
    spreadsheetStore.updateCell(newValue, row, col, activeTab);
}

function onTabSelect(idx) {
    spreadsheetStore.setActiveTab(idx);
}

</script>

<template>
    <div ref="tabContainerRef" id="grid-view-container" class="container-fluid h-100">
        <div class="row h-100">
            <div class="col px-0 mytab-container bg-black"
                style="min-height: 0 !important; overflow: hidden !important;">
                <TabWrapper @cell-edited="onCellEdited" @tab-select="onTabSelect" :contHeight="height"
                    :activeTab="activeTab" :sheetNames="activeSheetNames" :tableData="activeTable">
                </TabWrapper>
            </div>
        </div>
    </div>
</template>

<style scoped>
/*
.p-tabs {
    display: flex;
}
    */

#grid-view-container {
    min-height: 0 !important;

}


/*
.tab-content {
    overflow: scroll;
    max-height: 100%;
}
    */


/* <div v-for="(view, idx) in spreadsheetStore.views" class="tab-pane h-100" :class="{'show active': spreadsheetStore.activeView == idx }">
                        <TableGrid :key="idx" :viewIdx="idx"></TableGrid>
                    </div> */
</style>