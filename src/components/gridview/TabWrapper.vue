<script setup>
import { ref, computed, onBeforeMount, onUpdated, onMounted, watch, nextTick, onBeforeUnmount } from 'vue';
import { Tabs, Tab, TabList, TabPanel, DataTable, Column, InputText, Button } from 'primevue';
import draggable from 'vuedraggable';
import { getColLabel } from '@/stores/spreadsheet';
import { useSpreadsheetStore } from '@/stores/spreadsheet';
import { storeToRefs } from 'pinia';
import CellTable from './CellTable.vue';

const spreadsheetStore = useSpreadsheetStore()

const { activeTableOrderedIds, activeTableId, activeSheetNames: sheetNames, activeTab, mainTableHeight, mainTableWidth } = storeToRefs(spreadsheetStore)

const tabListRef = ref(null)
const tabPanelRef = ref(null)

onUpdated(() => {
    console.log('updating tab wrapper')
    // console.log(tableHeight.value)
})

const onRootMounted = (el) => {
    tabListRef.value = el;
    console.log(tabListRef.value);
};

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

            spreadsheetStore.tabListHeight = tabListRef.value?.clientHeight

            spreadsheetStore.setMainTableHeight(tabPanelRef.value?.clientHeight - spreadsheetStore?.tabListHeight)
            spreadsheetStore.setMainTableWidth(tabPanelRef.value?.clientWidth)
           
        }
    })
})

</script>

<template>
    <!-- <Tabs :pt="{ root: { class: 'h-100' } }" value="myOnlyTab" scrollable>
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

        <TabPanel value="myOnlyTab" :pt="{ root: { class: 'h-100' } }">
            <CellTable :table-id="activeTableId" :table-height="mainTableHeight" :table-width="mainTableWidth"
                :row-number="20" :col-number="11">
            </CellTable>
        </TabPanel>

    </TabPanels>
</div>

</Tabs> -->
    <Tabs :value="activeTab" scrollable>
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
    </Tabs>
    <!-- <div ref="tabListRef" class="w-100">
        <draggable @change="onElementDragged" tag="div" v-model="activeTableOrderedIds" item-key="id">
            <template #item="{ element, index }">
                <Button :pt="{ root: { class: 'py-2' } }" :value="index" @click="spreadsheetStore.setActiveTab(index)">
                    {{ sheetNames[index] }}
                </Button>
            </template>
        </draggable>
    </div> -->
    <div ref="tabPanelRef" class="h-100 w-100 tpr">
        <CellTable 
            :table-id="activeTableId" 
            :table-height="mainTableHeight" 
            :table-width="mainTableWidth"
            :row-number="20" 
            :col-number="11"
        >
        </CellTable>
    </div>
</template>

<style scoped></style>