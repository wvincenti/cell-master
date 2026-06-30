<script setup>
import { ref } from 'vue';
import { Splitpanes, Pane } from 'splitpanes';
import GridContainer from '../gridview/GridContainer.vue';
import DashboardContainer from '../navigatorview/DashboardContainer.vue';
import ToolsContainer from '../toolview/ToolsContainer.vue';
import { useSpreadsheetStore } from '@/stores/spreadsheet.js';
import { storeToRefs } from 'pinia';

const spreadsheetStore = useSpreadsheetStore()

function handleResized(event) {
  
  const height = event.prevPane.el.clientHeight
  console.log(height)

  spreadsheetStore.setMainTableHeight(height)
  
}
</script>

<template>
  <div class="pane-wrapper bg-secondary">
    <splitpanes class="main-layout default-theme bg-secondary">
      <pane size="30" max-size="30" class="bg-black">
        <DashboardContainer @add-sheet="() => { console.log('event recieved') }"></DashboardContainer>
      </pane>
      <pane>
        <!-- <GridContainer @table-resized="handleResized" :isTableResized="isTableResized"></GridContainer>
        <ToolsContainer></ToolsContainer> -->
        <splitpanes horizontal class="default-theme main-layout" @resized="handleResized">
          <pane class="bg-secondary" size="70" max-size="100" min-size="0">
            <GridContainer></GridContainer>
          </pane>
          <pane size="30">
            <ToolsContainer></ToolsContainer>
          </pane>
        </splitpanes>
      </pane>
    </splitpanes>
  </div>
</template>