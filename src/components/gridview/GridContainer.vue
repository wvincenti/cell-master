<script setup>
import { onMounted, ref, computed, onBeforeUpdate, onBeforeMount } from 'vue';
import { useSpreadsheetStore } from '@/stores/spreadsheet';

import TabWrapper from './TabWrapper.vue';
import { useElementSize } from '@vueuse/core';


const props = {
    containerHeight: { type: Number, isTableResize: Boolean }
}

console.log('GRID HEIGHT: ' + props.containerHeight);

//const activeTab = ref(blankSheetId);
const spreadsheetStore = useSpreadsheetStore();

const viewportRef = ref(null);


const updateWidth = () => {
    if (viewportRef.value) {
        console.log(viewportRef.value.offsetWidth)
        containerWidth.value = viewportRef.value.offsetWidth;
    }
};


onBeforeMount(() => {
    spreadsheetStore.addEmptySheet();
})

onBeforeUpdate(() => {
    console.log('UPDATING GRID CONTAINER')
})

const activeTab = computed(() => spreadsheetStore.activeTab);
const sheetCount = computed(() => spreadsheetStore.tableCount);
const tableData = computed(() => spreadsheetStore.cellTables[activeTab.value]);

const tabContainerRef = ref(null);

const { height } = useElementSize(tabContainerRef)

</script>

<template>
    <div ref="tabContainerRef" id="grid-view-container" class="container-fluid h-100">
        <div class="row h-100">
            <div  class="col px-0 mytab-container bg-black" style="min-height: 0 !important; overflow: hidden !important;">
                <TabWrapper :contHeight="height" :activeTab="activeTab" :sheetCount="sheetCount"
                    :tableData="tableData" @tab-select="(idx) => spreadsheetStore.setActiveTab(idx)"></TabWrapper>
            </div>
        </div>
    </div>
</template>

<style scoped>
.p-tabs {
    display: flex;
}

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