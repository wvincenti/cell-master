<script setup>
import { useSpreadsheetStore, getColLabel } from '@/stores/spreadsheet';
import TableNavigator from './TableNavigator.vue';
import { onMounted, computed, ref, watch, provide } from 'vue';
import TreeMenuRenderer from './TreeMenuRenderer.vue';
import VueTreeDnd from 'vue-tree-dnd'
import TreeMenuWrapper from './TreeMenuWrapper.vue';
import SheetMenuWrapper from './SheetMenuWrapper.vue';
import router from '@/router';


const spreadsheetStore = useSpreadsheetStore()

const expandedKeys = ref({});

const tabIndex = computed(() => spreadsheetStore.cellTables.length);

const navigator = ref([]);

const sheetMenu = computed(() => [
    {
        label: 'Sheets',
        icon: 'pi pi-table',
        items: spreadsheetStore.sheets.map((sheet) => {
            return {
                label: sheet.name,
                icon: 'pi pi-plus'
            }
        })
    }
])

provide('addSheet', addSheet);
provide('deleteSheet', deleteSheet);
provide('updateName', spreadsheetStore.updateName);

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


const newNavigator = spreadsheetStore.sheets.map((sheet) => {
    return {
        id: sheet.id,
        name: sheet.name,
        cols: sheet.cols.map((col) => { col.id, col.name })
    }
})

// Now, when you update expandedKeys, the navigator will still be reactive 
// because it's a ref being watched or updated.
function handleSetExpanded(id, isExpanded) {
    // Manually sync the local ref so the UI reflects the change
    const node = navigator.value.find(n => n.id === id);

    if (node) node.expanded = isExpanded;
}

onMounted(async () => {
    try {
        await spreadsheetStore.fetchSheetSchema();
        console.log(spreadsheetStore.sheets);
    } catch (e) {
        console.log(e.code)
        if (e.status === 401) return router.push('/login');
        console.error(e)
    }
})

async function addSheet(id) {
    console.log('ADDING SHEET!')
    console.log(id);
    const sheet = await spreadsheetStore.fetchCells(id);
    console.log('sheet is: ' + sheet);
    let newIdx = spreadsheetStore.addEmptySheet();
    // spreadsheetStore.cellTables()
    sheet.forEach((row, i) => {
        console.log(row)
        const tRow = spreadsheetStore.cellTables[newIdx][i];
        console.log(tRow);
        for (const col in row) {
            if (Object.hasOwn(tRow, col)) {
                console.log(col);
                spreadsheetStore.cellTables[newIdx][i][col] = row[col];
            }
        }

        console.log(row);
    })
    spreadsheetStore.setActiveTab(newIdx);
}

async function deleteSheet(sheetId) {
    try {
        const response = await spreadsheetStore.deleteSheetFromDB(sheetId);
        console.log(response);
        if (response.status == 200) {
            // make it a store action ****
            spreadsheetStore.removeSheetFromStore(sheetId);
        }
    } catch (err) {
        console.log(err);
    }
}


function moveHandler(movM) {
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
                <VueTreeDnd @add-sheet="() => { console.log('event recieved') }" @move="moveHandler"
                    @setExpanded="handleSetExpanded" @rename="(arg1, arg2, arg3) => console.log('renaming')"
                    :component="TreeMenuRenderer" v-model="navigator">
                </VueTreeDnd>
            </div>
        </div>
        <div class="row">
            <div class="col p-1">
                <!-- <TreeMenuWrapper :sheets="newNavigator"></TreeMenuWrapper> -->
                <!-- <TableNavigator @add-sheet="addSheet" :navigator="navigator"></TableNavigator> -->
                <SheetMenuWrapper :menu="sheetMenu"></SheetMenuWrapper>

            </div>
        </div>
    </div>
</template>