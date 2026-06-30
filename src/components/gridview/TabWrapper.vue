<script setup>
import { ref, computed, onBeforeMount, onUpdated, onMounted, watch, nextTick } from 'vue';
import { Tabs, Tab, TabList, TabPanel, DataTable, Column, InputText, Button } from 'primevue';
import draggable from 'vuedraggable';
import { getColLabel } from '@/stores/spreadsheet';
import { useSpreadsheetStore } from '@/stores/spreadsheet';
import { storeToRefs } from 'pinia';
import CellTable from './CellTable.vue';

const props = defineProps({
    // activeTab: Number,
    // sheetNames: Array,
    // tableData: Array,
    contHeight: Number,
    isTableResized: Boolean,
});

const spreadsheetStore = useSpreadsheetStore()

const { activeTableOrderedIds, activeTableId, activeSheetNames: sheetNames, activeTab, mainTableHeight } = storeToRefs(spreadsheetStore)

const tabListRef = ref(null)
const tabPanelRef = ref(null)

//const tableHeight = ref(tabPanelRef.value?.getBoundingClientRect()?.height - tabListRef.value?.getBoundingClientRect()?.height);
const tableHeight = computed(() => {
    const h = mainTableHeight.value - Math.round(tabListRef.value?.getBoundingClientRect()?.height)
    console.log(tabPanelRef.value?.getBoundingClientRect()?.height)
    console.log('computing table height: ' + h)
    return h
})

const tableWidth = ref(tabPanelRef.value?.getBoundingClientRect()?.width)

onUpdated(() => {
    console.log('updating tab wrapper')
    console.log(tableHeight.value)
})


// watch(isMainTableResized, async (isResized) => {
//     if (isResized) {
//         await nextTick()
//         console.log('CONTAINER WATCHING');
//         const domEl = tabPanelRef.value?.$el
//         console.log(tabPanelRef.value)
//         console.log(tabListRef.value)
//         //const { height } = useElementSize(tabContainerRef);
//         // console.log('HEIGHT: '+height.value)
//         requestAnimationFrame(() => {
//             if (tabPanelRef.value) {
//                 tableHeight.value = tabPanelRef.value?.getBoundingClientRect()?.height;

//                 console.log(tableHeight.value)
//             }
//         })

//         spreadsheetStore.setIsMainTableResized(false)
//     }

// })



const oldInputValue = ref(null);

const onRootMounted = (el) => {
    tabListRef.value = el;
    console.log(tabListRef.value);
};

// function onCellEditComplete(e) {
//     console.log(e)
//     let { data, field } = e;

//     const [col, valueField] = field.split('.');

//     const editedCell = props.tableData[e.index][col];
//     console.log(editedCell);

//     if (editedCell[valueField] != oldInputValue.value)
//         spreadsheetStore.patchCellState(editedCell, { cell_value: oldInputValue.value });

//     oldInputValue.value = '';
// }

function onCellInit(e) {
    let { data, field } = e;
    let [col, value] = field.split('.');
    oldInputValue.value = data[col]['cell_value'];
}

const onElementDragged = (event) => {
    // Vue Draggable fires a "moved" object containing old/new index positions
    if (event.moved) {
        const { oldIndex, newIndex } = event.moved;

        console.log('ACTIVE TAB: ' + activeTab.value)

        if (activeTab.value == oldIndex) {
            // Scenario A: The user directly dragged the ACTIVE tab -> update its index to the new drop target
            spreadsheetStore.setActiveTab(newIndex);
        }
        else if (oldIndex < activeTab.value && newIndex >= activeTab.value) {
            // Scenario B: An item was dragged from behind the active tab to in front of it -> shift active index down
            spreadsheetStore.setActiveTab(activeTab.value - 1);
        }
        else if (oldIndex > activeTab.value && newIndex <= activeTab.value) {
            // Scenario C: An item was dragged from in front of the active tab to behind it -> shift active index up
            spreadsheetStore.setActiveTab(activeTab.value + 1);
        }
    }
}

const expandedRows = ref({});

const selectedLink = ref(null);


function onRowReorder(event) {
    console.log(event)
}


onMounted(async () => {
    await nextTick()
    console.log('CONTAINER MOUNTED');
    const domEl = tabPanelRef.value?.$el
    console.log(tabPanelRef.value)
    console.log(tabListRef.value)
    //const { height } = useElementSize(tabContainerRef);
    // console.log('HEIGHT: '+height.value)
    requestAnimationFrame(() => {
        if (tabPanelRef.value) {
            spreadsheetStore.setMainTableHeight(tabPanelRef.value?.getBoundingClientRect()?.height);
        }
    })
})

</script>

<template>
    <Tabs :pt="{ root: { class: 'h-100' } }" :value="activeTab" scrollable>
        <div ref="tabListRef">
            <TabList asChild :pt="{
                root: { onVnodeMounted: (vnode) => onRootMounted(vnode.el) }
            }">
                <draggable @change="onElementDragged" tag="div" v-model="activeTableOrderedIds" item-key="id">
                    <template #item="{ element, index }">
                        <Tab :pt="{ root: { class: 'py-2' } }" :value="index"
                            @click="spreadsheetStore.setActiveTab(index)">
                            {{ sheetNames[index] }}
                        </Tab>
                    </template>
                </draggable>
            </TabList>
        </div>
        <div ref="tabPanelRef" class="h-100 w-100">
            <TabPanels :pt="{ root: { class: 'p-0' } }">

                <TabPanel :value="activeTab" :pt="{ root: { class: 'h-100' } }">
                    <CellTable 
                        :table-height="tableHeight" 
                        :table-width="tableWidth"
                        :active-table-id="activeTableId" :row-number="20"
                        :col-number="11" >
                    </CellTable>
                </TabPanel>

            </TabPanels>
        </div>

    </Tabs>
</template>

<style scoped></style>