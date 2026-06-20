<script setup>
import { ref, computed, onBeforeMount, onUpdated, onMounted, watch } from 'vue';
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
    activeSheetId: null,

});

const spreadsheetStore = useSpreadsheetStore();

const { activeTableOrderedIds, activeTableId,  activeSheetNames : sheetNames, activeTab } = storeToRefs(spreadsheetStore)


// const  tableData = computed(() => spreadsheetStore.cellTables?.get(activeTableId.value)) //cellTables.get(activeTableOrderedIds)


const tabListRef = ref(null);
const tableHeight = computed(() => props.contHeight - tabListRef.value?.offsetHeight);

// const rowLables = computed(() => props.tableData?.map((row, i) => {
//     return { index: i, label: getColLabel(i + 1) };
// }))

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

watch(selectedLink, (l) => {
    console.log(l)
})

function onRowReorder(event) {
    console.log(event)
}


</script>

<template>
    <Tabs :pt="{ root: { class: 'h-100' } }" :value="activeTab" scrollable>
        <TabList asChild 
        :pt="{ root: { onVnodeMounted: (vnode) => onRootMounted(vnode.el) } 
    }"
    ref="tabListRef"
    >
            <draggable @change="onElementDragged" tag="div" v-model="activeTableOrderedIds" item-key="id">
                <template #item="{ element, index }">
                    <Tab :pt="{ root: { class: 'py-2' } }" :value="index" @click="spreadsheetStore.setActiveTab(index)">
                        {{ sheetNames[index] }}
                    </Tab>
                </template>
            </draggable>
        </TabList>
        <TabPanels :pt="{ root: { class: 'p-0' } }">
            <TabPanel :value="activeTab" :pt="{ root: { class: 'h-100' } }">
                <!-- <DataTable 
                    resizableColumns columnResizeMode="fit"
                    v-model:expandedRows="expandedRows" dataKey="0.row_index" @cell-edit-init="onCellInit"
                    :reorderableColumns="true"
                    @cell-edit-complete="onCellEditComplete" edit-mode="cell" :value="tableData" size="small"
                    tableStyle="min-width: 50rem" showGridlines scrollable :scrollHeight="`${tableHeight}px`" :pt="{
                        table: { style: 'min-width: 50rem' },
                        column: {
                            bodycell: ({ state }) => ({
                                class: [{ 'p-0': state['d_editing'] }]
                            })
                        },
                    }">
           
                    <Column expander frozen>
                    </Column>
            
                    <Column frozen>
                        <template #body="rowLables">
                            <span>{{ rowLables.index }}</span>
                        </template>
                    </Column>
                    <Column v-for="(cols, i) in tableData?.[0]"
                        :header="`${rowLables[i]?.label}` ?? getColLabel(rowLables.index)"
                        :field="`${i + '.cell_value'}`" style="min-width: 10rem;">
                        <template #editor="{ data, field }">
                            <InputText v-model="oldInputValue" class="h-100 w-100 border-0 rounded-0"></InputText>
                        </template>
                    </Column>
                    <template #expansion="slotProps">
                        <div class="container-fluid">
                            <div class="row">
                                <div class="col">
                                    <select v-model="selectedLink">
                                        <template
                                            v-for="linkedId in spreadsheetStore.sheets.get(slotProps.data?.['0']?.sheet_id)?.linked_sheet_ids">
                                            <option :value="linkedId">
                                                {{ spreadsheetStore.sheets.get(linkedId)?.name || "not found" }}
                                            </option>
                                        </template>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col">
                                <DataTable :value="spreadsheetStore.cellTables.get(selectedLink)"
                                    showGridlines edit-mode="cell">
                                    <Column expander> 
                                    </Column>
                                    <Column frozen>
                                        <template #body="rowLables">
                                            <span>{{ rowLables.index }}</span>
                                        </template>
                                    </Column>
                                    <Column v-for="(cols, i) in spreadsheetStore.cellTables.get(selectedLink)?.[0]"
                                        :header="`${rowLables[i]?.label}` ?? getColLabel(rowLables.index)"
                                        :field="`${i + '.cell_value'}`" style="min-width: 10rem;">
                                        <template #editor="{ data, field }">
                                            <InputText v-model="oldInputValue" class="h-100 w-100 border-0 rounded-0">
                                            </InputText>
                                        </template>
                                    </Column>
                                </DataTable>
                            </div>
                        </div>
                    </template>
                </DataTable> -->
                <CellTable 
                :table-height="tableHeight" :key="'table-'+activeTableOrderedIds[activeTab]" :comp-id="activeTableOrderedIds[activeTab]"></CellTable>
            </TabPanel>
        </TabPanels>
    </Tabs>a
</template>

<style scoped></style>