<script setup>
import { onMounted, ref, computed, onBeforeUpdate, onBeforeMount, onUpdated } from 'vue';
import { useSpreadsheetStore } from '@/stores/spreadsheet';

import ToolbarWrapper from './ToolbarWrapper.vue';
import TabWrapper from './TabWrapper.vue';


const props = {
    containerHeight: { type: Number }
}



console.log('GRID HEIGHT: ' + props.containerHeight);

//const activeTab = ref(blankSheetId);
const spreadsheetStore = useSpreadsheetStore();

const viewportRef = ref(null);

// const addView = async () => {

//     spreadsheetStore.views.push([]);
//     console.log(spreadsheetStore.views);

//     const newViewIdx = spreadsheetStore.views.length - 1;

//     let newSheetId = spreadsheetStore.latestSheetId || await spreadsheetStore.latestSheetId;
//     newSheetId++;

//     spreadsheetStore.latestSheetId = newSheetId;

//     let sheetIdx = spreadsheetStore.addSheetToView(newSheetId, newViewIdx);

//     //const latestViewIdx = spreadsheetStore.views.length;

//     const range = spreadsheetStore.addRangeToViewSheet(newViewIdx, sheetIdx);

//     console.log(range);

//     spreadsheetStore.viewRows.push(0);
//     spreadsheetStore.setActiveSheetId(newSheetId);
//     spreadsheetStore.setActiveView(newViewIdx);
// }


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

const height = ref(null);

function setHeight() {
    const tabList = document.querySelector(".p-tablist");
    const tabContainer = document.querySelector(".mytab-container");
    console.log(tabList);
    console.log(tabContainer.offsetHeight)

    setTimeout(() => {
        height.value = tabContainer.offsetHeight - tabList.offsetHeight;
    }, 150);

    

    console.log(height.value);
    

    

}

onMounted(() => {
    setHeight();
})

</script>

<template>
    <div ref="viewportRef" id="grid-view-container" class="container-fluid h-100">
        <div ref="containerRow" class="row h-100">
            <div class="col px-0 mytab-container">
                <TabWrapper :pt="{class: 'p-0'}" :tableHeight="height" :activeTab="activeTab" :sheetCount="sheetCount" :tableData="tableData" @tab-select="(idx) => spreadsheetStore.setActiveTab(idx)" ></TabWrapper>
            </div>
        </div>
    </div>
</template>

<style scoped>
.p-tabs {
    display: flex;
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