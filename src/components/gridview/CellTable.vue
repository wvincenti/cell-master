<template>
    <DataTable @cell-edit-init="onCellInit" @cell-edit-complete="onCellEditComplete" edit-mode="cell" :value="tableGrid"
        v-model:expandedRows="expandedRows" :dataKey="getRowKey" size="small" tableStyle="min-width: 50rem"
        showGridlines scrollable :scrollHeight="`${tableHeight}px`" :pt="{
            table: { style: 'min-width: 50rem' },
            column: {
                bodycell: ({ state }) => ({
                    class: [{ 'p-0': state['d_editing'] }]
                })
            },

        }">
        <!-- <Column rowReorder headerStyle="width: 3rem" :reorderableColumn="false" /> -->
        <Column expander frozen>
        </Column>

        <Column frozen>
            <template #body="slotProps">
                <span>{{ slotProps.index }}</span>
            </template>
        </Column>
        <Column v-for="(cols, i) in tableData?.[0]" :header="`${rowLables[i]?.label}` ?? getColLabel(rowLables.index)"
            :field="`${i + '.cell_value'}`" style="min-width: 10rem;">
            <template #editor="{ data, field }">
                <InputText v-model="oldInputValue" class="h-100 w-100 border-0 rounded-0"></InputText>
            </template>
        </Column>
        <template #expansion="slotProps">
            <div>EXPANDED</div>
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

            <div v-if="selectedLink" class="row">
                <div class="col">
                    <!-- <DataTable :value="spreadsheetStore.cellTables.get(selectedLink)" showGridlines edit-mode="cell">
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
                    </DataTable>  -->
                    <CellTable :table-data="slotProps.data" :cont-height="500" :comp-id="selectedLink"
                        :key="`table-${selectedLink}`"></CellTable>
                </div>
            </div>
        </template>
    </DataTable>
</template>
<script setup>
import { ref, computed, onBeforeMount, onUpdated, onMounted, watch, reactive } from 'vue';
import { Tabs, Tab, TabList, TabPanel, DataTable, Column, InputText, Button } from 'primevue';
import draggable from 'vuedraggable';
import { getColLabel } from '@/stores/spreadsheet';
import { useSpreadsheetStore } from '@/stores/spreadsheet';
import { storeToRefs } from 'pinia';

const props = defineProps({
    // tableData: Array,
    tableHeight: Number,
    compId: { type: [String, Number] },
    rowNumber: { type: Number, default: 18 },
    colNumber: { type: Number, default: 11 },
});


defineOptions({
    name: 'CellTable'
})

onUpdated(() => {
    console.log('updating CELL TABLE')
    // console.log(rowLables.value);
})

const spreadsheetStore = useSpreadsheetStore();

const { activeTableOrderedIds, activeTableId, activeTab } = storeToRefs(spreadsheetStore)

const tableData = computed(() => spreadsheetStore.cellTables.get(activeTableId.value))

const tabListRef = ref(null);
// const tableHeight = computed(() => props.tableHeight - tabListRef.value?.offsetHeight);

const tableGrid = createTableGrid(18, 11)

function createTableGrid(rowNum, colNum) {

    const cellTable = []

    for (let i = 0; i < rowNum; i++) {
        cellTable[i] = {}

        for (let j = 0; j < colNum; j++) {

          

            const storeCell = spreadsheetStore.cellTables.get(activeTableId.value)[i][`${j}`];

            console.log(storeCell)

            // cellTable[i][j] = {
            //     cell_value: computed(() => storeCell.cell_value),
            //     old_value: computed(() => storeCell.old_value),
            //     row_index: i,
            //     col_index: j,
            //     isDirty: false,
            //     sheet_id: null,
            //     data_type: 'string',
            // }
            cellTable[i][j] = reactive(storeCell)

             console.log(storeCell)
        }
    }

    return cellTable;
}



const getRowKey = (data) => {
    // Directly access the property using normal JS bracket notation
    return data['0']?.row_index;
};

// watch(activeTableId, (newTableId) => {
//     // const storeTable = spreadsheetStore?.cellTables?.get(newTableId)



//     tableGrid.forEach((row) => {
//         for (const [key, value] of Object.entries(row)) {
//             // console.log(`${key}: ${value}`);
//             const storeCell = tableData.value[value.row_index][value.col_index]



//             row[key].cell_value = storeCell.cell_value
//             row[key].old_value = storeCell.old_value
//             row[key].row_index = storeCell.row_index
//             row[key].col_index = storeCell.col_index
//             row[key].isDirty = storeCell.isDirty
//             row[key].sheet_id = storeCell.sheet_id
//             row[key].data_type = storeCell.data_type
//         }
//     })


//     // Fast, in-place mutation of the existing UI object properties
//     // for (let r = 0; r < 20; r++) {
//     //     // Object.assign(tableGrid, storeTable?.[r])
//     //     // tableGrid[r] = storeTable[r];
//     //     for (let c = 0; c < 11; c++) {
//     //         // Grab the new value from your store's Map
//     //         const newCell = storeTable?.[r]?.[c]?.value || ''

//     //         // Mutate the leaf property directly. 
//     //         // Vue retains the element references and only updates the text nodes!
//     //         //   console.log(tableGrid?.[r]?.[c])
//     //         //   Object.assign(tableGrid?.[r]?.[c], newValue)
//     //         const cell = tableGrid?.[r]?.[c]

//     //         cell.cell_value = ref(newCell.cell_value)
//     //         cell.old_value = ref(newCell.old_value)
//     //         cell.row_index = ref(newCell.row_index)
//     //         cell.col_index = ref(newCell.col_index)
//     //         cell.isDirty = ref(newCell.isDirty)
//     //         cell.sheet_id = ref(newCell.sheet_id)
//     //         cell.data_type = ref(newCell.data_type)
//     //     }
//     // }
// }, { immediate: true })

const rowLables = computed(() => tableData.value?.map((row, i) => {
    return { index: i, label: getColLabel(i + 1) };
}))

const oldInputValue = ref(null);

const onRootMounted = (el) => {
    tabListRef.value = el;
    console.log(tabListRef.value);
};

function onCellEditComplete(e) {
    console.log(e)
    let { data, field } = e;

    const [col, valueField] = field.split('.');

    const editedCell = tableData.value[e.index][col];
    console.log(editedCell);

    console.log(editedCell[valueField] != oldInputValue.value)
    if (editedCell[valueField] != oldInputValue.value)
        spreadsheetStore.patchCellState(editedCell, { cell_value: oldInputValue.value });

    oldInputValue.value = '';
}

function onCellInit(e) {
    let { data, field } = e;
    console.log(e)
    let [col, value] = field.split('.');
    oldInputValue.value = data[col]?.value?.['cell_value'];
}

const isRowExpanded = ref(false)

function handleRowExpanded() {
    isRowExpanded.value = !isRowExpanded.value
}

const expandedRows = ref({});

const selectedLink = ref(null);


</script>