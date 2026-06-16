<template>
    <draggable 
        class="list-group" 
        tag="ul" v-model="loadedSheetOrderedIds" 
        item-key="id"
        ghost-class="drop-between-placeholder"
        :move="handleMove"
        @end="clearHoverState"
    >
        <template #item="{ element }">
            <li class="list-group-item list-group-item-action px-0 py-2">
                <div class="container-fluid">
                    <div class="row">
                        <div class="col-10">
                            <Inplace :pt="{
                                //root: 'p-0 my-custom-class',
                                display: 'py-0 px-1',
                                content: 'py-0 px-1'
                            }
                                ">
                                <template #display>
                                    {{ sheets.get(element)?.name }}
                                </template>
                                <template #content="{ closeCallback }">
                                    <span class="">
                                        <InputText pt:root:class="py-0" v-model="sheets.get(element).name" autofocus />
                                        <Button pt:root:class="p-0" icon="pi pi-times" size="small" text
                                            severity="danger" @click="closeCallback" />
                                    </span>
                                </template>
                            </Inplace>
                        </div>
                        <div class="col-2">
                          <Button size="small" icon="pi pi-link" variant="text"
                            @click="selectLinkSheet(element)"></Button>
                        </div>
                    </div>
                    <div class="row" v-if="selectedSheetId == element">
                      <div class="col">
                        <SheetListWrapper @sheet-linked="addSheetLink($event, element)" :isSheetLink="true" :hasHeader="false"></SheetListWrapper>
                      </div>
                    </div>
                </div>


            </li>
        </template>
    </draggable>
</template>
<style scoped>
.list-item {
  transition: all 0.15s ease;
  padding: 10px;
  list-style: none;
}

/* CASE 1: Dropping BETWEEN items (The Placeholder)
  We collapse the placeholder's height/background and give it a strong top border 
  so it looks like a clean "insert here" indicator line between your tabs/items.
*/
.drop-between-placeholder {
  background: transparent !important;
  border-top: 3px solid #3b82f6 !important; /* Smooth blue insertion line */
  border-bottom: none !important;
  border-left: none !important;
  border-right: none !important;
  height: 0px !important;
  padding: 0 !important;
  margin: 0 !important;
  overflow: hidden;
}

/* CASE 2: Hovering DIRECTLY OVER another item (Stacking/Nesting)
  This styles the actual element sitting underneath the floating cursor.
*/
.drop-on-top-highlight {
  background-color: rgba(59, 130, 246, 0.15) !important; /* Full body highlight tint */
  outline: 2px solid #3b82f6 !important; /* Wrapped border feedback */
  border-radius: 4px;
}
</style>
<script setup>
import draggable from 'vuedraggable'
import { useSpreadsheetStore } from '@/stores/spreadsheet';
import { storeToRefs } from 'pinia';
import { Inplace, InputText, Button } from 'primevue';
import { ref } from 'vue'
import SheetListWrapper from './SheetListWrapper.vue';

const spreadsheetStore = useSpreadsheetStore();

const { loadedSheetOrderedIds, sheets } = storeToRefs(spreadsheetStore);


const hoveredOverId = ref(null)

const handleMove = (evt) => {
  // evt.relatedContext.element gives us the item directly under the mouse pointer
  const targetElementId = evt.relatedContext.element

  if (targetElementId) {
    hoveredOverId.value = targetElementId
  } else {
    hoveredOverId.value = null
  }
  
  // Return true to allow the drag action to continue normally
  return true
}

// Reset the hover state completely when the user releases the mouse
const clearHoverState = () => {
  hoveredOverId.value = null
}

const selectedSheetId = ref(null);

function selectLinkSheet(id){
  if (selectedSheetId.value == id) selectedSheetId.value = null;
  else selectedSheetId.value = id;
}


function addSheetLink(linkedId, sheetId){
  console.log('adding!!!')

    const sheetPointer = spreadsheetStore.sheets.get(sheetId)

    const linkedIds = new Set([...sheetPointer.linked_sheet_ids, linkedId]);

    spreadsheetStore.patchSheetState(sheetPointer, {linked_sheet_ids: Array.from(linkedIds)})

    console.log(spreadsheetStore.sheets.get(sheetId));
}
</script>