<script setup>
import { useSpreadsheetStore, getColLabel } from '@/stores/spreadsheet';
import TableNavigator from './TableNavigator.vue';
import { onMounted, computed } from 'vue';

const spreadsheetStore = useSpreadsheetStore()

const tabIndex = computed( () => spreadsheetStore.cellTables.length);

const navigator = computed(() => {
    const sheets = spreadsheetStore.sheets;
    return sheets.map((sheet, index) => {
        return {
            label: sheet.name || 'Sheet ' + sheet.id,
            items: sheet.cols.map((col) => { return {id:`${sheet.id}-${index}-${col.id}`, label: col.name || getColLabel(col.id)};}),
            icon: 'pi pi-plus',
            showAdd: true,
            id:`${sheet.id}`,
            index: tabIndex.value,
        }
    })
})

onMounted(async () => {
    try {

        await spreadsheetStore.fetchSheetSchema();
        console.log(spreadsheetStore.sheets);
    } catch (error) {
        console.error(error)
    }
})

async function addSheet(id, idx) {
    console.log('ADDING SHEET!')
    console.log(id);
    await spreadsheetStore.fetchCells(id);
    spreadsheetStore.setActiveTab(idx);

}

</script>

<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col p-1">
                <TableNavigator @add-sheet="addSheet" :navigator="navigator"></TableNavigator>
            </div>
        </div>
    </div>
</template>