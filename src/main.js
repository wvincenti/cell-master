import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura'

import './assets/main.scss'
import TabPanels  from 'primevue/tabpanels';
import {DataTable, Column} from 'primevue';

import { useAuthStore } from './stores/userauth';

const app = createApp(App)
const pinia = createPinia()

BigInt.prototype.toJSON = function() {       
  return this.toString(); 
};

app.use(pinia)
app.use(router)

app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
})

app.component('TabPanels', TabPanels);
app.component('DataTable', DataTable);
app.component('Column', Column);

const auth = useAuthStore()

await auth.initSession()

app.mount('#app')


