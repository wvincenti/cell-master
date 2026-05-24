<script setup>
import { ref, computed, onBeforeMount, onUpdated, onMounted } from 'vue';
import { Tabs, Tab, TabList, TabPanel, DataTable, Column, InputText } from 'primevue';
import draggable from 'vuedraggable';
import { getColLabel } from '@/stores/spreadsheet';
import { useSpreadsheetStore } from '@/stores/spreadsheet';
import { storeToRefs } from 'pinia';

const spreadsheetStore = useSpreadsheetStore();

const { activeTableOrderedIds, activeTab } = storeToRefs(spreadsheetStore);
//const { activeSheetNames } = storeToRefs(spreadsheetStore);]


const props = defineProps({
    activeTab: Number,
    sheetNames: Array,
    tableData: Array,
    contHeight: Number,

});

const emit = defineEmits(['cell-edited', 'tab-select']);

const tabListRef = ref(null);
const tableHeight = computed(() => props.contHeight - tabListRef.value?.offsetHeight);

const rowLables = computed(() => props.tableData?.map((row, i) => {
    return { index: i, label: getColLabel(i + 1) };
}))

const oldInputValue = ref(null);

const testModel = ref([
    { id: '0', name: 'Header I', content: 'Content 1' },
    { id: '1', name: 'Header II', content: 'Content 2' },
    { id: '2', name: 'Header III', content: 'Content 3' }
]);

// props.sheetNames.forEach((s) => { testModel.value.push(s) })

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

    const [col, valueField] = field.split('.');

    const editedCell = props.tableData[e.index][col];
    console.log(editedCell);
    if (editedCell[valueField] != oldInputValue.value) {
        spreadsheetStore.patchCellState(editedCell, {cell_value: oldInputValue.value})
        //emit('cell-edited', oldInputValue.value, e.index, col, props.activeTab, editedCell.sheet_id);
    }
    // emit('cell-edited', oldInputValue.value, e.index, col, props.activeTab, editedCell.sheet_id);
    oldInputValue.value = '';
}

function onCellInit(e) {
    let { data, field } = e;
    let [col, value] = field.split('.');
    oldInputValue.value = data[col]['cell_value'];
}

const onElementDragged = (event) => {
  // Vue Draggable fires a "moved" object containing old/new index positions
  if (event.moved) {
    const { oldIndex, newIndex } = event.moved;

    console.log('ACTIVE TAB: '+ activeTab.value)

    if (activeTab.value == oldIndex) {
      // Scenario A: The user directly dragged the ACTIVE tab -> update its index to the new drop target
      spreadsheetStore.setActiveTab(newIndex);
      emit('tab-select', newIndex);
    } 
    else if (oldIndex < activeTab.value && newIndex >= activeTab.value) {
      // Scenario B: An item was dragged from behind the active tab to in front of it -> shift active index down
      spreadsheetStore.setActiveTab(activeTab.value - 1); 
      emit('tab-select', activeTab.value);

    } 
    else if (oldIndex > activeTab.value && newIndex <= activeTab.value) {
      // Scenario C: An item was dragged from in front of the active tab to behind it -> shift active index up
      spreadsheetStore.setActiveTab(activeTab.value + 1);
      emit('tab-select', activeTab.value);
    }
  }
}

</script>

<template>
    <Tabs :value="activeTab" scrollable>
        <TabList asChild>
            <draggable @change="onElementDragged" tag="div" v-model="activeTableOrderedIds" item-key="id">
                <template #item="{ element, index }">
                    <Tab :pt="{ root: { class: 'py-2' } }" :value="index" @click="$emit('tab-select', index)">
                        {{ sheetNames[index] }}
                    </Tab>
                </template>
            </draggable>
        </TabList>
        <TabPanels :pt="{ root: { class: 'p-0' } }">
            <TabPanel :value="activeTab">
                <DataTable @cell-edit-init="onCellInit" @cell-edit-complete="onCellEditComplete" edit-mode="cell"
                    :value="tableData" size="small" tableStyle="min-width: 50rem" showGridlines scrollable
                    :scrollHeight="`${tableHeight}px`" :pt="{
                        table: { style: 'min-width: 50rem' },
                        column: {
                            bodycell: ({ state }) => ({
                                class: [{ 'p-0': state['d_editing'] }]
                            })
                        }
                    }">
                    <Column frozen>
                        <template #body="rowLables">
                            <span>{{ rowLables.index }}</span>
                        </template>
                    </Column>
                    <Column v-for="(cols, i) in tableData?.[0]" :header="`${rowLables[i].label}`"
                        :field="`${i + '.cell_value'}`" style="min-width: 10rem;">
                        <template #editor="{ data, field }">
                            <InputText v-model="oldInputValue" class="h-100 w-100 border-0 rounded-0"></InputText>
                        </template>
                    </Column>
                </DataTable>
            </TabPanel>
        </TabPanels>
    </Tabs>
</template>

<style scoped></style>