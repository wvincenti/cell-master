<script setup>
import { ref } from 'vue';
import { getColLabel } from '@/stores/spreadsheet';

const props = defineProps({
    inputKey: String,
    inputName: String
})

const inputNameClicked = ref(null);

const inputLabel = props.inputName || getColLabel(props.inputKey);
console.log(props.inputName);

</script>

<template>
    <div v-if="inputNameClicked == inputKey" class="input-group mb-3">
        <button type="button" class="btn btn-sm btn-outline-success">
            <i class="bi bi-check2"></i>
        </button>
        <input class="form-control form-control-sm" type="text" @click.stop="" :value="inputName">
        <button type="button" class="btn btn-sm btn-outline-danger" @click.stop="inputNameClicked = null"
            aria-label="Close">
            <i class="bi bi-x"></i>
        </button>
    </div>
    <span v-else @click.stop="inputNameClicked = inputKey">
        <input class="btn btn-sm " @mouseover="" type="button" :value="inputName">
    </span>

</template>