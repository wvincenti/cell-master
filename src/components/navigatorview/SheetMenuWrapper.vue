<template>

    <PanelMenu :model="sheetsMenu">

        <template #item="{ item, hasSubmenu, root, label, props }">
            <div :key="item.key" class="container-fluid">
                <div :key="item.key" class="row justify-items-between align-content-center">
                    <div v-if="(hasSubmenu)" class="col"><i :class="item.icon"></i></div>

                    <div class="col align-middle">{{ item.label }}</div>
                    <div class="col align-middle">{{ item.updated_at }}</div>
                    <div class="col">ID: {{ item.key }}</div>
                    <!-- <div class="col align-middle">{{ hasSubmenu }}</div>
                    <div class="col align-middle">{{ root }}</div>
                    <div class="col align-middle">{{ item.level }}</div> -->
                    <template v-if="(!hasSubmenu)">
                        <div class="col align-middle">
                            <Button icon="pi pi-download" rounded variant="text" size="button"></Button>
                        </div>
                        <div class="col">
                            <Button icon="pi pi-trash" rounded variant="text" size="button" severity="danger"
                                @click="() => deleteSheet(item.sheet_id)"></Button>
                        </div>
                    </template>
                </div>
            </div>
        </template>
    </PanelMenu>
</template>

<script setup>
import { PanelMenu, Button } from 'primevue';
import draggable from 'vuedraggable';
import NestedDraggable from './NestedTest.vue';
import { inject, computed } from 'vue';
import { useSpreadsheetStore } from '@/stores/spreadsheet';
import { storeToRefs } from 'pinia';
// const props = defineProps({
//     menu: Object
// });
const spreadsheetStore = useSpreadsheetStore();

const { sheetsMenu } = storeToRefs(spreadsheetStore);

const deleteSheet = inject('deleteSheet', () => { console.warn('Component uses deleteSheet action') });



</script>
