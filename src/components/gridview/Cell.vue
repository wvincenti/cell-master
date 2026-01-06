<script setup>
import { defineProps } from 'vue';
import { useSpreadsheetStore } from '@/stores/spreadsheet';
import { computed } from 'vue';

const props = defineProps({
    row: Number,
    col: Number,
    placeholder: String,
})

const spreadsheetStore = useSpreadsheetStore();

// Look up this specific cell's state in the store
// We use a "computed" property so if the store changes, the UI updates
const cellData = computed(() => {
    const key = `${props.row}-${props.col}`;
    return spreadsheetStore.cells[key] || { value: '', isDirty: false }; // Fallback for empty cells
});
</script>

<template>
    <input :id="props.row + '-' + props.col" class="cell-input" :placeholder="props.placeholder" :value="cellData?.value || ''" @input="onInput"/>
</template>