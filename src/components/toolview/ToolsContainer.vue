<script setup>
import { useSpreadsheetStore } from '@/stores/spreadsheet';
import ToolbarWrapper from './ToolbarWrapper.vue';

const spreadsheetStore = useSpreadsheetStore();

async function handleSaveActiveSheet() {
    const dirtyCells = [];
    const activeTab = spreadsheetStore.activeTab;
    console.log('********************')
    console.log(spreadsheetStore.cellTables[activeTab])
    const sheet_id = spreadsheetStore.cellTables[activeTab][0]['0'].sheet_id;
    console.log(spreadsheetStore.dirtyCells[sheet_id])
    spreadsheetStore.dirtyCells[sheet_id].forEach((cell) => {
        dirtyCells.push({
            sheet_id: sheet_id,
            row_id: cell.row,
            col_id: cell.col,
            display_val: cell.value,
            date_type: 'string',
            val: cell.value,

        });
    })
    await spreadsheetStore.saveCells(dirtyCells);
}

</script>

<template>

<ToolbarWrapper @save-active-sheet="handleSaveActiveSheet"></ToolbarWrapper>


</template>