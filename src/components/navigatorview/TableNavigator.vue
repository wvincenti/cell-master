<script setup>
import PanelMenu from 'primevue/panelmenu';
import { Inplace, Button, InputText } from 'primevue';
import { ref, onMounted } from 'vue';
import { useSpreadsheetStore } from '@/stores/spreadsheet';

const props = defineProps({
    navigator: Array,
    tableIdx: Number,
})

console.log('NAVIGATOR:')
console.log(props.navigator);

const items = ref([
    { label: 'Project Alpha', icon: 'pi pi-file' },
    { label: 'Project Beta', icon: 'pi pi-file' }
]);

const onEdit = (item) => console.log('Editing:', item.label);
const onDelete = (item) => console.log('Deleting:', item.label);

const clickedInput = ref(null);

</script>

<template>
    <!-- <div class="card flex justify-center bg-black">
        <PanelMenu :model="navigator"></PanelMenu>
    </div> -->

    <PanelMenu :model="navigator">
        <template #item="{ item, props }">
            <div class="d-flex align-items-center align-items-between justify-content-between p-menuitem-link">
                <div class="card">
                    <Inplace>
                        <template #display>
                            {{ item.label }}
                        </template>
                        <template #content="{ closeCallback }">
                            <span class="inline-flex items-center gap-2">
                                <InputText v-model="item.label" autofocus />
                                <Button icon="pi pi-times" text severity="danger" @click="closeCallback" />
                            </span>
                        </template>
                    </Inplace>
                </div>
                <!-- <input v-if="clickedInput == item.id" class="ml-2 col form-control form-control-sm"
                    :value="item.label"></input>
                <input v-else type="button" :value="item.label" class="ml-2 col btn btn-sm text-light"
                    @click="clickedInput = item.id"></input> -->

                <!-- <div class="ml-auto flex gap-2">
                    <Button icon="pi pi-pencil" severity="secondary" text @click.stop="onEdit(item)" />
                    <Button icon="pi pi-trash" severity="danger" text @click.stop="onDelete(item)" />
                </div> -->
                <Button v-if="item.showAdd" icon="pi pi-plus" class="col-2 text-end" @click="$emit('add-sheet', item.id, item.index)" />
            </div>
        </template>

    </PanelMenu>


</template>

<style></style>
