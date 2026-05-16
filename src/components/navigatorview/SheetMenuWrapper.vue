<template>

    <PanelMenu :model="menu">

        <template #item="{ item, hasSubmenu, root, label, props }">
            <div class="container-fluid">
                <div class="row justify-items-between align-content-center">
                    <div v-if="(hasSubmenu)" class="col"><i :class="item.icon"></i></div>
                    <div class="col align-middle">{{ item.label }}</div>
                    <div class="col align-middle">{{ item.updated_at }}</div>
                    <!-- <div class="col align-middle">{{ hasSubmenu }}</div>
                    <div class="col align-middle">{{ root }}</div>
                    <div class="col align-middle">{{ item.level }}</div> -->
                    <template v-if="(!hasSubmenu)">
                        <div class="col align-middle">
                            <Button icon="pi pi-download" rounded variant="text" size="button"></Button>
                        </div>
                        <div class="col">
                            <Button icon="pi pi-trash" rounded variant="text" size="button" severity="danger" @click="() => deleteSheet(item.sheet_id)"></Button>
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
import { inject } from 'vue';
const props = defineProps({
    menu: Object
});

const deleteSheet = inject('deleteSheet', () => { console.warn('Component uses deleteSheet action') });

console.log('MENU');
console.log(props.menu);
</script>
