<template>
    <table>
        <tr v-for="i in rowNumber">
            <td v-for="j in colNumber">test</td>
        </tr>
    </table>

</template>

<script setup>


const props = defineProps({
    colNumber: { type: Number, default: 16 },
    rowNumber: { type: Number, default: 24 }
})


</script>