<script setup>
import { useSpreadsheetStore } from '@/stores/spreadsheet';
import ToolbarWrapper from './ToolbarWrapper.vue';

const spreadsheetStore = useSpreadsheetStore();

async function onSaveActiveSheet() {
    spreadsheetStore.saveCells();
}

</script>

<template>

<ToolbarWrapper @save-active-sheet="onSaveActiveSheet"></ToolbarWrapper>


</template>