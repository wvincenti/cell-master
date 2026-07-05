<template>
    <DataTable @cell-edit-init="onCellInit" @cell-edit-complete="onCellEditComplete"
    
        v-memo="[colNumber, rowNumber, tableHeight]"
        edit-mode="cell" :value="tableGrid"
        :dataKey="getRowKey" v-model:expandedRows="expandedRows" size="small" tableStyle="min-width: 50rem"
        showGridlines scrollable :scrollHeight="`${tableHeight}px`" :pt="{
            table: { style: 'min-width: 50rem' },
            column: {
                bodycell: ({ state }) => ({
                    class: [{ 'p-0': state['d_editing'] }]
                })
            },
            rowExpansionCell: {
                style: `width: ${500}px`
            }
        }">
        <!-- <Column rowReorder headerStyle="width: 3rem" :reorderableColumn="false" /> -->
        <Column expander frozen>
        </Column>

        <Column frozen>
            <template #body="slotProps">
                <span>{{ slotProps.index }}</span>
            </template>
        </Column>
        <Column v-for=" i in colNumber" :key="'col-'+i" :header="null"
            :field="`${i}.cell_value`" style="min-width: 10rem;">
            <template #editor="{ data, field }">
                <InputText v-model="oldInputValue" class="h-100 w-100 border-0 rounded-0"></InputText>
            </template>
        </Column>

        <template #expansion="slotProps">

            <div class="container-fluid ms-0 pe-4"
                :style="`width: ${tableWidth}px; position: sticky; left: 0; display: block;`">
                <div class="row">
                    <div class="col">
                        <select v-model="selectedLink">
                            <template v-for="linkedId in spreadsheetStore.sheets.get(tableId)?.linked_sheet_ids">
                                <option :value="linkedId">
                                    {{ spreadsheetStore.sheets.get(linkedId)?.name || "not found" }}
                                </option>
                            </template>
                        </select>
                    </div>
                </div>
                <div v-if="selectedLink" class="row">
                    <div class="col">
                        <CellTable :table-height="200" :table-id="selectedLink"
                            :row-number="5" :col-number="5" :key="`table-${selectedLink}`"></CellTable>
                    </div>
                </div>
            </div>

        </template>
    </DataTable>
</template>
<style scoped>
.bounded {
    max-width: 200px !important;
}
</style>
<script setup>
import { ref, computed, onBeforeMount, onUpdated, onMounted, watch, reactive, shallowReactive } from 'vue';
import { Tabs, Tab, TabList, TabPanel, DataTable, Column, InputText, Button } from 'primevue';
import draggable from 'vuedraggable';
import { getColLabel } from '@/stores/spreadsheet';
import { useSpreadsheetStore } from '@/stores/spreadsheet';
import { storeToRefs } from 'pinia';


const props = defineProps({
    // tableData: Array,
    tableHeight: Number,
    tableWidth: Number,
    tableId: [Number, String],
    // compId: { type: [String, Number] },
    rowNumber: { type: Number, default: 20 },
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

const tableGrid = reactive(createTableGrid(props.rowNumber, props.colNumber))

function createTableGrid(rowNum, colNum) {

    console.log('CREATING TABLE GRID')
    console.log(rowNum)
    console.log(colNum)

    const grid = []

    for (let i = 0; i < rowNum; i++) {
        grid[i] = {}
        for (let j = 0; j < colNum; j++) {

            grid[i][j] =
            {
                // old_value : '',
                cell_value: '',
                row_index: i,
                col_index: j,
                // isDirty : false,
                sheet_id: null,
                // data_type : 'string',
            }
        }
    }

    console.log(grid)

    return grid
}



const getRowKey = (data) => {
    // Directly access the property using normal JS bracket notation
    return data['0']?.row_index;
};



watch(() => props.tableId, (newTableId) => {
    console.log(tableGrid)

    const tableModel = spreadsheetStore.cellTables.get(newTableId)

    tableGrid.forEach((row, i) => {

        for (const [key, value] of Object.entries(row)) {

            const cellModel = tableModel?.[i]?.[key]
            
            if (cellModel) {
                value.cell_value = cellModel.cell_value
                // value.row_index = cellModel.row_index,
      
                // value.col_index = cellModel.col_index
            } else {
                value.cell_value = ''
                // value.row_index = cellModel.row_index,
                // value.sheet_id = cellModel.sheet_id,
                // value.col_index = cellModel.col_index
            }

            value.sheet_id = newTableId

        }
    })

    // spreadsheetStore.cellTables.get(newTableId)?.forEach((row) => {

    //     for (const [key, value] of Object.entries(row)) {
    //         //Object.assign(tableGrid[row_index][key], row[key]?.cell_value)
    //         // console.log(value)
    //         let gridRow = tableGrid?.[value?.row_index]

    //         if (!gridRow) tableGrid[value?.row_index] = {};

    //         let gridCell = gridRow?.[key]

    //         if (!gridCell) tableGrid[value.row_index][key] = {};

    //         Object.assign(
    //             tableGrid[value?.row_index][key], 
    //             { 
    //                 cell_value: row[key]?.cell_value, 
    //                 row_index: value?.row_index, 
    //                 sheet_id: value?.sheet_id, 
    //                 col_index: value?.col_index 
    //             }
    //         )
    //     }
    // })
}, { immediate: true })


// const rowLables = computed(() => tableGrid.map((row, i) => {
//     console.log('computing row labels')
//     return { index: i, label: getColLabel(i + 1) };
// }))

const oldInputValue = ref(null);


function onCellEditComplete(e) {
    console.log(e)
    let { data, field } = e;

    const [col, valueField] = field.split('.');

    const editedCell = tableGrid[e.index][col];
    console.log(editedCell);

    console.log(editedCell[valueField] != oldInputValue.value)

    if (editedCell[valueField] != oldInputValue.value)
        spreadsheetStore.patchCellState(editedCell, { cell_value: oldInputValue.value });

    editedCell[valueField] = oldInputValue.value
    oldInputValue.value = '';

}


function onCellInit(e) {
    let { data, field } = e;
    console.log(e)
    let [col_index, valueField] = field.split('.');
    oldInputValue.value = data[col_index]?.[valueField];
}

const isRowExpanded = ref(false)

function handleRowExpanded() {
    isRowExpanded.value = !isRowExpanded.value
}

const expandedRows = ref({});

const selectedLink = ref(null);


</script>