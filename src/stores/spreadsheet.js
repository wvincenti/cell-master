import { defineStore } from 'pinia'
import { shallowRef } from 'vue'
import axios from 'axios'
// import router from '@/router'

const urlbase = import.meta.env.VITE_API_URL

axios.defaults.withCredentials = true;

console.log('sheet store running')
console.log(urlbase)

export const getColLabel = (n) => {
  if (n < 1) {
    return 'ID'
  }
  let label = ''
  while (n > 0) {
    let rem = (n - 1) % 26
    label = String.fromCharCode(65 + rem) + label
    n = Math.floor((n - 1) / 26)
  }
  return label
}

// axios.interceptors.response.use(
//   response => response,
//   error => {
//     if (error.response.status === 401) {
//       console.log('axios pushing!');
//       router.push('/login'); // Vue Router takes over
//     }
//     return Promise.reject(error);
//   }
// );

export const useSpreadsheetStore = defineStore('spreadsheet', {
  state: () => ({

    columns: {}, // {sheetId: [col1, col2, ...], ...}

    dirtyCells: {},

    sheets: [], // sheets' meta data

    activeSheets: [],

    cellTables: [], // sheets' cells

    tableCount: 0,

    activeTab: 0,

    activeView: 0,

    latestSheetId: null,

    activeSheetIdx: null,

    loading: false,

  }),

  getters: {},

  actions: {
    flagDirtyCell(tab, row, col) {
      this.cellTables[tab][row][col].isDirty = true
    },

    async deleteSheetFromDB(sheetId) {
      console.log('SENDING DELETE REQUEST')
      return await axios.post(`${urlbase}/api/deleteSheet`, { sheet_id: sheetId })
    },

    removeSheetFromStore(sheetId){
      const sheetIdx = this.sheets.findIndex((sheet) => sheet.id = sheetId);
      
      this.sheets.splice(sheetIdx, 1);
      this.cellTables.splice(sheetIdx, 1);
    },

    addEmptySheet() {
      console.time('DataCreation')

      const newSheetIdx = this.cellTables.length
      const sheet = []
      for (let i = 0; i < 20; i++) {
        sheet[i] = {}
        for (let j = 0; j < 11; j++) {
          sheet[i][`${j}`] = {
            value: '',
            row: i,
            col: j,
            isDirty: false,
            sheet_id: this.latestSheetId,
          }
        }
      }

      this.latestSheetId++

      console.timeEnd('DataCreation')
      console.time('StoreUpdate')
      console.timeEnd('StoreUpdate')

      this.cellTables.push(sheet)
      this.tableCount++

      this.activeTab = newSheetIdx

      const newSheet = {
        id: this.latestSheetId,
        name: null,
        cols: [],
      }

      this.sheets.push(newSheet);

      console.log(this.cellTables)
      return newSheetIdx
    },

    updateCell(newValue, row, col, tab) {
      const cell = this.cellTables[tab][row][col]
      cell.value = newValue
      console.log(this.dirtyCells[cell.sheet_id])
      if (this.dirtyCells?.[cell.sheet_id] == null) this.dirtyCells[cell.sheet_id] = []

      cell.isDirty = true

      this.dirtyCells[cell.sheet_id].push(cell)

      console.log(this.dirtyCells[cell.sheet_id])

      return cell
    },

    async fetchSheetSchema() {
      this.loading = true
      const response = await axios.get(`${urlbase}/api/db`)
      const sheets = response.data
      console.log(sheets)
      this.sheets = []
      for (const [key, sheet] of Object.entries(sheets)) {
        this.sheets.push(sheet)
      }
      console.log(this.sheets)
      this.loading = false
    },

    setActiveTab(tabIdx) {
      console.log('setting active tab :' + tabIdx)
      this.activeTab = tabIdx
      this.activeTable = this.cellTables[tabIdx]
    },

    setActiveView(viewIdx) {
      this.activeView = viewIdx
      console.log('ACTIVE VIEW: ' + this.activeView)
    },

    setActiveSheetId(sheet) {
      this.activeSheetId = sheet
    },

    async fetchLatestSheetId() {
      const response = await axios.get(`${urlbase}/api/sheets/latestId`)

      console.log('LATEST SHEET ID: ' + response.data)

      this.latestSheetId = response.data

      return response.data
    },

    async fetchCells(sheetId) {
      this.loading = true
      const response = await axios.get(`${urlbase}/api/cells/${sheetId}`)
      this.loading = false
      return response.data
    },

    async flushSheet(sheetId = this.activeSheetId, vIdx = this.activeView) {
      this.isLoading = true
      const dirtyCells = []
      this.views[vIdx].forEach((row) => {
        row.forEach((el) => {
          console.log('EL!!!!')
          console.log(el)
          const key = el.id.split('-')
          console.log(key)
          if (el.isDirty) {
            dirtyCells.push({
              sheet_id: sheetId,
              row_index: key[1],
              col_index: key[2],
              content: el.value,
            })
            el.isDirty = false
          }
        })
      })

      console.log('send FLUSH request')
      console.log(dirtyCells)
      if (dirtyCells.length > 0) {
        await axios.post(`${urlbase}/api/cells/saveCells`, { cells: dirtyCells })
      }
    },

    async saveCells(dirtyCells) {
      this.loading = true 
      // const dirtyCells = []
      // for (const key of Object.keys(this.cells)) {
      //   const cell = this.cells[key]
      //   if (cell.isDirty) {
      //     const [row, col] = key.split('-')
      //     dirtyCells.push({
      //       sheet_id: this.activeSheetId,
      //       row_index: row,
      //       col_index: col,
      //       content: cell.value,
      //     })
      //   }
      // }

      console.log('send save request')

      if (dirtyCells.length > 0) {
        await axios.post(`${urlbase}/api/cells/saveCells`, { cells: dirtyCells })
      }
      this.loading = false
    },

    async loginUser(body) {
      const response = await axios.post(`${urlbase}/api/login`, body);
      console.log(response);
      return response;
    },


    async registerUser(body) {
      const response = await axios.post(`${urlbase}/api/register`, body)
      return response;
    },

    async updateName(newName, tableName, sheetId, colId = null) {
      console.log('updading name of '+ tableName);
      let id;
      let oldName;
      let sheet;
      switch(tableName) {
        case 'sheets':

          id = sheetId;

          sheet = this.sheets.find((sheet) => sheet.id == sheetId);

          console.log('sheet Found')
          console.log(sheet);

          oldName = sheet.name

          sheet.name = newName;

          break;
        
      }
      const response = axios.post(`${urlbase}/api/updateName`, { sheet_id: id, col_id: null, new_name: newName, table_name: tableName });

      if (response.status == 200)
      {
        return response;
      }
      else
      {
        sheet.name = oldName;
        return response;
      }

    },
  },
})
