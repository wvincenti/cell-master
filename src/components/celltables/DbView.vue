<script setup>
const props = defineProps(
  { tables: Object }
)
console.log(props.tables);


</script>

<template>

  <div class="col-6" v-for="(columns, tableName, index) in props.tables" :key="tableName">
    <div class="card" style="width: 18rem;">
      <div class="card-body">
        <h5 class="card-title">{{ tableName }}</h5>
        <h6 class="card-subtitle mb-2 text-body-secondary">Table subtitle</h6>
        <div class="list-group">
          <button class="list-group-item list-group-item-action" v-for="col in columns" :key="col.name">
            {{ col.name }} ({{ col.type }})
          </button>
        </div>
      </div>
    </div>
  </div>

</template>