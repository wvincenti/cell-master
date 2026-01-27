<script setup>
import TableGrid from './TableGrid.vue';
import GridControls from './GridControls.vue';
import { useSpreadsheetStore } from '@/stores/spreadsheet';
import { onMounted, ref } from 'vue'

//const activeTab = ref(blankSheetId);
const spreadsheetStore = useSpreadsheetStore();

const onLaunch = () => {
    spreadsheetStore.setMaxSheetId();
}

await onLaunch();

const addView = () => {
    spreadsheetStore.views.push([]);
    //const latestViewIdx = spreadsheetStore.views.length;
    spreadsheetStore.viewRows.push(0); 
    spreadsheetStore.setActiveView(spreadsheetStore.views.length - 1);
}

onMounted(() => {

    //const sheet = spreadsheetStore.sheets['1'];
    // spreadsheetStore.loadToView( sheet, 0);
})

const plusButtonHoverd = ref(false);

</script>

<template>
    <div class="row" style="">
        <div class="col">
            <nav>
                <div class="nav nav-tabs" role="tablist">
                    <button class="nav-link border-0">
                        <i @mouseenter="plusButtonHoverd = true" @mouseleave="plusButtonHoverd = false"
                        @click="() => addView()" class="bi bi-plus-circle-fill fs-5" :class="{'text-success': plusButtonHoverd == true}"></i>
                    </button>
                    <button 
                        class="nav-link" v-for="(sheet, idx) in spreadsheetStore.views"
                        :class="{ 'active': spreadsheetStore.activeView === idx }"
                        @click="() => spreadsheetStore.setActiveView(idx)"
                    >{{ 'View ' + idx  }}
                    </button>
                </div>
            </nav>
            <div class="tab-content">
                <div class="tab-pane fade" v-for="(sheet, idx) in spreadsheetStore.views"
                    :class="{ 'show active': spreadsheetStore.activeView === idx }">
                    <TableGrid v-if="spreadsheetStore.activeView == idx" :rows="10" :cols="26" :tableId="sheet.id"
                        :viewIdx="idx">
                    </TableGrid>
                </div>
            </div>
        </div>
    </div>
    <div class="row border bg-secondary">
        <div class="col-1">
            <input type="range" step="10" class="form-range align-middle" id="rangeInput" min="0" max="100" value="50">
        </div>
    </div>

</template>

<style scoped>
/*
.tab-content {
    overflow: scroll;
    max-height: 100%;
}
    */
</style>