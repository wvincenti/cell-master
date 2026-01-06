<script setup>
import { useSpreadsheetStore } from '@/stores/spreadsheet';
import { h } from 'vue';

const spreadsheetStore = useSpreadsheetStore();

const props = defineProps({
  cols: { type: Number, default: 10 },
  rows: { type: Number, default: 12 },
  tableId: { type: Number, default: null }
})

const getColLabel = (n) => {
  if (n < 1) {
    return 'ID'
  }
  let label = '';
  while (n > 0) {
    let rem = (n - 1) % 26;
    label = String.fromCharCode(65 + rem) + label;
    n = Math.floor((n - 1) / 26);
  }
  return label;
};

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

</script>

<template>
  <table class="table" :key="props.tableId">
    <thead>
      <tr>
        <th v-for="(n, hIndex) in props.cols + 1" :key="'h-' + hIndex" :colspan="hIndex == 0 ? 1 : 3" class="cell"
          :class="{ 'table-warning': spreadsheetStore.cells['h-' + hIndex]?.isDirty }">
          <input :id="'h-' + hIndex" class="form-control" type="text"
            :value="spreadsheetStore.cells['h-' + hIndex] ? getCellData('h', hIndex).value : getColLabel(hIndex)"
            @input="e => onInput(e, 'h', hIndex)"
            @focus="e => getCellData('h', hIndex)?.value == '' ? e.target.value = '' : e.target.value = e.target.value"
            @focusout="e => getCellData('h', hIndex)?.value == '' ? e.target.value = getColLabel(hIndex) : e.target.value = getCellData('h', hIndex).value">
        </th>
      </tr>
    </thead>
    <tbody>
      <tr class="m-0" v-for="(row, rowIndex) in props.rows" :key="row">
        <th colspan="1" scope="row"><input class="form-control form-control-sm" type="text" name="" id="" :placeholder="rowIndex"
            disabled> </th>
        <td colspan="3" v-for="(col, colIndex) in props.cols" :key="row + '-' + col" class="cell"
          :class="{ 'table-warning': spreadsheetStore.cells[row + '-' + col]?.isDirty }">
          <input :id="row + '-' + col" class="form-control form-control-sm" :placeholder="getColLabel(colIndex + 1) + rowIndex"
            @input="(e) => onInput(e, row, col)" :value="getCellData(row, col).value" />
        </td>
      </tr>
    </tbody>
  </table>
</template>


<style scoped></style>