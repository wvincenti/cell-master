import { defineStore } from 'pinia'
const urlbase = import.meta.env.VITE_API_URL

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    initialized: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.user
  },

  actions: {
    async initSession() {
      const res = await fetch(`${urlbase}/api/session`, {
        credentials: 'include'
      })


      const data = await res.json()
              console.log('DATA');
        console.log(data);
    //   if (data.authenticated) {

    //     this.user = data.user
    //   }
    //   else
    //   {

    //   }

      this.initialized = true
    },

    logout() {
      this.user = null
    }
  }
})