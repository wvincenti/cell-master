<script setup>
import { onMounted, ref, computed, onBeforeUpdate, onBeforeMount, nextTick, watch } from 'vue';
import { useSpreadsheetStore } from '@/stores/spreadsheet';
import TabWrapper from './TabWrapper.vue';
import { useElementSize } from '@vueuse/core';
import { storeToRefs } from 'pinia';

const props = defineProps({
    containerHeight: 0,
    isTableResized: false,//{ type: Number, isTableResize: Boolean }
})

const spreadsheetStore = useSpreadsheetStore();

// const emit = defineEmits(['table-resized'])

console.log('GRID HEIGHT: ' + props.containerHeight);

const { activeSheetNames, activeTable, activeTab } = storeToRefs(spreadsheetStore);


console.log('TABLE DATA ***')

const tabContainerRef = ref(null);
const tableHeight = ref(0);



watch(() => props.isTableResized, async (newValue) => {
    // Only calculate when the drag is finished (flag becomes true)
    console.log('WHATCHING: ' + newValue)
    if (newValue) {
        await nextTick(); // Wait for splitpanes DOM adjustments

        if (tabContainerRef.value) {
            tableHeight.value = tabContainerRef.value.offsetHeight;
        }
        // Tell the parent "I've successfully recalculated, you can turn off the flag now"
        emit('table-resized');
    }

    emit('table-resized')
});

// console.log('HEIGHT: '+height.value)

onBeforeMount(async () => {
    // await spreadsheetStore.fetchLatestSheetId();
    console.log('**** sheets ***');
    console.log(spreadsheetStore.sheets)
    if (spreadsheetStore.activeTableOrderedIds == 0) spreadsheetStore.addNewSheet(true);
});

onMounted(async () => {
    await nextTick()
    console.log('CONTAINER MOUNTED');
    //const { height } = useElementSize(tabContainerRef);
    // console.log('HEIGHT: '+height.value)
    requestAnimationFrame(() => {
        if (tabContainerRef.value) {
            tableHeight.value = tabContainerRef.value.getBoundingClientRect().height;
        }
    })

})

onBeforeUpdate(() => {
    console.log('UPDATING GRID CONTAINER');
    // console.log('HEIGHT: '+height.value)
});

</script>

<template>
    <div ref="tabContainerRef" id="grid-view-container" class="container-fluid h-100">
        <div class="row h-100">
            <div class="col px-0 mytab-container bg-black"
                style="min-height: 0 !important; overflow: hidden !important;">
                <TabWrapper :isTableResized="isTableResized">
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