<template>
    <draggable tag="ul" v-model="loadedSheetOrderedIds" item-key="id">
        <template #item="{ element }">
            <ul>
                <li>
                    {{ sheets.get(element).name }}
                </li>
            </ul>
        </template>
    </draggable>
</template>
<script setup>
import draggable from 'vuedraggable'
import { useSpreadsheetStore } from '@/stores/spreadsheet';
import { storeToRefs } from 'pinia';

const spreadsheetStore = useSpreadsheetStore();

const { loadedSheetOrderedIds } = storeToRefs(spreadsheetStore);
const { sheets } = storeToRefs(spreadsheetStore);

</script>