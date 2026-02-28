import { defineStore } from 'pinia'
import { shallowRef } from 'vue'
import axios from 'axios'

const urlbase = import.meta.env.VITE_API_URL

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

export const useSpreadsheetStore = defineStore('spreadsheet', {
  state: () => ({
    columns: {}, // {sheetId: [col1, col2, ...], ...}
    dirtyCells: {},
    sheets: [],

    cellTables: [],

    tableCount: 0,

    activeTab: 0,

    activeView: 0,

    latestSheetId: null,

    activeSheetIdx: null,
    loading: false,
  }),

  getters: {
    getCell: (state) => (s, r, c) => {
      const key = s + '-' + r + '-' + c
      return state.cells[key] || { value: '', originalValue: '', isDirty: false, id: key }
    },
    getView: (state) => (idx) => {
      const view = []
      state.views[idx]?.forEach((sheet) => {
        view.push(sheet)

        // const cols = sheet.cols;
        // const view = [];
        // cols.forEach((cell) => {
        //   view.push(state.cells[cell.id]);
        // })
      })
      return view
    },
    getTable: (state) => (idx) => {
      return state.cellTables[idx]
    },
  },

  actions: {
    addEmptySheet() {
      console.time('DataCreation')

      const newSheetIdx = this.cellTables.length
      const sheet = []
      for (let i = 0; i < 12; i++) {
        sheet[i] = {}
        for (let j = 0; j < 11; j++) {
          sheet[i][`${j}`] = { value: '', row: i, col: j }
        }
      }
      console.timeEnd('DataCreation')
      console.time('StoreUpdate')
      console.timeEnd('StoreUpdate')

      this.cellTables.push(sheet)
      this.tableCount++

      this.activeTab = newSheetIdx

      console.log(this.cellTables)
      return newSheetIdx;
    },

    updateCell(newValue, row, col) {
      this.cellTables[this.activeTab][row][col].value = newValue
    },

    async fetchSheetSchema() {
      this.loading = true
      const response = await axios.get(`${urlbase}/api/db`)
      const sheets = response.data
      console.log(sheets)
      for (const [key, sheet] of Object.entries(sheets)) {
        this.sheets.push(sheet)
      }
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

      return response.data;

      // response.data.forEach((cell) => {
      //   console.log('printing cell')
      //   console.log(cell)
      //   const ids = cell.id.split('-'
      //   const key = sheetId + '-' + ids[1] + '-' + ids[2]
      //   this.cells[key] = {
      //     value: cell.value,
      //     originalValue: cell.value, // Sync the "truth"
      //     isDirty: false,
      //     id: key,
      //     col_id: key[2]
      //   }
      // })

      //console.log(sheetId)

      this.loading = false
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

    async saveCells() {
      this.loading = true
      const dirtyCells = []
      for (const key of Object.keys(this.cells)) {
        const cell = this.cells[key]
        if (cell.isDirty) {
          const [row, col] = key.split('-')
          dirtyCells.push({
            sheet_id: this.activeSheetId,
            row_index: row,
            col_index: col,
            content: cell.value,
          })
        }
      }

      console.log('send save request')

      if (dirtyCells.length > 0) {
        await axios.post(`${urlbase}/api/cells/saveCells`, { cells: dirtyCells })
      }
    },

    async updateName(name, tableName, id) {
      await axios.post(`${urlbase}/api/updateName`, { id: id, name: name, table_name: tableName })
    },
  },
})
