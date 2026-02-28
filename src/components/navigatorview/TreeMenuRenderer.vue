<script setup>
import { inject } from 'vue';
import { Inplace, Button, InputText } from 'primevue';
const props = defineProps(['item', 'depth', 'expanded',])
const emit = defineEmits(['setExpanded', 'add-sheet'])

const addSheetHandler = inject('addSheet');

function setExpanded(isExpanded, sheetId) {
    console.log(isExpanded);
    console.log(sheetId);
    emit('setExpanded', isExpanded, sheetId)
    console.log(isExpanded);
}

const addSheet = async (sheetId) => {
    emit('add-sheet');
    await addSheetHandler(sheetId);
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
        <div class="col-1 me-2">
            <Button v-if="item.showAdd" icon="pi pi-plus" class="" @click="() => addSheet(item.id)" />
        </div>

    </div>

</template>