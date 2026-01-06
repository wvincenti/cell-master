<script setup>
import { useSpreadsheetStore } from '@/stores/spreadsheet';
const store = useSpreadsheetStore();


</script>

<template>
    <div class="row bg-dark">
        <div class="col-2"><button class="btn btn-outline-light btn-sm my-1" @click="store.saveCells">Store Table</button></div>
    </div>
</template>