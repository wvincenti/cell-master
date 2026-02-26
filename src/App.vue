<script setup>
import { useSpreadsheetStore } from '@/stores/spreadsheet'; // '@' starts at /src
import { useDbStore } from './stores/dbview';
import { onMounted, computed } from 'vue';
import { ref } from 'vue';
//import { Splitpanes, Pane } from 'splitpanes';

import { Splitpanes, Pane } from 'splitpanes';
import GridContainer from './components/gridview/GridContainer.vue';
import CellTablesContainer from './components/celltables/CellTablesContainer.vue';
import ViewContainer from './components/tableviews/ViewContainer.vue';
import ToolbarWrapper from './components/gridview/ToolbarWrapper.vue';
import TableNavigator from './components/gridview/TableNavigator.vue';
import HeaderContainer from './components/header/HeaderContainer.vue';
import { Menubar } from 'primevue';
import DashboardContainer from './components/gridview/DashboardContainer.vue';
// export default {
//     data(){
//       return useSpreadsheetStore()
//     }
// }


// const spreadsheetStore = useSpreadsheetStore();

// const rows = [];
// const cols = [];
// const tWidht = 10;

// for (let i = 0; i < tWidht; i++) {
//   rows[i] = i
//   for (let j = 0; j < tWidht; j++) {
//     cols[j] = j;
//   }
// }

// const headerRef = ref(null);
// const footerRef = ref(null);

// const windowHeight = ref(window.innerHeight);

// const mainHeight = computed(() => {
//   return windowHeight.value - headerRef.value?.offsetHeight - footerRef.value?.offsetHeight;
// })



// //headerHeight.value = headerRef.value;


// onMounted(() => {
//   console.log(headerRef.value.offsetHeight);
//   console.log("WINDOW:");
//   console.log(windowHeight);
//   spreadsheetStore.addEmptySheet();
// });
const isTableResized = ref(false);

</script>

<template>



  <div class="pane-wrapper">
    <HeaderContainer></HeaderContainer>
    <splitpanes class="main-layout default-theme">
      <pane size="30" max-size="30" class="bg-black">
        <DashboardContainer></DashboardContainer>
      </pane>
      <pane>
      <splitpanes horizontal class="default-theme main-layout" @resized="() => isTableResized = true">

        <pane size="70" max-size="100" min-size="0">
          
          <GridContainer></GridContainer>
        </pane>
        <pane size="30">
          <div style="overflow: auto;" class="container-fluid h-100">
            <div class="row">
              <div class="col-12 px-0">
                <ToolbarWrapper></ToolbarWrapper>
              </div>
            </div>
            <!-- <div class="row px-0">
              <div ref="paneRef" class="col-6">
                <CellTablesContainer></CellTablesContainer>
              </div>
              <div class="col-6">
                <ViewContainer></ViewContainer>
              </div>
            </div> -->
          </div>
        </pane>
      </splitpanes>
      </pane>
    </splitpanes>
  </div>
  <footer ref="footerRef" class="text-center align-middle bg-dark text-light"
    style="font-size: xx-small; height: 1rem;">
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
  height: calc(100vh - 3rem);
}

/* header {
  height: 3% !important;
}

footer {
  height: 2% !important;
} */

/* <header ref="headerRef" class="text-center bg-dark text-light lead" style="height: 2rem;">CELL MASTER</header> */
</style>