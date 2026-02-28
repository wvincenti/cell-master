<script setup>
import { ref, computed, onBeforeMount, onUpdated, onMounted } from 'vue';
import { Tabs, Tab, TabList, TabPanel, DataTable, Column, InputText } from 'primevue';
import { getColLabel } from '@/stores/spreadsheet';

const props = defineProps({
    activeTab: Number,
    sheetCount: Number,
    tableData: Array,
    contHeight: Number,
});

const emit = defineEmits(['cell-edited', 'tabSelect']);

const tabListRef = ref(null);
const tableHeight = computed(() => props.contHeight - tabListRef.value?.offsetHeight);

const rowLables = computed(() => props.tableData?.map((row, i) => {
    return { index: i, label: getColLabel(i+1)};
}))

const oldInputValue = ref(null);

onUpdated(() => {
    console.log('updating TabWrapper... active tab is: ' + props.activeTab);
    console.log(rowLables.value);

})

const onRootMounted = (el) => {
    tabListRef.value = el;
    console.log(tabListRef.value);
};

function onCellEditComplete(e) {
    console.log(e)
    let { data, field } = e;

    const [col, inputValue] = field.split('.');

    emit('cell-edited', oldInputValue.value, data[col]['row'], col);
    oldInputValue.value = '';

}

function onCellInit(e){
    let {data, field} = e;
    let [col, value] = field.split('.');
    oldInputValue.value = data[col][value];
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
                <DataTable @cell-edit-init="onCellInit" @cell-edit-complete="onCellEditComplete" 
                    edit-mode="cell" 
                    :value="tableData" size="small"
                    tableStyle="min-width: 50rem" showGridlines scrollable :scrollHeight="`${tableHeight}px`" 
                    :pt="{
                        table: { style: 'min-width: 50rem' },
                        column: {
                            bodycell: ({ state }) => ({
                                class: [{ 'p-0': state['d_editing'] }]
                            })
                        }
                    }"
                >
                    <Column>
                        <template #body="rowLables">
                            <span>{{ rowLables.index }}</span>
                        </template>
                    </Column>
                    <Column v-for="(cols, i) in tableData?.[0]" :header="`${i}`" :field="`${i + '.value'}`"
                        style="min-width: 10rem;">
                        <template #editor="{ data, field }">
                            <InputText v-model="oldInputValue" class="h-100 w-100 border-0 rounded-0"></InputText>
                        </template>
                    </Column>
                </DataTable>
            </TabPanel>
        </TabPanels>
    </Tabs>
</template>

<style scoped>

</style>