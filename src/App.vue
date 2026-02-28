<script setup>
import { ref } from 'vue';
import { Splitpanes, Pane } from 'splitpanes';
import GridContainer from './components/gridview/GridContainer.vue';
import HeaderContainer from './components/header/HeaderContainer.vue';
import DashboardContainer from './components/navigatorview/DashboardContainer.vue';
import ToolsContainer from './components/toolview/ToolsContainer.vue';

const isTableResized = ref(false);

</script>

<template>



  <div class="pane-wrapper">
    <HeaderContainer></HeaderContainer>
    <splitpanes class="main-layout default-theme">
      <pane size="30" max-size="30" class="bg-black">
        <DashboardContainer @add-sheet="() => { console.log('event recieved') }"></DashboardContainer>
      </pane>
      <pane>
        <splitpanes horizontal class="default-theme main-layout" @resized="() => isTableResized = true">
          <pane size="70" max-size="100" min-size="0">
            <GridContainer></GridContainer>
          </pane>
          <pane size="30">
            <ToolsContainer></ToolsContainer>
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
</style>