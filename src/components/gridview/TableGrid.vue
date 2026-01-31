<script setup>
import { getColLabel, useSpreadsheetStore } from '@/stores/spreadsheet';
import { h, onMounted, onUnmounted, ref } from 'vue';
import Cell from './Cell.vue';
import { watch } from 'vue';
import { computed } from 'vue';

const spreadsheetStore = useSpreadsheetStore();

const props = defineProps({
  cols: { type: Number, default: 27 },
  rows: { type: Number, default: 12 },
  tableId: { type: Number, default: null },
  sheet: { type: Object, default: {} },
  viewIdx: { type: Number, default: 0 },
  idx: { type: Number, default: 0 }
})

const containerHeight = 600; // Height of your visible area
const viewportRef = ref(null);
const containerWidth = ref(0);
const rowHeight = 35; // Fixed height for each row
const scrollTop = ref(0);

const tableHeader = ref(null);
const headerHeight = ref('0px');

const updateWidth = () => {
  if (viewportRef.value) {
    console.log(viewportRef.value.offsetWidth)
    containerWidth.value = viewportRef.value.offsetWidth;
  }
};

const CELL_WIDTH = 160; // Fixed width for now
const scrollLeft = ref(0);

// 1. Where do we start drawing columns?
const startColIndex = computed(() => {
  return Math.floor(scrollLeft.value / CELL_WIDTH);
});

// 2. How many columns can we actually see?
const visibleColCount = computed(() => {
  // Use the containerWidth we grabbed from the DOM Ref
  console.log(containerWidth.value);
  return Math.ceil(containerWidth.value / CELL_WIDTH) + 2;
});

const displayCols = computed(() => {
  const start = startColIndex.value;
  const end = start + visibleColCount.value + 2; // +2 for "over-scanning" buffer


  const result = [];
  const length = end - start;
  for (let i = 0; i < length; i++) {
    const idx = start + i;
    if (idx < spreadsheetStore.totalColsCount) {
      result.push(idx);
    }
  }
  console.log(result);
  return result;
});

onMounted(() => {
  // if (tableHeader.value) {
  //   const height = tableHeader.value.offsetHeight;
  //   headerHeight.value = `${height}px`;
  //   console.log(headerHeight.value);
  // }
  updateWidth();
  window.addEventListener('resize', updateWidth);

})

onUnmounted(() => {
  window.removeEventListener('resize', updateWidth);
});



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

const activeView = spreadsheetStore.activeViewaId;

// Calculate which rows to show
const visibleRows = computed(() => {
  const start = Math.floor(scrollTop.value / rowHeight);
  const end = start + Math.ceil(containerHeight / rowHeight);

  // We add a "buffer" of 2-3 rows so the user doesn't see white space
  return spreadsheetStore.views[activeView].slice(start, end + 5);
});

const displayRows = computed(() => {
  const rowNumber = Math.floor(containerHeight / rowHeight);
  return rowNumber + 10;
})


const startIndex = computed(() => {
  return Math.floor(scrollTop.value / rowHeight);
});

// We need this to keep the scrollbar at the right "size"
const totalHeight = computed(() => {
  return spreadsheetStore.views[activeView].length * rowHeight;
});

const offsetY = ref(0);

const onScroll = (e) => {
  scrollTop.value = e.target.scrollTop;
  // Move the table so it starts exactly at the top of the first visible row
  offsetY.value = Math.floor(scrollTop.value / rowHeight) * rowHeight;
  scrollLeft.value = e.target.scrollLeft;
};

// 1. Add a 'currentlyEditing' state
const editingKey = ref(''); // format: "row-col"

const handleCellClick = (e, row, col) => {

  console.log(row);

  const sheetId = spreadsheetStore.activeSheetId;
  const viewId = spreadsheetStore.activeView;

  const view = spreadsheetStore.views[viewId];
  console.log(view);

  const rowId = row + 1
  const colId = col + 1

  //spreadsheetStore.updateCell(sheetId, rowId, colId, '');
  console.log('cell updated')


  // console.log(sheetId);
  // console.log(viewId);

  // console.log('VIEWS: ')
  // console.log(spreadsheetStore.views);

  // if (view[row] == null) view[row] = []
  // if (view[row]?.[col] == null) {
  //   view[row][col] = spreadsheetStore.cells[`${sheetId}-${rowId}-${colId}`];
  // }

  tempEditValue.value = view[row]?.[col]?.value || '';



  //console.log("Safe access:", view[row][col]);
  editingKey.value = `${row}-${col}`;
};

const updateCell = (e, rowId, colId) => {
  const newValue = e.value;
  const sheetId = spreadsheetStore.activeSheetId;
  const viewId = spreadsheetStore.activeView;
  spreadsheetStore.updateCell();
  console.log(sheetId);
  console.log(viewId);
  //
}


//spreadsheetStore.views[activeView][rIdx + startIndex][cIdx].value

const hoveredCell = ref(null);

const tempEditValue = ref('');

</script>

<template>
  <div id="spreadsheet-viewport" ref="viewportRef" @scroll="onScroll"
    style="height: 600px; overflow-y: auto; position: relative;">
    <table class="table table-sm table-bordered table-striped" :style="{ transform: `translateY(${offsetY}px)` }">
      <thead>
        <tr>
          <th style="width: 160px;"> ID </th>
          <th v-for="cIdx in (visibleColCount - 1)" style="width: 160px"> Col {{ cIdx }} </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rIdx) in displayRows" :key="rIdx">

          <th scope="row" :style="{ width: CELL_WIDTH + 'px' }">{{ row + startIndex }}</th>

          <td class="table-cell p-0" v-for="(col, cIdx) in visibleColCount" style="width: 160px;">

            <div :class="{ 'cell-highlight': hoveredCell === cIdx }"
              @mouseleave="hoveredCell = null" class="cell-wrapper d-block"
              @click="handleCellClick($event, rIdx + startIndex, cIdx)">

              <input v-if="editingKey == `${rIdx + startIndex}-${cIdx}`" 
                v-model="tempEditValue"
               class="inline-editor form-control form-control-sm h-100 border-primary" />

              <span v-else>
                {{ spreadsheetStore.views[activeView]?.[rIdx + startIndex]?.[cIdx]?.value ?? '' }}
              </span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>


<style scoped>
table {
  table-layout: fixed;
}

td {
  /* min-width: 10rem; */
}

td.cell-spacer {
  width: 0 !important;
  padding-top: 0;
  padding-right: 0;
  padding-bottom: 0;

}

td.table-cell {
  width: 160px !important;
  height: 5rem !important;
}

th {
  /* min-width: 5rem; */
}

.table-cell div {
  height: 5rem;
}

input {
  background-color: transparent;
}

.cell-highlight {
  border: blue;
  border: 1rem 1rem 1rem 1rem;
}

/*
  tr {
    scroll-snap-align: start;
    scroll-margin-top: v-bind(headerHeight);
  }

  .table-responsive {
    scroll-snap-type: y mandatory;
  }
    */
</style>