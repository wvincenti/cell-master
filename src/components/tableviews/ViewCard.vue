<script setup>
import { onMounted } from 'vue';
import ListGroupItem from '../celltables/ListGroupItem.vue';
import { useSpreadsheetStore } from '@/stores/spreadsheet';

  const spreadsheetStore = useSpreadsheetStore();

</script>

<template>
    <div class="col-6">
        <div class="card">
            <div class="card-body">
                <div class="card-title">Sheets</div>
                <div class="card-subtitle"></div>
                <div class="list-group">
                    <ListGroupItem v-for="(sheet, key, index) in spreadsheetStore.views" 
                    :key="key"
  
                    :sheet="sheet"
                    :sheetKey="key">
                    </ListGroupItem>
                </div>
            </div>
        </div>
    </div>
</template>