import { defineStore } from 'pinia';
import  axios from 'axios';

const urlbase = import.meta.env.VUE_API_URL;

export const useDbStore = defineStore('dbview', {
  state: () => ({
    tables: {}, // Flat list of cell objects from DB
    loading: false
  }),
  
  actions: {
    async fetchDb() {
      this.loading = true;
      const response = await axios.get(`${urlbase}/api/db/`);
      this.tables = response.data;
      this.loading = false;
    },
  }
})