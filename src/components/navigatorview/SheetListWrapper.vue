<template>
    <Listbox :options="storedSheets" optionLabel="name" filter :pt="{
        pcFilter: {
            root: {
                class: 'py-1'
            }
        }
    }">
        <template #header>
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
                        <ButtonGroup>
                            <Button size="small" icon="pi pi-download" variant="text" @click="spreadsheetStore.fetchSheetCells(option.id)"></Button>
                            <Button size="small" icon="pi pi-trash" variant="text" severity="danger"></Button>
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

const spreadsheetStore = useSpreadsheetStore();

const { storedSheets } = storeToRefs(spreadsheetStore);
</script>