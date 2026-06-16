<template>
    <Listbox :options="storedSheets" optionLabel="name" class="" filter :pt="{
        pcFilter: {
            root: {
                class: 'py-1'
            }
        },
        listContainer: {

            //class: 'h-100',
            //style: 'max-height:100%'

        }
    }">
        <template #header v-if="hasHeader">
            <div>
                <span><i class="pi pi-table"></i></span>
                <span class="h6 ms-2">Stored Sheets</span>
            </div>
        </template>


        <template #option="{ option }">
            <div class="container-fluid">
                <div class="row justify-content-between">
                    <div class="col my-auto text-start">{{ option.name }}</div>
                    <div class="col text-end pe-0">
                        <Button v-if="isSheetLink" icon="pi pi-plus" size="small" variant="text"
                            @click="$emit('sheet-linked', option.id)">
                        </Button>
                        <ButtonGroup v-else>
                            <Button size="small" icon="pi pi-download" variant="text"
                                @click="spreadsheetStore.loadSheetToWorkArea(option.id, true)"></Button>
                            <Button 
                                @click="spreadsheetStore.deleteSheetFromDB(option.id)"
                                size="small" icon="pi pi-trash" variant="text" severity="danger">
                            </Button>
                        </ButtonGroup>
                    </div>
                </div>
            </div>
        </template>

    </Listbox>
</template>
<script setup>
import { Listbox, ButtonGroup, Button, IconField, InputIcon, InputText } from 'primevue';
import { useSpreadsheetStore } from '@/stores/spreadsheet';
import { storeToRefs } from 'pinia';
import draggable from 'vuedraggable';

const props = defineProps({
    hasHeader: { type: Boolean, default: true },
    isSheetLink: { type: Boolean, default: false }
})

const spreadsheetStore = useSpreadsheetStore();

const { storedSheets, loadedSheetOrderedIds } = storeToRefs(spreadsheetStore);

const emit = defineEmits(['sheet-linked'])


</script>