<script setup>
import { DataTable, Column, InputText } from 'primevue';
import { getColLabel } from '@/stores/spreadsheet';
import { ref, shallowRef, onMounted, onUpdated, onBeforeUpdate, computed } from 'vue';

const props = defineProps({
    cTable: Number,
    height: Number,
    sheet: Array,
})

// const sheet = [];

// for (let i = 0; i < 20; i++) {
//     sheet[i] = {}
//     for (let j = 0; j < 26; j++) {
//         sheet[i][`${j}`] = 'Row: '+i+' Col: '+j
//     }
// }

// function cellUpdate(e) {
//     const { data, newValue, field } = e;
//     console.log(e);
// }
onBeforeUpdate(() => {
    console.log('UPDATING TABLE WRAPPER');
})

</script>

<template>
    <div class="">
        <DataTable :value="sheet" scrollable scrollHeight="400px" tableStyle="min-width: 50rem" lazy>
            <Column v-for="(col, i) in sheet" :header="i" :field="i">

            </Column>
        </DataTable>
    </div>
</template>