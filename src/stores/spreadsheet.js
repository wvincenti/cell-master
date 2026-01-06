import { defineStore } from 'pinia';
import axios from 'axios';


const urlbase = import.meta.env.VITE_API_URL;
console.log('sheet store running')
console.log(urlbase)

export const useSpreadsheetStore = defineStore('spreadsheet', {
  state: () => ({
    cells: {}, // Flat list of cell objects from DB
    loading: false,
    activeSheetId: null,
    sheets: [],
    maxSheetId : null,
  }),
  
  actions: {

    setActiveSheetId(sheet) {
      this.activeSheetId = sheet;
    },

    async setMaxSheetId() {
      this.loading = true;

      try {
        const response = await axios.get(`${urlbase}/api/sheets/latestId`);
        console.log(response)
        const id = response.data == 0 ? 1 : parseInt(response.data) + 1
        this.addSheet({id: id, name: null});
        this.setActiveSheetId(id);
        this.maxSheetId = id;
        console.log(id);

      } catch (err) {
        console.log(err);
      } finally {
        this.loading = false;
        return this.maxSheetId;
      }
    },

    loadCells(apiData) {
      apiData.forEach(cell => {
        const key = `${cell.row_index}-${cell.col_index}`;
        this.cells[key] = {
          value: cell.content,
          originalValue: cell.content, // Sync the "truth"
          isDirty: false
        };
      })
    },

    addSheet(sheet) {
      this.sheets.push(sheet);
    },

    async fetchCells(sheetId) {
      this.loading = true;
      const response = await axios.get(`${urlbase}/api/cells/${sheetId}`);
      this.cells = response.data;
      this.loading = false;
    },

    async saveCells() {
      this.loading = true;
      const dirtyCells = [];
      for (const key of Object.keys(this.cells)) {
        const cell = this.cells[key];
        if (cell.isDirty) {
          const  [row, col] = key.split('-');
          dirtyCells.push({
            sheet_id : this.activeSheetId,
            row_index : row,
            col_index : col,
            content : cell.value
          });
        }
      }

      console.log('send save request');

      if (dirtyCells.length > 0) {
        await axios.post(`${urlbase}/api/cells/saveCells`, {cells : dirtyCells})
      }
      
    },

    updateCell(row, col, newValue) {
      const key = `${row}-${col}`;
      
      // If the cell doesn't exist in state yet (empty cell being edited)
      if (!this.cells[key]) {
        this.cells[key] = { value: '', originalValue: '', isDirty: false };
      }

      const cell = this.cells[key];
      cell.value = newValue;

      // The "Magic" Logic:
      // If the user types then deletes back to original, it's not dirty anymore!
      cell.isDirty = cell.value !== cell.originalValue;
    }
  }
})