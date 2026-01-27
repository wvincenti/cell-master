import { defineStore } from 'pinia'
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

/**
 * @param {Array[]} currentRows - The 2D array of cells we have so far
 * @param {Object} layer - The join instructions { sheetId, onCol, targetCol }
 * @param {Object} allCells - The flat state.cells from your store
 */
export function applyJoin(currentRows, layer, allCells) {
  // 1. Convert the target sheet into a searchable 2D array first
  const targetSheetData = this.getSheetAsArray(layer.sheetId)

  return currentRows.map((row) => {
    // 2. Get the value we are joining ON from the current row
    // (Assuming layer.onCol is the index)
    const joinValue = row[layer.onCol]?.value

    // 3. Find the matching row in the target sheet
    const matchingRow = targetSheetData.find(
      (targetRow) => targetRow[layer.targetCol]?.value === joinValue,
    )

    // 4. If match found, merge them. If not, append empty cells to keep row length consistent
    if (matchingRow) {
      return [...row, ...matchingRow]
    } else {
      const emptyCells = new Array(targetSheetData[0]?.length || 0).fill({ value: '' })
      return [...row, ...emptyCells]
    }
  })
}

export const useSpreadsheetStore = defineStore('spreadsheet', {
  state: () => ({
    cells: {}, // Flat list of cell objects from DB
    sheets: {},
    views: [[]],
    viewRows: [0],

    activeView: 0,
    activeSheetId: null,
    loading: false,
  }),

  getters: {
    getCell: (state) => (s, r, c) => {
      const key = s + '-' + r + '-' + c
      return state.cells[key] || { value: '', isDirty: false }
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
    totalColsCount: (state) => {
      const view = state.views[state.activeView]
      //if (!view || view.length === 0) return 0
      // We look at the first row to see how many columns it has
      return 20 //view[0]?.length || 20;
    },
  },

  actions: {
    async fetchSheetSchema() {
      this.loading = true
      const response = await axios.get(`${urlbase}/api/db`)
      const sheets = response.data
      for (const [key, sheet] of Object.entries(sheets)) {
        this.sheets[key] = sheet
      }
      this.loading = false
    },

    setActiveView(viewIdx) {
      this.activeView = viewIdx
    },

    setActiveSheetId(sheet) {
      this.activeSheetId = sheet
    },

    async setMaxSheetId() {
      // this.loading = true
      // try {
      //   const response = await axios.get(`${urlbase}/api/sheets/latestId`)
      //   console.log(response)
      //   const id = response.data == 0 ? 1 : parseInt(response.data) + 1
      //   this.setActiveSheetId(id)
      //   this.maxSheetId = id
      //   console.log(id)
      // } catch (err) {
      //   console.log(err)
      // } finally {
      //   this.loading = false
      //   return this.maxSheetId
      // }
    },

    loadCells(apiData) {
      apiData.forEach((cell) => {
        const key = `${cell.row_index}-${cell.col_index}`
        this.cells[key] = {
          value: cell.content,
          originalValue: cell.content, // Sync the "truth"
          isDirty: false,
        }
      })
    },

    async fetchCells(sheetId) {
      this.loading = true
      const response = await axios.get(`${urlbase}/api/cells/${sheetId}`)
      response.data.forEach((cell) => {
        console.log('printing cell')
        console.log(cell)
        const ids = cell.id.split('-')
        const key = sheetId + '-' + ids[1] + '-' + ids[2]
        this.cells[key] = {
          value: cell.value,
          originalValue: cell.value, // Sync the "truth"
          isDirty: false,
        }
      })

      console.log(sheetId)

      this.loading = false
    },

    loadRowToView(row, viewIdx) {
      const lastRow = this.viewRows[viewIdx]
      const nextRow = lastRow + 1

      this.views[viewIdx][nextRow] = row
      this.viewRows[viewIdx] = nextRow

      console.log(row)
      console.log(viewIdx)
      console.log(this.views[viewIdx])
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

    updateCell(row, col, newValue) {
      const key = `${row}-${col}`

      // If the cell doesn't exist in state yet (empty cell being edited)
      if (!this.cells[key]) {
        this.cells[key] = { value: '', originalValue: '', isDirty: false }
      }

      const cell = this.cells[key]
      cell.value = newValue

      // The "Magic" Logic:
      // If the user types then deletes back to original, it's not dirty anymore!
      cell.isDirty = cell.value !== cell.originalValue
    },
  },

  async updateName(name, tableName, id) {
    await axios.post(`${urlbase}/api/updateName`, { id: id, name: name, table_name: tableName })
  },
})
