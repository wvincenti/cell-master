<script setup>
import { useSpreadsheetStore } from '@/stores/spreadsheet';
import ViewCard from './ViewCard.vue';


</script>

<template>
    <div class="row">
        <div class="col">
            <div class="h3">VIEWS</div>
            <div class="row">
                <ViewCard></ViewCard>
            </div>
        </div>
    </div>
</template>