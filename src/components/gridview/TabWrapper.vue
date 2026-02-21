<script setup>
import { ref, computed, onBeforeMount, onUpdated } from 'vue';
import { useSpreadsheetStore } from '@/stores/spreadsheet';
import TableWrapper from './TableWrapper.vue';
import { Tabs, Tab, TabList, TabPanel, DataTable, Column } from 'primevue';

const props = defineProps({
    activeTab: Number,
    sheetCount: Number,
    tableData: Array,
    tableHeight: Number,
})

onUpdated(() => {
    console.log('updating TabWrapper... active tab is: '+ props.activeTab)
})
</script>

<template>
    <Tabs :value="activeTab" scrollable>
        <TabList>
            <Tab v-for="(cTable, idx) in sheetCount" :key="'tab-btn-' + idx" :value="idx" @click="$emit('tabSelect', idx)">
                {{ 'View ' + idx }}
            </Tab>
        </TabList>
        <TabPanels :pt="{ root: {class: 'p-0'}}">
            <TabPanel :value="activeTab" >
                <DataTable :value="tableData" tableStyle="min-width: 50rem" scrollable :scrollHeight="`${tableHeight}px`" :virtualScrollerOptions="{ itemSize: 100 }" >
                    <Column v-for="(cols, i) in tableData?.[0]" :header="`${i}`" :field="`${i}`" style="min-width: 20rem;">
                    </Column>
                </DataTable>
            </TabPanel>
        </TabPanels>
    </Tabs>
</template>

<style scoped>

</style>