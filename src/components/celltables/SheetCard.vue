<script setup>
import { ref } from 'vue';
import { onMounted } from 'vue';
import ListGroupItem from './ListGroupItem.vue';
import { useSpreadsheetStore } from '@/stores/spreadsheet';

const spreadsheetStore = useSpreadsheetStore()

// Now you can use store.fetchCells() or store.cells
onMounted(async () => {
  try {
    // const cells = await spreadsheetStore.fetchCells()
    // console.log(cells)
    await spreadsheetStore.fetchSheetSchema();
    console.log(spreadsheetStore.sheets);
  } catch (error) {
    console.error(error)
  }
})

const inputRef = ref(null);

function update(sheetId) {

}

const startEdit = async () => {
    isEditing.value = true

    // Wait for Vue to finish rendering the input into the DOM
    await nextTick()

    // Now that it exists, focus it
    inputRef.value.focus()
}

const inputChangeOnOver = () => {

}

</script>

<template>
    <div class="col-6">
        <div class="card">
            <div class="card-body">
                <div class="card-title">Sheets</div>
                <div class="card-subtitle"></div>
                <div class="list-group">
                    <ListGroupItem v-for="(sheet, key, index) in spreadsheetStore.sheets" :key="key"
                    v-if="!spreadsheetStore.loading && Object.keys(spreadsheetStore.sheets).length > 0"
                    :sheet="sheet"
                    :sheetKey="key">
                    </ListGroupItem>
                </div>
            </div>
        </div>
    </div>

</template>