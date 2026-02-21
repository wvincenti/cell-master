<script setup>
import { getColLabel, useSpreadsheetStore } from '@/stores/spreadsheet';
import { onBeforeUpdate, onMounted, onUnmounted, ref } from 'vue';
import { computed } from 'vue';

const spreadsheetStore = useSpreadsheetStore();

const props = defineProps({
  //cols: { type: Number, default: 27 },
  rows: { type: Number, default: 12 },
  tableId: { type: Number, default: null },
  sheet: { type: Object, default: {} },
  viewIdx: { type: Number, default: 0 },
  //idx: { type: Number, default: 0 },
  data: {type: Array, default: []}
})


// const viewIdx = computed(() => {
//   return spreadsheetStore.activeView;
// }) 

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

const CELL_WIDTH = 10; // Fixed width for now
const CELL_HEIGHT = 4;
const ROW_ID_WIDTH = 2;
const scrollLeft = ref(0);

const remPixels = parseFloat(getComputedStyle(document.documentElement).fontSize);

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

// const displayCols = computed(() => {
//   const start = startColIndex.value;
//   const end = start + visibleColCount.value + 2; // +2 for "over-scanning" buffer


//   const result = [];
//   const length = end - start;
//   for (let i = 0; i < length; i++) {
//     const idx = start + i;
//     if (idx < spreadsheetStore.totalColsCount) {
//       result.push(idx);
//     }
//   }
//   console.log(result);
//   return result;
// });
onBeforeUpdate(() => {
  console.log('about to update gid n: '+props.viewIdx);
})

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
  return Math.floor((scrollTop.value / (CELL_HEIGHT*remPixels)));
});

// We need this to keep the scrollbar at the right "size"
const totalHeight = computed(() => {
  return spreadsheetStore.views[activeView].length * rowHeight;
});

const offsetY = ref(0);

const onScroll = (e) => {
  scrollTop.value = e.target.scrollTop;
  console.log(scrollTop.value)
  // Move the table so it starts exactly at the top of the first visible row
  offsetY.value = Math.floor(scrollTop.value / rowHeight) * rowHeight;
  //scrollLeft.value = e.target.scrollLeft;
};

// 1. Add a 'currentlyEditing' state
const editingKey = ref(''); // format: "row-col"

const addCellToView = (viewId, x, y, cellKey) => {

  console.log(cellKey);
  const view = spreadsheetStore.views[viewId];

  const cellId = cellKey.split('-');
  console.log(cellId);

  if (!spreadsheetStore.cells?.[cellKey]) spreadsheetStore.updateCell(cellId[0], cellId[1], cellId[2], '');

  // const rowId = row + 1
  // const colId = col + 1

  console.log('cell updated');


  console.log(x);
  console.log(y);

  console.log('VIEWS: ')
  console.log(spreadsheetStore.views);

  if (view[x] == null) view[x] = [];
  if (view[x]?.[y] == null) {
    view[x][y] = spreadsheetStore.cells[cellKey];
    console.log(view[x][y]);
    console.log(view[x]);
  }

  setTimeout(() => {
    editingKey.value = `${x}-${y}`;
  }, 0);

}

const handleFocusout = (e, x, y) => {

  console.log(startIndex.value);
  console.log('accessing: '+x+'-'+y)
  let inputValue = spreadsheetStore.views[props.viewIdx]?.[x]?.[y]?.value;
  console.log(inputValue);
  if (!inputValue) inputValue = '';

  spreadsheetStore.checkDirtyCell(props.viewIdx, x, y);
  tempEditValue.value = '';
  //spreadsheetStore.views[activeView]?.[rIdx + startIndex]?.[cIdx].value = tempEditValue.value;

}

const viewInputIdx = ref(null);

const handleCellClick = (e, row, col) => {
  viewInputIdx.value = props.viewIdx;
  console.log('row Id: ')
  console.log(row);

  focusedRowIdx.value = row;

  //look into view ranges
  const sheetId = spreadsheetStore.activeSheetId;
  //const viewId = spreadsheetStore.activeView;


  console.log("VIEW: ");
  const view = spreadsheetStore.views[props.viewIdx];
  console.log(view);

  const rowId = row + 1
  const colId = col + 1

  console.log(sheetId);
  console.log(rowId);
  console.log(colId);

  //spreadsheetStore.updateCell(sheetId, rowId, colId, '');
  console.log('cell updated')
  addCellToView(props.viewIdx, row, col, sheetId + '-' + rowId + '-' + colId);

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

const vFocus = {
  mounted: (el) => {
    // We use a tiny timeout or nextTick to ensure the 
    // browser is ready to accept focus on the new element
    setTimeout(() => {
      el.focus();
      if (el instanceof HTMLInputElement) {
        el.select(); // This selects the text so the user can type over it
      }
    }, 0);
  }
};

const focusedRowIdx = ref(null);



</script>

<template>
  <div id="spreadsheet-viewport" ref="viewportRef" @scroll="onScroll"
    style="overflow-y: scroll; position: relative; max-height: 100%;">
    <table class="table table-sm table-bordered table-striped" :style="{ transform: `translateY(${offsetY}px)` }">
      <thead>
        <tr class="table-dark">
          <th class="row-id col-id text-center "> </th>
          <th v-for="cId in (visibleColCount - 1)" class="col-id text-center lead"> {{ getColLabel(cId) }} </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rIdx) in displayRows" :key="`row-${rIdx + startIndex}`">
          <th scope="row" class="row-id table-dark text-center align-middle lead" v-html="row + startIndex" :key="`${viewIdx}-${rIdx+startIndex}-id`">
          </th>

          <td 
            class="table-cell p-0" v-for="(col, cIdx) in visibleColCount" :style="{ width: CELL_WIDTH + 'rem' }"
            :key="`${viewIdx}-${rIdx+startIndex}-${cIdx}`"
            :class="{ 'table-warning': spreadsheetStore.views[viewIdx]?.[rIdx + startIndex]?.[cIdx]?.isDirty }">

            <div 
              :key="`${viewIdx}-${rIdx+startIndex}-${cIdx}-wrapper`"
              :class="{ 'cell-highlight': hoveredCell === cIdx }" @mouseleave="hoveredCell = null"
              class="cell-wrapper d-block" @click="handleCellClick($event, rIdx + startIndex, cIdx)">

              <input v-focus v-if="editingKey == `${rIdx + startIndex}-${cIdx}` && viewInputIdx == viewIdx"
                :key="`${viewIdx}-${rIdx}-${cIdx}-input`"
                v-model="spreadsheetStore.views[viewIdx][rIdx + startIndex][cIdx].value"
                @blur="handleFocusout($event, focusedRowIdx, cIdx)"
                class="inline-editor form-control form-control-sm h-100 border-warning rounded-0" />

              <span v-else :key="`${viewIdx}-${rIdx}-${cIdx}-span`">
                {{ spreadsheetStore.views?.[viewIdx]?.[rIdx + startIndex]?.[cIdx]?.value ?? '' }}
              </span>
            </div>

          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>


<style scoped>
.form-control:focus {
  box-shadow: none;
}

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
  width: v-bind('CELL_WIDTH + "rem"');
  height: v-bind('CELL_HEIGHT+"rem"');
}

th {
  /* min-width: 5rem; */
  width: v-bind('CELL_WIDTH + "rem"');
}


.table-cell div {
  height: 100%;
}

input {
  background-color: transparent;
}

.cell-highlight {
  border: blue;
  border: 1rem 1rem 1rem 1rem;
}

th.row-id {
  width: v-bind('ROW_ID_WIDTH + "rem"');
  font-size: small;
}

.col-id {
  height: 0.5px !important;
  font-size: small;

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