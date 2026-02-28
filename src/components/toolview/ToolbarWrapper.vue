<script setup>
import { Toolbar, Button, IconField, InputIcon, InputText } from 'primevue';
import { useSpreadsheetStore } from '@/stores/spreadsheet';
import { onUpdated} from 'vue';

defineEmits(['addEmptySheet', 'saveActiveSheet'])

const spreadsheetStore = useSpreadsheetStore();

onUpdated(() => {
    console.log('updating ToolbarWrapper')
})

</script>
<template>
    <Toolbar :pt="{root: {class: 'py-1'}}">
        <template #start>
            <Button @click="spreadsheetStore.addEmptySheet" icon="pi pi-plus" class="mr-2 " severity="secondary" text />
            <Button @click="$emit('saveActiveSheet')" icon="pi pi-save" class="mr-2 " severity="secondary" text />
            <Button icon="pi pi-upload" class="" severity="secondary" text />
        </template>

        <template #center>
            <IconField>
                <InputIcon>
                    <i class="pi pi-search" />
                </InputIcon>
                <InputText size="small" placeholder="Search" />
            </IconField>
        </template>

        <template #end>
           
        </template>
    </Toolbar>
</template>

<style>

.p-toolbar {
    border-radius: 0 !important;
}

</style>