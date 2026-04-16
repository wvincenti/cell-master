<script setup>
import { ref, onMounted } from 'vue';
const props = defineProps({
    sheets: Array,
})

// import * as HeTree from '@he-tree/vue';
// import '@he-tree/vue/style/default.css'

// const BaseTree = HeTree.BaseTree;
// const Draggable = HeTree.Draggable;

// const treePlugins = [Draggable];


// const navigator = ref([{
//     text:'root',
//     children:[
//         {
//             text: 'chiild 1',
//             children: []
//         },
//         {
//             text: 'child 2',
//             children: []
//         }
//     ]
// }])

// onMounted(() => {
//     console.log(HeTree);
// })




</script>

<template>
    <div>
        <draggable :vlaue="sheets" group="cols" item-key="id">
            <template #item="{ element }">
                <div>
                    element.name
                </div>
            </template>
        </draggable>
    </div>
    <!-- <div class="p-4">
        <component 
            :is="BaseTree"
            v-model="navigator"
            :plugins="treePlugins"
            draggable
            droppable
            class="he-tree-root"
        >
            <template #default="{ node }">
                <div class="p-2 border-1 surface-border border-round shadow-1 mb-2 bg-white he-tree-node">
                    <i class="pi pi-bars mr-2 he-tree-drag-handle"></i>
                    <span>    {{ node.text }}</span>
                
                </div>
            </template>
        </component>
    </div> -->
</template>