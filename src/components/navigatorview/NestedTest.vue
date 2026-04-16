<template>
  <draggable
    tag="ul"
    :list="list"
    :group="{ name: 'g1' }"
    item-key="name"
    class="drag-area"
  >
    <template #item="{ element }">
      <li class="nested-item">
        <div class="p-2 border-1 border-round mb-2 bg-white flex align-items-center">
          <i class="pi pi-bars handle mr-2 cursor-move" />
          {{ element.name }}
        </div>
        
        <nested-draggable 
          v-if="element.children" 
          :list="element.children" 
          class="ml-4"
        />
      </li>
    </template>
  </draggable>
</template>

<script setup>
import draggable from "vuedraggable";

const props = defineProps({
  list: {
    required: true,
    type: Array
  }
});
</script>

<script>
// This name must match how you call it in the template above
export default {
  name: "nested-draggable"
};
</script>

<style scoped>
.drag-area {
  min-height: 20px; /* Crucial: allows dropping into empty nested lists */
  list-style-type: none;
}
</style>