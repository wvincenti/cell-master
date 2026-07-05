<script setup>
import { onMounted, ref, computed, onBeforeUpdate, onBeforeMount, onBeforeUnmount, nextTick, watch } from 'vue';
import { useSpreadsheetStore } from '@/stores/spreadsheet';
import TabWrapper from './TabWrapper.vue';
import { storeToRefs } from 'pinia';

const spreadsheetStore = useSpreadsheetStore();

// const emit = defineEmits(['table-resized'])



const { activeSheetNames, activeTable, activeTab } = storeToRefs(spreadsheetStore);


console.log('TABLE DATA ***')

const tabContainerRef = ref(null);
const tableHeight = ref(0);

onBeforeMount(async () => {
    // await spreadsheetStore.fetchLatestSheetId();
    console.log('**** sheets ***');
    console.log(spreadsheetStore.sheets)
    if (spreadsheetStore.activeTableOrderedIds == 0) spreadsheetStore.addNewSheet(true);
});

// onMounted(async () => {
//     window.addEventListener('resize', handleWindowResize)

//     console.log('MOUNTING GRID CONTAINER')

// })

// onBeforeUnmount(() => {
//     window.removeEventListener('resize', handleWindowResize)

//         console.log('UN-MOUNTING GRID CONTAINER')
// })

// function handleWindowResize(e) {
//     console.log('reszing window:')
//     const h = tabContainerRef.value?.clientHeight - spreadsheetStore.tabListHeight
//     const w = tabContainerRef.value?.clientWidth
//     console.log('h: '+h)
//     console.log('w: '+w)
//     spreadsheetStore.setMainTableHeight(h)
//     spreadsheetStore.setMainTableWidth(w)
// }

// onBeforeUpdate(() => {
//     console.log('UPDATING GRID CONTAINER');
//     // console.log('HEIGHT: '+height.value)
// });

</script>

<template>
    <div ref="tabContainerRef" id="grid-view-container" class="container-fluid h-100">
        <div class="row h-100">
            <div class="col px-0 mytab-container bg-black"
                style="min-height: 0 !important; overflow: hidden !important;">
                <TabWrapper>
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