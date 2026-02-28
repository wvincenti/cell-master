<script setup>
import { useSpreadsheetStore } from '@/stores/spreadsheet';
import ToolbarWrapper from './ToolbarWrapper.vue';
import { computed } from 'vue';

const spreadsheetStore = useSpreadsheetStore();



async function handleSaveActiveSheet() {
    const dirtyCells = [];
    const activeTab = spreadsheetStore.activeTab;
    const sheet_id = spreadsheetStore.cellTables[activeTab][0]['0'].sheet_id;
    spreadsheetStore.dirtyCells[sheet_id].forEach((cell) => {
        dirtyCells.push({
            sheet_id: cell.sheet_id,
            row_index: cell.row,
            col_index: cell.col,
            content: cell.value
        })
    })
    await spreadsheetStore.saveCells(dirtyCells);
}
</script>

<template>

<ToolbarWrapper @save-active-sheet="handleSaveActiveSheet"></ToolbarWrapper>


</template>