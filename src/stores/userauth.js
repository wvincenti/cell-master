import { defineStore } from 'pinia';
import router from '@/router';
import axios from 'axios';
axios.defaults.withCredentials = true

const urlbase = import.meta.env.VITE_API_URL

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isInitialized: false,
    isAuthenticated: false,
  }),

  actions: {
    async initSession() {
      const res = await fetch(`${urlbase}/api/session`, {
        credentials: 'include',
      })

      const { user_id, isAuthenticated } = await res.json()
      console.log('DATA')
      console.log(user_id)
      console.log(isAuthenticated)

      this.user = user_id
      if (isAuthenticated) {
        this.isAuthenticated = true
        this.isInitialized = true
      } else {
        this.isInitialized = true
      }
    },

    async loginUser(body) {
      try {
        const response = await axios.post(`${urlbase}/api/login`, body)
        if (response.status == 200) {
          this.user = response.data.user_id
          this.isAuthenticated = true
          this.isInitialized = true
          router.push({ name: 'main' })
        }
        return this.isAuthenticated
      } catch (error) {
        console.error('Axios caught an error:', error.response?.status)
        console.error('Error details:', error.response?.data)
        throw error
      }
    },

    async registerUser(body) {
      try {
        const response = await axios.post(`${urlbase}/api/register`, body);
        if (response.status == 200) {
          this.user = response.data.user_id;
          this.isAuthenticated = true;
          this.isInitialized = true;
          router.push({name:'main'})
        }
        return response
      } catch (ex) {
        console.log(ex.response);
        throw ex;
      }
    },

    async logout() {
      const response = await axios.get(`${urlbase}/api/logout`)
      if (response.status == 200) {
        this.user = null
        this.isAuthenticated = false
        router.push({ name: 'login' })
        console.log('logedout!')
      }
    },
  },
})
