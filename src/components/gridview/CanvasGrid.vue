<script setup>
import { ref, onMounted, onUnmounted, watch, reactive } from 'vue'
import { useSpreadsheetStore } from '@/stores/spreadsheet'
import canvasDatagrid from 'canvas-datagrid'

const props = defineProps({
    tableId: null,
    rowNumber: { default: 20, type: Number },
    colNumber: { default: 12, type: Number },
    // data: {
    //     type: Array,
    //     required: true,
    //     default: () => []
    // },
    // schema: {
    //     type: Array,
    //     default: undefined
    // }
})

const emit = defineEmits(['cellclick', 'cellvaluechange'])

const gridContainer = ref(null)
let gridInstance = null

const spreadsheetStore = useSpreadsheetStore();

const tableGrid = createTableGrid(props.rowNumber, props.colNumber)

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

onMounted(() => {
    console.log('mounting')
    if (!gridContainer.value) return

    console.log("tableGrid")
    console.log(tableGrid)

    // Initialize the canvas grid attached to our container element
    gridInstance = canvasDatagrid({
        parentNode: gridContainer.value,
        data: tableGrid,
        //schema: props.schema,
        // Enable core spreadsheet behaviors
        allowMovingSelection: true,
        allowSorting: true,
        allowResizing: true,
        columnHeaderClickBehavior: 'select'
    })

    // Listen to grid events and forward them to Vue
    gridInstance.addEventListener('click', (e) => {
        emit('cellclick', e)
    })

    gridInstance.addEventListener('endediting', (e) => {
        emit('cellvaluechange', e)
    })
})

// Keep the canvas in sync when Vue data updates
// watch(
//   () => props.data,
//   (newData) => {
//     if (gridInstance) {
//       gridInstance.data = newData
//     }
//   },
//   { deep: true }
// )
watch(() => props.tableId, (newTableId) => {

    tableGrid.forEach((rowVal, rowIdx) => {

        for (const [colIdx, colVal] of Object.entries(rowVal)) {

            const cell = tableGrid?.[rowIdx]?.[colIdx];

            if (cell) {
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
}, { immediate: true })

onUnmounted(() => {
    if (gridInstance) {
        gridInstance.dispose()
    }
})
</script>

<template>
    <div class="canvas-grid-wrapper">
        <div ref="gridContainer" class="canvas-container"></div>
    </div>
</template>

<style scoped>
.canvas-grid-wrapper {
    width: 100%;
    height: 500px;
    position: relative;
    border: 1px solid #ccc;
}

.canvas-container {
    width: 100%;
    height: 100%;
}
</style>