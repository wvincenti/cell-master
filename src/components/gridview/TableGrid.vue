<script setup>
import { getColLabel, useSpreadsheetStore } from '@/stores/spreadsheet';
import { h, reactive } from 'vue';
import Cell from './Cell.vue';
import { watch } from 'vue';
import { computed } from 'vue';

const spreadsheetStore = useSpreadsheetStore();

const props = defineProps({
  cols: { type: Number, default: 10 },
  rows: { type: Number, default: 12 },
  tableId: { type: Number, default: null },
  sheet: { type: Object, default: {} },
  view: {type: Array, default: []},
  idx: {type: Number, default: 0}
})

const getCellData = (r, c) => {
  const key = r + '-' + c;
  return spreadsheetStore.cells[key] || { value: '', isDirty: false }
}

const onInput = (event, r, c) => {
  spreadsheetStore.updateCell(r, c, event.target.value);
}

const onSheetSelect = (event, id, name = null) => {
  spreadsheetStore.setActiveSheetId(id);
}

const addSheet = (name = null) => {
  const newMaxId = spreadsheetStore.maxSheetId + 1;
  spreadsheetStore.addSheet({ id: newMaxId, name: name });
  spreadsheetStore.maxSheetId = newMaxId;
  spreadsheetStore.setActiveSheetId(newMaxId);
}

const inputMap = reactive({});

// const getView = (viewId) => {
//   spreadsheetStore.cells;
// }

// watch(() => 
// spreadsheetStore.views[spreadsheetStore.activeView].forEach((node, index) => {
//   spreadsheetStore.sheets[node.id].forEach((col) => {
//     const ids = col.split('-');
//     let offset = 0;
//     offset += index == 0 ? 0 : spreadsheetStore.sheets[views[index-1].id].length;
//     const key = ids[0]+'-'+(ids[1]+offset)+'-'+ids[2];
//     inputMap[key] = spreadsheetStore.cells[col];
//   })
  
// }))



const findSheet = (index) => {
  
  spreadsheetStore.views[spreadsheetStore.activeView].forEach((sheet, idxa) => {
    if (idx == sheet.length) {
      stops.push(sheet.length);
    }

  })
}

const getCellBinding = (viewIdx, row, col) => {
  return computed({
    get() {
      // Safely access the value. If any part of the path is missing, return ""
      return spreadsheetStore.views[viewIdx]?.[row]?.[col]?.value ?? '';
    },
    set(newValue) {
      // If the user types, call a store action to safely update or create the cell
      spreadsheetStore.updateCellFromView(viewIdx, row, col, newValue);
    }
  });
};


</script>

<template>

  <table class="table" :key="'view-'+idx">
    <thead>
      <tr>
        <th v-for="(n, hIndex) in props.cols + 1" :key="'h-' + hIndex" :colspan="hIndex == 0 ? 1 : 3" class="cell"
          :class="{ 'table-warning': spreadsheetStore.cells['h-' + hIndex]?.isDirty }">
          <input :id="'h-' + hIndex" class="form-control" :value="getColLabel(hIndex)" type="text"
            @input="e => onInput(e, 'h', hIndex)"
            @focus="e => getCellData('h', hIndex)?.value == '' ? e.target.value = '' : e.target.value = e.target.value"
            @focusout="e => getCellData('h', hIndex)?.value == '' ? e.target.value = getColLabel(hIndex) : e.target.value = getCellData('h', hIndex).value">
        </th>
      </tr>
    </thead>
    <tbody>
      <tr class="m-0" v-for="(row, rowIndex) in props.rows" :key="row">
        <th colspan="1" scope="row">
          <input class="form-control form-control-sm" type="text" name="" id="" :placeholder="rowIndex" disabled>
        </th>
        <td colspan="3" v-for="(col, colIndex) in props.cols" :key="row + '-' + col" class="cell"
          :class="{ 'table-warning': spreadsheetStore.cells[row + '-' + col]?.isDirty }">
          <input :id="row + '-' + col" class="form-control form-control-sm"
            :placeholder="getColLabel(colIndex + 1) + rowIndex" @input="(e) => onInput(e, row, col)"
            v-model="getCellBinding(idx, row, col).value"
            />
        </td>
      </tr>
    </tbody>
  </table>

</template>


<style scoped></style>