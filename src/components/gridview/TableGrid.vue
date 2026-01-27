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

const activeView = spreadsheetStore.activeView;

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

</script>

<template>
  <div id="spreadsheet-viewport" ref="viewportRef" @scroll="onScroll"
    style="height: 600px; overflow-y: auto; position: relative;">
    <table class="table table-sm table-warning" style="position: absolute; top: 0; left: 0;"
      :style="{ transform: `translateY(${offsetY}px)` }">
      <thead  style="position: absolute; top: 0; z-index: 20; background: white;">
        <tr>
          <td class="cell-spacer" :style="{ paddingLeft: (startColIndex * CELL_WIDTH) + 'px !important' }" style="border: none; width: 0px;"></td>
          <th style="position: sticky; left: 0; z-index: 30; width: 160px;"> # </th> 
          <th v-for="cIdx in (visibleColCount - 1)" style="width: 160px"> Col {{ cIdx }} </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rIdx) in displayRows" :key="rIdx">
          <td class="cell-spacer" :style="{ paddingLeft: (startColIndex * CELL_WIDTH) + 'px !important' }" style="border: none; width: 0px;"></td>
          <th scope="row" :style="{width: CELL_WIDTH + 'px' }">{{ row + startIndex }}</th>
          <td class="table-cell" v-for="(col, cIdx) in visibleColCount" style="width: 160px;">
            {{ spreadsheetStore.views[activeView][rIdx + startIndex]?.[cIdx]?.value ?? '' }}
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
}

th {
  /* min-width: 5rem; */
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