<script setup>
import { ref } from 'vue';
import { Menubar } from 'primevue';
import { useRouter } from 'vue-router';

const router = useRouter();

const menu = ref([
  {
    label: 'CM',
  },
  {
    label: 'Login',
    icon: 'pi pi-login',
    route: 'login'
  },
  {
    label: 'Home',
    icon: 'pi pi-home',
    route: '/'
  }
])

</script>

<template>

  <Menubar :model="menu" :pt="{ root: { class: 'rounded-0 border-0' } }">

    <template #item="{ item, props, hasSubmenu }">
      <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
        <a v-ripple :href="href" v-bind="props.action" @click="navigate">
          <span :class="item.icon" />
          <span>{{ item.label }}</span>
        </a>
      </router-link>
      <a v-else v-ripple :href="item.url" :target="item.target" v-bind="props.action">
        <span :class="item.icon" />
        <span>{{ item.label }}</span>
        <span v-if="hasSubmenu" class="pi pi-fw pi-angle-down" />
      </a>
    </template>
  </Menubar>

</template>