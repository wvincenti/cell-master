<script setup>
import { ref } from 'vue';

const props = defineProps({
    inputKey: String,
    inputName: String
}) 

const inputNameClicked = ref(null);

</script>

<template>
    <div v-if="inputNameClicked == inputKey" class="input-group mb-3">
        <span class="input-group-text border-0 ps-1" id="basic-addon2">
            <button type="button" class="btn-close" @click.stop="inputNameClicked = null" aria-label="Close"></button>
        </span>
        <input 
        class="form-control form-control-sm" 
        type="text"
        @click.stop=""
        :value="inputName">
    </div>
    <span v-else @click.stop="inputNameClicked = inputKey">
        <input class="btn btn-sm " @mouseover="" type="button"
            :value="inputName">
    </span>

</template>