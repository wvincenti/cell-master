<script setup>
import { inject } from 'vue';
import { Inplace, Button, ButtonGroup, InputText } from 'primevue';
const props = defineProps(['item', 'depth', 'expanded',])
const emit = defineEmits(['setExpanded', 'add-sheet'])

const addSheetHandler = inject('addSheet');
const deleteSheetHandler = inject('deleteSheet');

function setExpanded(isExpanded, sheetId) {
    console.log(isExpanded);
    console.log(sheetId);
    emit('setExpanded', isExpanded, sheetId)
    console.log(isExpanded);
}

async function addSheet(sheetId) {
    await addSheetHandler(sheetId);
}

async function deleteSheet(sheetId) {
    await deleteSheetHandler(sheetId);
}



</script>



<template>
    <div :style="{ paddingLeft: `${1.5 * depth}rem` }" class="row w-100 justify-content-between align-items-center">
        <div class="col-1 ms-2">
            <button @click="setExpanded(!expanded, item.id)">{{ expanded ? "▼" : "▶" }}</button>
        </div>
        <!-- <span>{{ item.name }}</span> -->
        <div class="col-auto">
            <Inplace>
                <template #display>
                    {{ item.name }}
                </template>
                <template #content="{ closeCallback }">
                    <span class="inline-flex items-center gap-2">
                        <InputText v-model="item.name" autofocus />
                        <Button icon="pi pi-times" text severity="danger" @click="closeCallback" />
                    </span>
                </template>
            </Inplace>
        </div>
        <div class="col-auto pe-0 text-end">
            <ButtonGroup v-if="item.showAdd">
                <Button icon="pi pi-plus" text class="" @click="() => addSheet(item.id)" size="small" />
                <Button icon="pi pi-trash" text severity="danger" @click="() => deleteSheet(item.id)"></Button>
            </ButtonGroup>

        </div>

    </div>

</template>