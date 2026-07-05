import { defineStore } from 'pinia'
import axios from 'axios'
import { markRaw } from 'vue'

const urlbase = import.meta.env.VITE_API_URL

export const TABLE_ROW_NUM = 20
export const TABLE_COL_NUM = 11

// export const CELL_TABLES = new Map()

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
  //#region STATE
  state: () => ({
    sheets: new Map(), // sheets' meta data [{id:}]
    sheetOrderedIds: [],

    cellTables: markRaw(new Map()), // sheets' cells[[{sheet_id, col_id, col_index, row_index, data_type, cell_value, isDirty}, {...}, ...], [{...}], ...]
    
    loadedSheetOrderedIds: [],

    activeTableOrderedIds: [],
    activeTab: null,

    loading: false,

    mainTableWidth: 600,
    mainTableHeight: 300,
    tabListHeight: 100

  }),
  //#endregion

  getters: {
    sheetsList: (state) => Array.from(state.sheets.values()),
    cellTablesList: (state) => Array.from(CELL_TABLES.values()),

    sheetCount: (state) => state.sheets.size,
    loadedSheetCount: (state) => state.cellTables.size,
    activeTableCount: (state) => state.activeTableOrderedIds.length,

    activeSheetNames: (state) => {
      return state.activeTableOrderedIds.map((id) => {
        return state.sheets.get(id)?.name
      })
    },

    activeTableId: (state) => state.activeTableOrderedIds[state.activeTab],

    // activeTable() {
    //   return CELL_TABLES.get(this.activeTableId)
    // },

    storedSheets() {
      return this.sheetsList.filter((sheet) => !sheet.isNew)
    },

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
  },

  actions: {

    setMainTableHeight(height) {
      this.mainTableHeight = height
    },

    setMainTableWidth(width) {
      this.mainTableWidth = width
    },

    //#region DEL SHEET
    async deleteSheetFromDB(sheetId) {
      console.log('SENDING DELETE REQUEST')
      const response = await axios.post(`${urlbase}/api/deleteSheet`, { sheet_id: sheetId })

      console.log(response)

      if (response.status == 200) this.removeSheetFromStore(sheetId)
    },

    removeSheetFromStore(sheetId) {
      this.sheets.delete(sheetId)

      this.cellTables.delete(sheetId)

      this.sheetOrderedIds = this.sheetOrderedIds.filter((id) => id != sheetId)
      this.loadedSheetOrderedIds = this.loadedSheetOrderedIds.filter((id) => id != sheetId)

      const tabIdx = this.activeSheetNames.indexOf(sheetId)
      this.activeTableOrderedIds = this.activeTableOrderedIds.filter((id) => id != sheetId)

      if (tabIdx == 0) {
        this.activeTab = null
      } else if (tabIdx > 0) {
        this.activeTab = tabIdx--
      }
    },
    //#endregion


    //#region ADD TABLE

    addCellTable(cellTable, sheetId) {
      this.cellTables.set(sheetId, cellTable)
      // LIST OF SHEETS IN WORK AREA
      this.loadedSheetOrderedIds.push(sheetId)

      // LIST OF ACTIVE TABS
      this.activeTableOrderedIds.push(sheetId)
    },

    addSheet({ cellTable = [], sheetMeta = {} } = {}) {
      this.sheets.set(sheetMeta.id, sheetMeta)

      this.cellTables.set(sheetMeta.id, cellTable)

      // LIST OF SHEETS IN WORK AREA
      this.loadedSheetOrderedIds.push(sheetMeta.id)

      // LIST OF ACTIVE TABS
      this.activeTableOrderedIds.push(sheetMeta.id)
    },
    //#endregion

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

    addCells(cells) {},

    async fetchSheetCells(sheetId) {
      this.loading = true

      const response = await axios.get(`${urlbase}/api/cells/${sheetId}`)

      this.loading = false

      console.log(response.data)

      return response.data
    },

    async flushSheet(sheetId) {
      this.isLoading = true
      console.log(sheetId)
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
          dirtyCells.forEach((cell) => {
            this.patchCellState(cell, {
              isNew: false,
              isDirty: false,
              sheet_id: response.data,
              old_value: cell.cell_value,
            })
          })

          dirtySheet.cols.forEach((col) => {
            this.patchColState(col, { isNew: false, isDirty: false, sheet_id: response.data })
          })

          this.patchSheetState(dirtySheet, {
            id: response.data,
            isNew: false,
            isDirty: false,
            updated_at: Date.toString(),
          })
        }
        console.log(response)
      } catch (err) {
        console.error(err)
      } finally {
        this.isLoading = false
      }
    },

    // patchCellTableState(tablePointer, updates = [{}]){
    //   console.log(tablePointer)
    //   const sheetId = tablePointer.value[0].sheet_id

    //   const table = this.cellTables.get(sheetId)

    //   updates.forEach(())

    //   table

    // },
    reorderRows(tablePointer, updates = []) {},

    //#region PATCHING

    patchSheetState(sheetPointer, updates = {}) {
      const oldId = sheetPointer.id
      const sheet = this.sheets.get(oldId)

      if (!sheet) return

      Object.assign(sheet, updates)

      if (updates.id && updates.id !== oldId) {
        const newId = updates.id

        this.sheets.set(newId, sheet)
        this.sheets.delete(oldId)

        const loadedSheetIdx = this.loadedSheetOrderedIds.indexOf(oldId)
        this.loadedSheetOrderedIds.splice(loadedSheetIdx, 1, newId)

        const activeTableIdx = this.activeTableOrderedIds.indexOf(oldId)
        this.activeTableOrderedIds.splice(activeTableIdx, 1, newId)

        if (this.cellTables.has(oldId)) {
          this.cellTables.set(newId, this.cellTables.get(oldId))
          this.cellTables.delete(oldId)
        }
      }

      if (
        sheet.name != sheet.old_name ||
        sheet.permission != sheet.old_permission ||
        sheet.visibility != sheet.old_visibility
      ) {
        sheet.isDirty = true
      }
    },

    patchColState(colPointer, updates = {}) {
      const { sheet_id, col_index } = colPointer

      let col = this.sheets.get(sheet_id)?.cols?.[col_index]

      if (!col) {
        console.warn(`No column ${col_index} found for sheet ${sheet_id}.
          CREATING COL`)

        col = {}
      }

      Object.assign(col, updates)

      if (
        col.col_index != col.old_col_index ||
        col.name != col.old_name ||
        col.data_type != col.old_data_type
      ) {
        col.isDirty = true
        const sheet = this.sheets.get(sheet_id)
        if (!sheet.isDirty) this.patchSheetState(sheet, { isDirty: true })
      }
    },

    patchCellState(cellPointer, updates = {}) {
      console.log(cellPointer)
      if (!cellPointer) {
        console.error('patchCellState failed: cellPointer is undefined or null!', { updates })
        return
      }

      const { sheet_id, row_index, col_index } = cellPointer

      const table = this.cellTables.get(sheet_id)

      if (!table[row_index]) table[row_index] = {}
      
      if (!table[row_index][col_index]) table[row_index][col_index] = {}

      const cell = this.cellTables.get(sheet_id)?.[row_index]?.[`${col_index}`]

      console.log('STORE CELL')
      console.log(cell)
      if (!cell) {
        console.warn(`Cell not found for sheet ${sheet_id}, row ${row_index}, column ${col_index}.`)
        return
      }

      const { cell_value } = updates

      const sheet = this.sheets.get(sheet_id)
      if (cell_value && cell_value != cell.old_vlaue) {
        updates.isDirty = true

        if (!sheet.isDirty) this.patchSheetState(sheet, { isDirty: true })
      }

      const currentColIndex = updates.col_index || col_index

      const col = sheet.cols[currentColIndex]

      this.patchColState(col, { isDirty: true })

      // if (!col) {
      //   const newCol = this.createCol({ col_index: currentColIndex, sheet_id: sheet_id })
      //   this.patchColState(newCol, newCol)

      // }
      console.log(sheet)

      console.log('assigning cell state')
      console.log(updates)

      Object.assign(cell, updates)
    },
    //#endregion

    //#region DIRTY OBJECTS
    findDirtyCells(sheetId) {
      const tableRows = this.cellTables.get(sheetId)

      if (!tableRows) {
        console.error(`Sheet with ID ${sheetId} not found.`)
        return
      }

      // return tableRows.flatMap((row) => {
      //   return Object.values(row).filter((cell) => cell.isDirty)
      // })
      return Array.from(tableRows).flatMap((row) => {
        return Object.values(row).filter((cell) => cell.isDirty)
      })
    },

    // *** REVIEW DIRTY ROW SELECTION AND DB INSERTION ***

    findDirtySheet(sheetId) {
      const table = this.cellTables.get(sheetId) || []
      const sheet = this.sheets.get(sheetId)

      // 2. Find dirty row indices by scanning the table directly
      const dirtyRowIndices = new Set()
      Array.from(table).forEach((row, rowIndex) => {
        const rowHasDirtyCell = Object.values(row).some((cell) => cell.isDirty)
        if (rowHasDirtyCell) {
          dirtyRowIndices.add(rowIndex)
        }
      })

      // 3. Filter down your dirty columns safely
      const dirtyCols = sheet?.cols?.filter((col) => {
        if (col.isDirty) return true

        // if (col.isNew) {
        //   // Scan the specific column index across all rows for dirtiness
        //   return table.some((row) => row[col.col_index]?.isDirty)
        // }

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
      return (
        dirtyCells?.filter(
          (cell) => !cell.isNew && (cell.cell_value == '' || cell.cell_value == null),
        ) || []
      )
    },
    //#endregion

    //#region CREATE OBJECTS




    //#region create sheet
    createSheet(cells, sheetId, rowNum = TABLE_ROW_NUM, colNum = TABLE_COL_NUM) {
      const cellTable = []

      for (let i = 0; i < rowNum; i++) {
        cellTable[i] = {}

        for (let j = 0; j < colNum; j++) {
          // if (i == 0) {
          //   cellTable.cols[j] = {
          //     col_index: j,
          //     old_col_index: j,
          //     sheet_id: sheetId,
          //     name: null,
          //     old_name: null,
          //     data_type: 'string',
          //     old_data_type: 'string',
          //     isDirty: false,
          //     isNew: true,
          //   }
          // }

          cellTable[i][j] = {
            cell_value: '',
            old_value: '',
            row_index: i,
            col_index: j,
            isDirty: false,
            sheet_id: sheetId,
            data_type: 'string',
          }
        }
      }

      // cells.forEach((cell) => {
      //   const row = cell?.row_index
      //   const col = cell?.col_index

      //   console.log('ADDING CELL')
      //   console.log(cell)
      //   console.log(row)
      //   console.log(col)

      //   if ((row || row == 0) && (col || col == 0)) Object.assign(cellTable[row][col], cell);
      // })


      const tableCols = this.sheets.get(sheetId).cols

      for(let i = 0; i < TABLE_COL_NUM; i++){
        if(!tableCols[i]) {
          
          tableCols[i] = this.createCol({col_index:i, sheet_id: sheetId, data_type:'string', name:null })
        }
      }


      console.log(cellTable)
      console.log(tableCols)
      return cells //cellTable
    },
    //#endregion


    //#region create empty sheet
    // REMOVE SHEET INDEX AS ITS LIKELY TO BE UNECESSARY
    createEmptySheet(rowNum = TABLE_ROW_NUM, colNum = TABLE_COL_NUM) {
      const tempId = crypto.randomUUID()

      const sheetMeta = {
        id: tempId,
        name: `sheet ${this.sheetCount + 1}`,
        old_name: `sheet ${this.sheetCount + 1}`,
        permission: 'admin',
        old_permission: 'admin',
        visibility: 'private',
        old_visibility: 'private',
        updated_at: null,
        isNew: false,
        isDirty: false,
        cols: [],
        linked_sheet_ids: [],
      }

      const cellTable = []

      for (let i = 0; i < rowNum; i++) {
        cellTable[i] = {}

        for (let j = 0; j < colNum; j++) {
          if (i == 0) {
            sheetMeta.cols[j] = {
              col_index: j,
              old_col_index: j,
              sheet_id: tempId,
              name: null,
              old_name: null,
              data_type: 'string',
              old_data_type: 'string',
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
      console.log(cellTable)
      return { sheetMeta, cellTable }
    },
    //#endregion


    //#region create col
    createCol(col) {
      console.log(col)
      let { col_index, sheet_id, data_type, name } = col

      data_type = data_type || 'string'
      name = name || null

      if (!col_index || !sheet_id) {
        console.error('Col coordinates missing, col is not being created')
        return
      }

      const newCol = {
        col_index,
        sheet_id,
        data_type,
        name,
        old_col_index: null,
        old_data_type: null,
        old_name: null,
        isDirty: false,
        isNew: true
      }

      console.log(newCol)

      return newCol
    },
    //#endregion

    //#region MACRO ACTIONS

    async fetchSheetFromDataBase(sheetId, isSetActive = false) {
      const { sheetMeta, cellTable } = await this.fetchSheetCells(sheetId)

      sheetMeta.index = this.tableCount

      this.addSheet({ sheetMeta, cellTable })

      if (isSetActive) this.activeTab = this.activeTableCount
    },

    async loadSheetToWorkArea(sheetId, isSetActive = true) {
      let cells = await this.fetchSheetCells(sheetId)

      console.log(cells)

      const cellTable = this.createSheet(cells, sheetId)
      console.log('LOADING TABLE')
      console.log(cellTable)
      this.addCellTable(cellTable, sheetId)

      console.log(this.cellTables.get(sheetId))
      if (isSetActive) this.activeTab = this.cellTables.size - 1
    },

    addNewSheet(isSetActive = true) {
      const { sheetMeta, cellTable } = this.createEmptySheet()

      this.addSheet({ sheetMeta, cellTable })

      const lastTabIndex = this.activeTableOrderedIds.length - 1

      console.log(this.loadedSheetOrderedIds)

      if (isSetActive) this.setActiveTab(lastTabIndex)
    },
    //#endregion
  },
})
