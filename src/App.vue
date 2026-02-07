<script setup>
import { useSpreadsheetStore } from '@/stores/spreadsheet'; // '@' starts at /src
import { useDbStore } from './stores/dbview';
import { onMounted } from 'vue';
import { ref } from 'vue';
import { Splitpanes, Pane } from 'splitpanes';

import GridContainer from './components/gridview/GridContainer.vue';
import CellTablesContainer from './components/celltables/CellTablesContainer.vue';
import ViewContainer from './components/tableviews/ViewContainer.vue';



const rows = [];
const cols = [];
const tWidht = 10;

for (let i = 0; i < tWidht; i++) {
  rows[i] = i
  for (let j = 0; j < tWidht; j++) {
    cols[j] = j;
  }
}

const headerRef = ref(null);
const footerRef = ref(null);
const mainHeight = ref(0);

//headerHeight.value = headerRef.value;


onMounted(() => {
  console.log(headerRef.value.offsetHeight);

  const windowHeight = window.innerHeight;

  mainHeight.value = windowHeight - headerRef.value.offsetHeight - footerRef.value.offsetHeight;

  console.log("WINDOW:");
  console.log(windowHeight);
});

</script>

<template>

  <header ref="headerRef" class="text-center bg-dark text-light lead">CELL MASTER</header>
  <div class="pane-wrapper" :style="{height: mainHeight+'px !important'}">
    <splitpanes horizontal class="default-theme main-layout" @resized="onPaneResized">
      <pane>
        <Suspense>
          <div id="grid-view-container" class="container-fluid h-100 d-flex flex-column">
            <GridContainer></GridContainer>
          </div>
        </Suspense>
      </pane>
      <pane>
        <div class="container-fluid h-100">
          <div class="row px-0">
            <div class="col-6">
              <CellTablesContainer></CellTablesContainer>
            </div>
            <div class="col-6">
              <ViewContainer></ViewContainer>
            </div>
          </div>
        </div>
      </pane>
    </splitpanes>
  </div>
  <footer ref="footerRef" class="text-center bg-dark text-light">
    by wvvincenti
  </footer>


</template>


<style scoped>
.splitpanes--horizontal,
.splitpanes--vertical {
  display: flex;
  width: 100% !important;
  height: 100% !important;
}

/* Ensure the pane content doesn't overflow hiddenly */
.splitpanes__pane {
  display: flex;
  flex-direction: column;
  /* This helps children like .container-fluid fill the height */
}

.main-layout {
  flex-grow: 1;
  height: 100% !important;
  /* Forces the flexbox to calculate the height based on available space */

}

.pane-wrapper {
  height: 95% !important;
}

/* header {
  height: 3% !important;
}

footer {
  height: 2% !important;
} */
</style>