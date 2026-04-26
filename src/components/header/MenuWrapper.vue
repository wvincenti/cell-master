<script setup>
import { ref } from 'vue';

import { Menubar, Button, Menu } from 'primevue';

const props = defineProps({
  isAuth: false,
});

const emit = defineEmits(['logoutUser']);


const menu = ref([
  {
    label: 'CM',
  },
  // {
  //   label: 'Login',
  //   icon: 'pi pi-login',
  //   route: 'login'
  // },
  {
    label: 'Home',
    icon: 'pi pi-home',
    route: '/'
  },

])

const userMenu = ref();

const userMenuItems = ref([
  {
    label: 'Settings',
    icon: 'pi pi-cog',
    route: { name: 'settings' }
  },
  {
    label: 'Logout',
    icon: 'pi pi-sign-out',
    command: () => { emit('logoutUser') },
  }
])

const toggleUserMenu = (event) => {
  userMenu.value.toggle(event);
}

</script>

<template>

  <Menubar :model="menu" :pt="{ root: { class: 'rounded-0 border-0' } }">

    <template #item="{ item, props, hasSubmenu }">

      <template v-if="isAuth">
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
      <template v-else>
        <a v-if="!item.route" :href="item.url" :target="item.target" v-bind="props.action">
          <span :class="item.icon" />
          <span>{{ item.label }}</span>
          <span v-if="hasSubmenu" class="pi pi-fw pi-angle-down" />
        </a>
      </template>

    </template>

    <template #end v-if="isAuth">
      <!-- <Button label="Logout" icon="pi pi-sign-out" @click="$emit('logoutUser')" severity="danger" /> -->
      <Button icon="pi pi-user" severity="primary" rounded variant="outlined" aria-label="User"
        @click="toggleUserMenu" />
      <Menu ref="userMenu" :model="userMenuItems" :popup="true">
        <template #item="{ item, props }">
          <router-link v-if="item.route" :to="item.route" custom v-slot="{ navigate }">
            <a v-ripple :href="href" @click="navigate" v-bind="props.action">
              <span :class="item.icon"></span>
              <span>{{ item.label }}</span>
            </a>
          </router-link>

          <a v-else v-ripple :href="item.url" v-bind="props.action">
            <span :class="item.icon"></span>
            <span>{{ item.label }}</span>
          </a>
        </template>
      </Menu>
    </template>
  </Menubar>

</template>