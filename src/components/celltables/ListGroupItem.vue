                    
<script setup>
import { ref } from 'vue';
import InputButton from './InputButton.vue';
import axios, { spread } from 'axios';
import { useSpreadsheetStore } from '@/stores/spreadsheet';
import { getColLabel } from '@/stores/spreadsheet';

const spreadsheetStore = useSpreadsheetStore();

const props = defineProps(
    {
        sheetKey: String,
        sheet: Object,
        tableName: String
    }
);

const selectedSheet = ref(null);

const handleUpdate = (name, tableName, id) => {
    spreadsheetStore.updateName(name, tableName, id);
}

const loadCellsToView = async () => {
    await spreadsheetStore.fetchCells(props.sheetKey);
    const sheetId = props.sheetKey;
    const view = spreadsheetStore.activeView;
    const cols = spreadsheetStore.sheets[sheetId].cols.length;
    const rows = spreadsheetStore.sheets[sheetId].row_count;
    try {
        for (let row = 1; row <= rows; row++) {
            const viewRow = [];
            for (let col = 1; col <= cols; col++) {
                viewRow.push(spreadsheetStore.cells[sheetId+'-'+row+'-'+col])
            }
            spreadsheetStore.loadRowToView(viewRow, view);
        }
    }
    catch(e) {
        throw e;
    }
    
}

// const handleSelect = async (id) => {
//     const node = { sheet: id }
//     let emptyView;
//     spreadsheetStore.views.forEach((view, idx) => {
//         if (view.length == 0) {
//             spreadsheetStore.loadToView(node, idx);
//             spreadsheetStore.setActiveView(idx);
//             return;
//         } else if (idx == views.length - 1)
//         {
//             spreadsheetStore.views.push([]);
//             handleSelect(id);
//         }

//     })
//     await spreadsheetStore.fetchCells(id);



//     console.log(spreadsheetStore.cells);


// }
function getTableId(key) {
    const id = key.split('-')[0];
    return id;
}

</script>
<template >
    <div @click="selectedSheet === sheetKey ? selectedSheet = null : selectedSheet = sheetKey"
        class="list-group-item list-group-item-action px-1 d-flex justify-content-between">
        <InputButton :inputKey="sheetKey"></InputButton>
        <span>

            <button @click.stop="loadCellsToView" class="btn btn-sm btn-primary rounded-circle"><i
                    class="bi bi-arrow-down-circle-fill text-success fs-6"></i></button>

        </span>
    </div>
    <div class="list-group" :key="sheetKey" v-if="selectedSheet === sheetKey">
        <div v-for="(column, id) in sheet.cols"
            class="list-group-item list-group-item-action d-flex justify-content-between">
            <InputButton :inputName="column.name" :inputKey="'col-' + id"></InputButton>
        </div>
    </div>
</template>