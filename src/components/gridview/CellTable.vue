<template>
    <DataTable :virtualScrollerOptions="{
        itemSize: [46, 120], orientation: 'both', lazy: true, onLazyLoad: onLazyLoad
    }" ref="dtRef" @cell-edit-init="onCellInit" @cell-edit-complete="onCellEditComplete"
        v-memo="[colNumber, rowNumber, tableHeight]" edit-mode="cell" :value="tableGrid" :dataKey="getRowKey"
        v-model:expandedRows="expandedRows" size="small" tableStyle="min-width: 50rem" showGridlines scrollable
        :scrollHeight="`${tableHeight}px`" :pt="{
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
        <template v-for="i in colNumber">
            <Column :header="null" :field="`${i - 1}.cell_value`" style="min-width: 10rem;">
                <template #editor="{ data, field }">
                    <InputText v-model="oldInputValue" class="h-100 w-100 border-0 rounded-0"></InputText>
                </template>
            </Column>
        </template>


        <template #expansion="slotProps">

            <div v-if="expandedRows[getRowKey(slotProps.data)]" class="container-fluid ms-0 pe-4"
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
                    <!--   <div class="col">
                        <CellTable :table-height="200" :table-width="tableWidth" :table-id="selectedLink"
                            :row-number="5" :col-number="5" :key="`table-${selectedLink}`"></CellTable>
                    </div> -->
                </div>
            </div>

        </template>
    </DataTable>
</template>
<style scoped></style>
<script setup>
import { ref, onBeforeUnmount, onUpdated, onMounted, watch, reactive, } from 'vue';
import { Tabs, Tab, TabList, TabPanel, DataTable, Column, InputText, Button, Row } from 'primevue';
import draggable from 'vuedraggable';
import { getColLabel } from '@/stores/spreadsheet';
import { useSpreadsheetStore } from '@/stores/spreadsheet';
import { storeToRefs } from 'pinia';
import { tab } from '@primeuix/themes/aura/tabs';


const props = defineProps({
    // tableData: Array,
    tableHeight: Number,
    tableWidth: Number,
    tableId: [Number, String],
    // compId: { type: [String, Number] },
    rowNumber: { type: Number, default: 20 },
    colNumber: { type: Number, default: 11 },

});

const dtRef = ref(null);
let scrollContainer = null;


defineOptions({
    name: 'CellTable'
})

onUpdated(() => {
    console.log('updating CELL TABLE')
    // console.log(rowLables.value);
})

let lastScrollTop = 0

function onLazyLoad(event) {
    const { last } = event;

    // Trigger when user scrolls near the bottom of loaded data
    if (last >= tableGrid.length - 2) {
        for (let i = 0; i < 5; i++) {
            tableGrid.push(createGridRow(props.colNumber, tableGrid.length, props.tableId));
        }
    }
}

function handleTableScroll(event) {

    const { scrollTop, scrollHeight, clientHeight } = event.target;
    // console.log(event)
    console.log("Vertical scroll position:", scrollTop);

    // Example: Check if user reached the bottom
    if (scrollTop + clientHeight >= scrollHeight - 5) {
        console.log("Reached bottom of the table!");
        for (let idx = 0; idx < 5; idx++) {
            tableGrid.push(createGridRow(props.colNumber, tableGrid.length, props.tableId))
        }
    }

    if (scrollTop > lastScrollTop) {
        lastScrollTop = scrollTop;
    } else if (scrollTop - lastScrollTop < - 20) {
        tableGrid.pop()
        lastScrollTop = scrollTop
    }
    console.log('ROW COUNT: ' + tableGrid.length)
}

const spreadsheetStore = useSpreadsheetStore();

const tableGrid = reactive(createTableGrid(props.rowNumber, props.colNumber))

function createGridRow(colNum, i, sheetId = null) {
    const gridRow = {}
    for (let j = 0; j < colNum; j++) {


        gridRow[j] =
        {
            // old_value : '',
            cell_value: '',
            row_index: i,
            col_index: j,
            // isDirty : false,
            sheet_id: sheetId,
            // data_type : 'string',
        }

        const modelCell = spreadsheetStore.lookupModelCell(gridRow[j]);

        if (modelCell) {
            gridRow[j].cell_value = modelCell?.cell_value
        }

    }



    return gridRow
}

function createTableGrid(rowNum, colNum) {

    console.log('CREATING TABLE GRID')
    console.log(rowNum)
    console.log(colNum)

    const grid = []

    for (let i = 0; i < rowNum; i++) {
        grid.push(createGridRow(colNum))
    }

    console.log(grid)

    return grid
}



const getRowKey = (data) => {
    // Directly access the property using normal JS bracket notation
    return data['0']?.row_index;
};



watch(() => props.tableId, (newTableId) => {
    // console.log(props.tableId)
    // console.log(newTableId)
    // console.log(tableGrid)

    const tableModel = spreadsheetStore.cellTables.get(newTableId)

    console.log('TABLE MODEL ****')
    // console.log(tableModel)

    tableGrid.forEach((rowVal, rowIdx) => {

        // console.log(rowVal)
        for (const [colIdx, colVal] of Object.entries(rowVal)) {
            // console.log(colVal)

            const cell = tableGrid?.[rowIdx]?.[colIdx];

            if (cell) {
                // Object.assign(cell,
                //     {
                //         cell_value: '',
                //         row_index: rowIdx,
                //         sheet_id: newTableId,
                //         col_index: colIdx
                //     }
                // )
                cell.cell_value = ''
                cell.row_index = rowIdx
                cell.sheet_id = newTableId
                cell.col_index = colIdx
            }


            const modelCell = spreadsheetStore.lookupModelCell(cell);

            if (modelCell) {
                cell.cell_value = modelCell.cell_value
            }
        }


    })

    // tableModel.forEach((cell) => {
    //     console.log(cell)
    //     if (!tableGrid?.[cell.row_index]) tableGrid[cell.row_index] = {};

    //     if (!tableGrid?.[cell.row_index]?.[cell.col_index]) tableGrid[cell.row_index][cell.col_index] = {
    //         cell_value: cell?.cell_value,
    //         row_index: cell?.row_index,
    //         sheet_id: cell?.sheet_id,
    //         col_index: cell?.col_index,
    //         data_type: cell?.data_type
    //     };

    //     Object.assign(tableGrid[cell.row_index][cell.col_index],
    //         {
    //             cell_value: cell?.cell_value,
    //             row_index: cell?.row_index    //             sheet_id: cell?.sheet_id,
    //             col_index: cell?.col_index
    //         }
    //     )

    //     console.log(tableGrid?.[cell.row_index]?.[cell.col_index])
    // })
}, { immediate: true })


// const rowLables = computed(() => tableGrid.map((row, i) => {
//     console.log('computing row labels')
//     return { index: i, label: getColLabel(i + 1) };
// }))

const oldInputValue = ref(null);


function onCellEditComplete(e) {
    // console.log(e)
    let { data, field } = e;

    const [col, valueField] = field.split('.');

    const editedCell = tableGrid[e.index][col];
    // console.log(editedCell);

    // console.log(editedCell[valueField] != oldInputValue.value)

    // *** FIX MODEL ROW INSERTION
    if (editedCell[valueField] != oldInputValue.value)
        spreadsheetStore.patchCellState(editedCell, { cell_value: oldInputValue.value });
    editedCell[valueField] = oldInputValue.value
    oldInputValue.value = '';

}


function onCellInit(e) {
    let { data, field } = e;
    // console.log(e)
    let [col_index, valueField] = field.split('.');
    oldInputValue.value = data[col_index]?.[valueField];
}

const isRowExpanded = ref(false)

function handleRowExpanded() {
    isRowExpanded.value = !isRowExpanded.value
}

const expandedRows = ref({});

const selectedLink = ref(null);

onMounted(() => {
    if (dtRef.value?.$el) {
        // PrimeVue wraps the scrollable body inside '.p-datatable-scrollbar-wrap' or '.p-datatable-table-container'
        // Finding the container element that handles the overflow:
        scrollContainer = dtRef.value.$el.querySelector('.p-datatable-table-container')
            || dtRef.value.$el.querySelector('.p-datatable-scrollbar-wrap');

        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleTableScroll);
        }
    }
});

onBeforeUnmount(() => {
    // Clean up listener to prevent memory leaks
    if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleTableScroll);
    }
});


</script>