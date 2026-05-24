<script setup>
import { ref } from 'vue';
import { Splitpanes, Pane } from 'splitpanes';
import GridContainer from '../gridview/GridContainer.vue';
import DashboardContainer from '../navigatorview/DashboardContainer.vue';
import ToolsContainer from '../toolview/ToolsContainer.vue';

const isTableResized = ref(false);

function handleResize(){
  isTableResized.value = true;
  console.log('resized')
  console.log(isTableResized.value)
}

function handleResized(){
  isTableResized.value = false;
  console.log('table resized: '+ isTableResized)
}
</script>

<template>
<div class="pane-wrapper bg-secondary">
    

    <splitpanes class="main-layout default-them bg-secondary">
      <pane size="30" max-size="30" class="bg-black">
        <DashboardContainer @add-sheet="() => { console.log('event recieved') }"></DashboardContainer>
      </pane>
      <pane>
        <splitpanes horizontal class="default-theme main-layout"  @resized="handleResize">
          <pane class="bg-secondary" size="70" max-size="100" min-size="0">
            <GridContainer @table-resized="handleResized" :isTableResized="isTableResized"></GridContainer>
          </pane>
          <pane size="30">
            <ToolsContainer></ToolsContainer>
          </pane>
        </splitpanes>
      </pane>
    </splitpanes>
  </div>
</template>