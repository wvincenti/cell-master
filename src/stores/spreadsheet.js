import { defineStore } from 'pinia'
import axios from 'axios'

const urlbase = import.meta.env.VITE_API_URL

axios.defaults.withCredentials = true

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
    sheets: new Map(), // sheets' meta data [{id:}]
    sheetOrderedIds: [],

    cellTables: new Map(), // sheets' cells[[{sheet_id, col_id, col_index, row_index, data_type, cell_value, isDirty}, {...}, ...], [{...}], ...]
    loadedSheetOrderedIds: [],
    activeTableOrderedIds: [],

    activeTab: null,

    loading: false,
  }),

  getters: {
    sheetsList: (state) => Array.from(state.sheets.values()),
    cellTablesList: (state) => Array.from(state.cellTables.values()),

    sheetCount: (state) => state.sheets.size,
    loadedSheetCount: (state) => state.cellTables.size,
    activeTableCount: (state) => state.activeTableOrderedIds.length,

    activeSheetNames: (state) => {
      return state.activeTableOrderedIds.map((id) => {
        return state.sheets.get(id)?.name
      })
    },

    activeTableId: (state) => state.activeTableOrderedIds[state.activeTab],

    activeTable() {
      return this.cellTables.get(this.activeTableId)
    },

    newSheetId() {
      return `n-${this.sheetCount}`
    },

    storedSheets() {
      return this.sheetsList.filter((sheet) => sheet.updated_at)
    },

    sheetsMenu() {
      return [
        {
          label: 'Sheets',
          icon: 'pi pi-table',
          items: this.sheetsList.map((sheet) => {
            return {
              label: sheet.name,
              icon: 'pi pi-plus',
              sheet_id: sheet.id,
              key: `sheet-item-${sheet.id}`,
            }
          }),
        },
      ]
    },

    // workArea: (state) => {
    //   return state.sheets.map((sheet) => {
    //     if (sheet.isLoaded) return sheet;
    //   })
    // },

    // activeSheetIds: (state) => {
    //   return state.sheets.

    // loadedSheetIds: (state) => {
    //   return Object.values(state.sheets).map((sheet) => {
    //     if (sheet.isLoaded) return sheet.id
    //   })
    // },

    /* 
      CONSIDER REMOVING THE DIRTY COLS TRACKING
      AND USING A FLAT OBJECT TO TRACK ROWS
    */
    dirtySheetsMap: (state) => {
      const statusMap = new Map()

      for (const sheet of state.sheetsList) {
        const table = state.cellTables.get(sheet.id) || []

        // Check if any cells are dirty
        const hasDirtyCells = table.some((row) => Object.values(row).some((cell) => cell.isDirty))

        // Check if any columns are dirty or new-and-dirty
        const hasDirtyCols = sheet.cols.some((col) => {
          if (col.isDirty) return true
          if (col.isNew) return table.some((row) => row[col.col_index]?.isDirty)
          return false
        })

        // If either is true, this sheet needs a save
        statusMap.set(sheet.id, hasDirtyCells || hasDirtyCols)
      }

      return statusMap
    },

    // cellsToDelete() {
    //   return this.dirtyCells.map((table) => {
    //     return table.filter(
    //       (cell) => !cell.isNew && (cell.cell_value == '' || cell.cell_value == null),
    //     )
    //   })
    // },
  },

  actions: {
    async deleteSheetFromDB(sheetId) {
      console.log('SENDING DELETE REQUEST')
      return await axios.post(`${urlbase}/api/deleteSheet`, { sheet_id: sheetId })
    },

    removeSheetFromStore(sheetId) {
      const sheetIdx = this.sheets.findIndex((sheet) => (sheet.id = sheetId))

      this.sheets.splice(sheetIdx, 1)
      this.cellTables.splice(sheetIdx, 1)
    },

    addSheet({ cellTable = {}, sheetMeta = {} } = {}) {
      this.sheets.set(sheetMeta.id, sheetMeta)

      this.cellTables.set(sheetMeta.id, cellTable)

      // LIST OF SHEETS IN WORK AREA
      this.loadedSheetOrderedIds.push(sheetMeta.id)

      // LIST OF ACTIVE TABS
      this.activeTableOrderedIds.push(sheetMeta.id)
    },

    // {sheet_id, col_id, col_index, row_index, data_type, cell_value, old_value, isDirty}
    updateCell(newValue, rowIdx, colIdx, tabIdx = this.activeTab) {
      const sheetId = this.activeTableOrderedIds[tabIdx]

      const cell = this.cellTables.get(sheetId)[rowIdx][colIdx]

      cell.cell_value = newValue

      if (cell.cell_value != cell.old_value) cell.isDirty = true

      return cell
    },

    async fetchSheetSchema() {
      this.loading = true
      const response = await axios.get(`${urlbase}/api/db`)
      const sheets = response.data
      console.log('SCHEMAA: ')
      console.log(sheets)
      // for (const [key, sheet] of Object.entries(sheets)) {
      //   this.sheets.push(sheet);
      // }
      sheets.forEach((sheet) => {
        this.sheets.set(sheet.id, sheet)
        this.sheetOrderedIds.push(sheet.id)
      })

      this.loading = false
    },

    setActiveTab(tabIdx) {
      // console.log('setting active tab :' + tabIdx)
      // this.activeTab = tabIdx
      // this.activeTable = this.cellTables[tabIdx]
      this.activeTab = tabIdx
    },

    setAtiveTabTableId(id) {
      this.activeTab
    },

    async fetchSheetCells(sheetId) {
      this.loading = true

      const response = await axios.get(`${urlbase}/api/cells/${sheetId}`)

      this.loading = false

      console.log(response.data)

      return response.data
    },

    async flushSheet(sheetId) {
      this.isLoading = true
      try {
        const dirtyCells = this.findDirtyCells(sheetId)

        const dirtySheet = this.findDirtySheet(sheetId)

        const cellsToDelete = this.findCellsToDelete(dirtyCells)

        console.log(dirtyCells)

        console.log(dirtySheet)

        console.log('send FLUSH request')

        const response = await axios.post(`${urlbase}/api/cells/saveCells`, {
          cells: dirtyCells,
          sheet_meta: dirtySheet,
          deleted_cells: cellsToDelete,
        })

        if (response.status == 200) {
          this.patchSheetState(dirtySheet, {
            id: response.data,
            isNew: false,
            isDirty: false,
            updated_at: Date.toString(),
          })

          dirtySheet.cols.forEach((col) => {
            this.patchColState(col, { isNew: false, isDirty: false, sheet_id: response.data })
          })

          dirtyCells.forEach((cell) => {
            this.patchCellState(cell, {
              isNew: false,
              isDirty: false,
              sheet_id: response.data,
              old_value: cell.cell_value
            })
          })
        }
        console.error(response)
      } catch (err) {
        console.error(err)
      } finally {
        this.isLoading = false
      }
    },

    patchSheetState(sheetPointer, updates = {}) {
      const oldId = sheetPointer.id
      const sheet = this.sheets.get(oldId)

      if (!sheet) return

      Object.assign(sheet, updates)

      if (updates.id && updates.id !== oldId) {
        const newId = updates.id

        this.sheets.set(newId, sheet)
        this.sheets.delete(oldId)

        if (this.cellTables.has(oldId)) {
          this.cellTables.set(newId, this.cellTables.get(oldId))
          this.cellTables.delete(oldId)
        }
      }
    },

    patchColState(colPointer, updates = {}) {
      const { sheet_id, col_index } = colPointer

      const col = this.sheets.get(sheet_id)?.cols?.[col_index]

      if (!col) {
        console.warn(`No column ${col_index} found for sheet ${sheet_id}.`)
        return
      }

      Object.assign(col, updates)
    },

    patchCellState(cellPointer, updates = {}) {
      const { sheet_id, row_index, col_index } = cellPointer

      const cell = this.cellTables.get(sheet_id)?.[row_index]?.[`${col_index}`]

      console.log('STORE CELL');
      console.log(cell)
      if (!cell) {
        console.warn(`Cell not found for sheet ${sheet_id}, row ${row_index}, column ${col_index}.`)
        return
      }

      const { cell_value } = updates
      
      if (cell_value && cell_value != cell.old_vlaue) {
        updates.isDirty = true
      }

      console.log('assigning cell state');
      console.log(updates)

      Object.assign(cell, updates)
    },

    findDirtyCells(sheetId) {
      const tableRows = this.cellTables.get(sheetId)

      if (!tableRows) {
        console.error(`Sheet with ID ${sheetId} not found.`)
        return
      }

      return tableRows.flatMap((row) => {
        return Object.values(row).filter((cell) => cell.isDirty)
      })
    },

    findDirtySheet(sheetId) {
      const table = this.cellTables.get(sheetId) || []
      const sheet = this.sheets.get(sheetId)

      // 2. Find dirty row indices by scanning the table directly
      const dirtyRowIndices = new Set()
      table.forEach((row, rowIndex) => {
        const rowHasDirtyCell = Object.values(row).some((cell) => cell.isDirty)
        if (rowHasDirtyCell) {
          dirtyRowIndices.add(rowIndex)
        }
      })

      // 3. Filter down your dirty columns safely
      const dirtyCols = sheet?.cols?.filter((col) => {
        if (col.isDirty) return true

        if (col.isNew) {
          // Scan the specific column index across all rows for dirtiness
          return table.some((row) => row[col.col_index]?.isDirty)
        }

        return false
      })

      // 4. Return the enhanced sheet object
      return {
        ...sheet,
        rows: Array.from(dirtyRowIndices),
        cols: dirtyCols,
      }
    },

    findCellsToDelete(dirtyCells) {
      return dirtyCells.filter(
        (cell) => !cell.isNew && (cell.cell_value == '' || cell.cell_value == null),
      )
    },

    async updateName(newName, tableName, sheetId, colId = null) {
      console.log('updading name of ' + tableName)
      let id
      let oldName
      let sheet
      switch (tableName) {
        case 'sheets':
          id = sheetId

          sheet = this.sheets.find((sheet) => sheet.id == sheetId)

          console.log('sheet Found')
          console.log(sheet)

          oldName = sheet.name

          sheet.name = newName

          break
      }

      const response = axios.post(`${urlbase}/api/updateName`, {
        sheet_id: id,
        col_id: null,
        new_name: newName,
        table_name: tableName,
      })

      if (response.status == 200) {
        return response
      } else {
        sheet.name = oldName
        return response
      }
    },

    // REMOVE SHEET INDEX AS ITS LIKELY TO BE UNECESSARY
    createEmptySheet(sheetIdx, rowNum = 20, colNum = 11) {
      const tempId = crypto.randomUUID()

      const sheetMeta = {
        id: tempId,
        name: `sheet ${sheetIdx + 1}`,
        index: sheetIdx,
        permission: 'admin',
        visibility: 'private',
        updated_at: null,
        isNew: false,
        isDirty: false,
        cols: [],
      }

      const cellTable = []

      for (let i = 0; i < rowNum; i++) {
        cellTable[i] = {}

        for (let j = 0; j < colNum; j++) {
          if (i == 0) {
            sheetMeta.cols[j] = {
              col_index: j,
              sheet_id: tempId,
              name: getColLabel(j + 1),
              data_type: 'string',
              isDirty: false,
              isNew: true,
            }
          }

          cellTable[i][j] = {
            cell_value: '',
            old_value: '',
            row_index: i,
            col_index: j,
            isDirty: false,
            sheet_id: tempId,
            data_type: 'string',
          }
        }
      }

      return { sheetMeta, cellTable }
    },

    /* *** MACRO ACTIONS *** */

    async fetchSheetFromDataBase(sheetId, isSetActive = false) {
      const { sheetMeta, cellTable } = await this.fetchSheetCells(sheetId)

      sheetMeta.index = this.tableCount

      this.addSheet({ sheetMeta, cellTable })

      if (isSetActive) this.activeTab = this.activeTableCount
    },

    async loadSheetToWorkArea(sheetId, isSetActive = true) {
      const cells = await this.fetchSheetCells(sheetId)
    },

    addNewSheet(isSetActive = true) {
      const newestSheetNum = this.sheetCount

      const { sheetMeta, cellTable } = this.createEmptySheet(newestSheetNum)

      this.addSheet({ sheetMeta, cellTable })

      const lastTabIndex = this.activeTableOrderedIds.length - 1

      console.log(this.loadedSheetOrderedIds)

      if (isSetActive) this.setActiveTab(lastTabIndex)
    },
  },
})
