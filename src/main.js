import { createApp } from 'vue'
import {createPinia} from 'pinia'

import App from './App.vue'
import router from './router'
import { defineStore } from 'pinia'
import axios from 'axios'

import './assets/main.scss'


const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.mount('#app')


