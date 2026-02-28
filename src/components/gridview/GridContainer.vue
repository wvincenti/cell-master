<script setup>
import { onMounted, ref, computed, onBeforeUpdate, onBeforeMount } from 'vue';
import { useSpreadsheetStore } from '@/stores/spreadsheet';
import TabWrapper from './TabWrapper.vue';
import { useElementSize } from '@vueuse/core';

const props = {
    containerHeight: { type: Number, isTableResize: Boolean }
}

const spreadsheetStore = useSpreadsheetStore();


console.log('GRID HEIGHT: ' + props.containerHeight);

const activeTab = computed(() => spreadsheetStore.activeTab);
const sheetCount = computed(() => spreadsheetStore.cellTables.length);
const tableData = computed(() => spreadsheetStore.cellTables[activeTab.value]);


const tabContainerRef = ref(null);

const { height } = useElementSize(tabContainerRef);

onBeforeMount( async () => {
    await spreadsheetStore.fetchLatestSheetId();
    spreadsheetStore.addEmptySheet();
});

onBeforeUpdate(() => {
    console.log('UPDATING GRID CONTAINER')
});


function onCellEdited(newValue, row, col, activeTab) {
    spreadsheetStore.updateCell(newValue, row, col, activeTab);
}

function onTabSelect(idx){
    spreadsheetStore.setActiveTab(idx)
}





</script>

<template>
    <div ref="tabContainerRef" id="grid-view-container" class="container-fluid h-100">
        <div class="row h-100">
            <div  class="col px-0 mytab-container bg-black" style="min-height: 0 !important; overflow: hidden !important;">
                <TabWrapper
                    @cell-edited="onCellEdited"
                    @tabSelect="onTabSelect"
                    :contHeight="height" 
                    :activeTab="activeTab" 
                    :sheetCount="sheetCount"
                    :tableData="tableData">
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