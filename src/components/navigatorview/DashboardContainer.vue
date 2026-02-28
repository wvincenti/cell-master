<script setup>
import { useSpreadsheetStore, getColLabel } from '@/stores/spreadsheet';
import TableNavigator from './TableNavigator.vue';
import { onMounted, computed, ref, watch, provide } from 'vue';
import TreeMenuRenderer from './TreeMenuRenderer.vue';
import VueTreeDnd from 'vue-tree-dnd'

const spreadsheetStore = useSpreadsheetStore()

const expandedKeys = ref({});

const tabIndex = computed( () => spreadsheetStore.cellTables.length);

const navigator = ref([]);

provide('addSheet', addSheet);

// Watch the store for changes and update the local navigator ref
watch(() => spreadsheetStore.sheets, (newSheets) => {
    navigator.value = newSheets?.map((sheet, index) => {
        return {
            id: `${sheet.id}`,
            name: sheet.name || 'Sheet ' + sheet.id,
            type: 'table',
            // Use the local expanded state
            expanded: expandedKeys.value[sheet.id] || false, 
            children: sheet.cols?.map((col) => ({
                id: `${sheet.id}-${index}-${col.id}`,
                name: col.name || getColLabel(col.id),
                expanded: false,
                children: [],
                type: 'col'
            })),
  
            showAdd: true,
            index: index, // Use the actual index
        };
    });
}, { immediate: true, deep: true });

// Now, when you update expandedKeys, the navigator will still be reactive 
// because it's a ref being watched or updated.
function handleSetExpanded(id, isExpanded) {
    // expandedKeys.value[depth][id] = isExpanded;
    
    // Manually sync the local ref so the UI reflects the change
    const node = navigator.value.find(n => n.id === id);

    if (node) node.expanded = isExpanded;

    // function findChildNode(depth, level){
    //     if(depth == level)
    //     {
            
    //     }
    // }
}

// const navigator = computed(() => {
//     const sheets = spreadsheetStore.sheets;
//         return sheets.map((sheet, index) => {
//             return {
//                 name: sheet.name || 'Sheet ' + sheet.id,
//                 expanded: expandedKeys.value?.[sheet.id],
//                 children: sheet.cols.map((col) => { 
//                     return {
//                         id:`${sheet.id}-${index}-${col.id}`, 
//                         name: col.name || getColLabel(col.id),
//                         expanded: false,
//                         children: []
//                     };
                        
//                 }),
//                 icon: 'pi pi-plus',
//                 showAdd: true,
//                 id:`${sheet.id}`,
//                 index: tabIndex.value,
//         }
//     })
// })

onMounted(async () => {
    try {

        await spreadsheetStore.fetchSheetSchema();
        console.log(spreadsheetStore.sheets);
    } catch (error) {
        console.error(error)
    }
})

async function addSheet(id) {
    console.log('ADDING SHEET!')
    console.log(id);
    const sheet = await spreadsheetStore.fetchCells(id);
    console.log('sheet is: '+sheet);
    let newIdx = spreadsheetStore.addEmptySheet();
    // spreadsheetStore.cellTables()
    sheet.forEach((row, i) => {
        console.log(row)
        const tRow =  spreadsheetStore.cellTables[newIdx][i];
        console.log(tRow);
        for (const col in row){
            if (Object.hasOwn(tRow, col)){
                console.log(col);
                spreadsheetStore.cellTables[newIdx][i][col] = row[col];
            }
        }
        
        console.log(row);
    })  
    spreadsheetStore.setActiveTab(newIdx);
}

// function handleSetExpanded(isExpanded, sheetId){

//     expandedKeys.value[sheetId] = isExpanded;
// }
function moveHandler(movM){
    console.log(movM);
    const source = navigator.value.find((sheet) => sheet.id == movM.id);
    const target = navigator.value.find((sheet) => sheet.id == movM.targetId);
    if (source.type == 'table' && target.type == 'table') target.children.push(source);


}

</script>

<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col p-1">
                <VueTreeDnd
                    @add-sheet="() => {console.log('event recieved')}"
                    @move="moveHandler"
                    @setExpanded="handleSetExpanded" :component="TreeMenuRenderer" v-model="navigator"></VueTreeDnd>
            </div>
        </div>
        <div class="row">
                        <div class="col p-1">
                <!-- <TableNavigator @add-sheet="addSheet" :navigator="navigator"></TableNavigator> -->
            </div>
        </div>
    </div>
</template>