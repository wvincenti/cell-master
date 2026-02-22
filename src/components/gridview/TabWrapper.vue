<script setup>
import { ref, computed, onBeforeMount, onUpdated, onMounted } from 'vue';
import { useSpreadsheetStore } from '@/stores/spreadsheet';
import TableWrapper from './TableWrapper.vue';
import { Tabs, Tab, TabList, TabPanel, DataTable, Column } from 'primevue';

const props = defineProps({
    activeTab: Number,
    sheetCount: Number,
    tableData: Array,
    contHeight: Number,
})

const tabListRef = ref(null);

const tableHeight = computed(() => props.contHeight - tabListRef.value?.offsetHeight);



const rowLables = computed(() => props.tableData.map((row, i) => {
    return { index: i };
}))

onUpdated(() => {
    console.log('updating TabWrapper... active tab is: ' + props.activeTab);
    console.log(rowLables.value);

})

// onMounted(() => {
//     tableHeight.value = props.contHeight - tabListRef.value?.offsetHeight
// })

const onRootMounted = (el) => {
    tabListRef.value = el;
    console.log(tabListRef.value);
};

function getColLabel(n) {
    if (n < 1) {
        return 'ID'
    }
    let label = ''
    while (n > 0) {
        let rem = (n - 1) % 26
        label = String.fromCharCode(65 + rem) + label
        n = Math.floor((n - 1) / 26)
    }
    return label
}




</script>

<template>
    <Tabs :value="activeTab" scrollable>
        <TabList :pt="{ root: { onVnodeMounted: (vnode) => onRootMounted(vnode.el) } }">
            <Tab :pt="{ root: { class: 'py-2' } }" v-for="(cTable, idx) in sheetCount" :key="'tab-btn-' + idx"
                :value="idx" @click="$emit('tabSelect', idx)">
                {{ 'View ' + idx }}
            </Tab>
        </TabList>
        <TabPanels :pt="{ root: { class: 'p-0' } }">
            <TabPanel :value="activeTab">
                <DataTable :value="tableData" 
                    tableStyle="min-width: 50rem" 
                    showGridlines
                    scrollable
                    :scrollHeight="`${tableHeight}px`"
                    :pt="{bodycell: {class: 'p-0'} }" :pt-options="{ mergeProps: true }">
                    <Column>
                        <template #body="rowLables">
                            <span>{{ rowLables.index }}</span>
                        </template>
                    </Column>
                    <template v-for="(cols, i) in tableData?.[0]">
                        <Column :header="`${i}`" :field="`${i}`" style="min-width: 10rem;">
                        </Column>
                    </template>
                </DataTable>
            </TabPanel>
        </TabPanels>
    </Tabs>
</template>

<style scoped></style>