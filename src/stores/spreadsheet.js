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
        sheets: [], // sheets' meta data [{id:}]

        cellTables: [], // sheets' cells[[{sheet_id, col_id, col_index, row_index, data_type, cell_value, isDirty}, {...}, ...], [{...}], ...]

        activeTab: 0,

        loading: false,
    }),

    getters: {
        tableCount: (state) => state.cellTables.length,

        dirtyCells: (state) => {
            return state.cellTables.map((table) => {
                console.log('table')
                console.log(table)
                return table.flatMap((row) => {
                    return Object.values(row).filter((cell) => cell.isDirty)
                })
            })
        },

        dirtySheets: (state) => {
            return state.sheets.map((sheet) => ({
                ...sheet,
                rows: [...new Set(state.dirtyCells[sheet.index].map((cell) => cell.row_index))],
                cols: sheet.cols.filter((col) => {
                    if (col.isDirty) return true

                    if (col.isNew) {
                        const table = state.cellTables[sheet.index]

                        return table.some((row) => row[col.col_index].isDirty)
                    }

                    return false
                }),

            }))

        },

        cellsToDelete() {
            return this.dirtyCells.map((table) => {
                return table.map(
                    (cell) => !cell.isNew && (cell.cell_value == '' || cell.cell_value == null),
                )
            })
        },
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

        addEmptySheet() {
            console.time('DataCreation')
            const newSheetIdx = this.tableCount

            const newSheet = {
                id: null,
                name: `sheet ${newSheetIdx + 1}`,
                index: newSheetIdx,
                permission: 'admin',
                visibility: 'private',
                updated_at: null,
                isDirty: false,
                cols: [],
            }

            const cellTable = []

            for (let i = 0; i < 20; i++) {
                cellTable[i] = {}

                for (let j = 0; j < 11; j++) {
                    if (i == 0) {
                        newSheet.cols[j] = {
                            col_index: j,
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
                        sheet_id: null,
                        data_type: 'string',
                    }
                }
            }

            console.timeEnd('DataCreation')
            console.time('StoreUpdate')
            console.timeEnd('StoreUpdate')

            this.cellTables.push(cellTable)

            this.sheets.push(newSheet)

            this.activeTab = newSheetIdx

            console.log(this.cellTables)
            return newSheetIdx
        },

        // {sheet_id, col_id, col_index, row_index, data_type, cell_value, old_value, isDirty}
        updateCell(newValue, rowIdx, colIdx, tabIdx = this.activeTab) {
            const cell = this.cellTables[tabIdx][rowIdx][colIdx];

            cell.cell_value = newValue

            if (cell.cell_value != cell.old_value) 
                cell.isDirty = true;

            return cell
        },

        async fetchSheetSchema() {
            this.loading = true
            const response = await axios.get(`${urlbase}/api/db`)
            const sheets = response.data
            console.log('SCHEMAA: ')
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

        async fetchCells(sheetId) {
            this.loading = true

            const response = await axios.get(`${urlbase}/api/cells/${sheetId}`)

            this.loading = false

            return response.data
        },

        async flushSheet(tab = this.activeTab) {
            this.isLoading = true

            const dirtyCells = this.dirtyCells[tab]

            const dirtySheets = this.dirtySheets[tab]

            console.log(dirtyCells)

            console.log(dirtySheets)

            console.log('send FLUSH request')

            const response = await axios.post(`${urlbase}/api/cells/saveCells`, {
                cells: dirtyCells,
                sheet_meta: dirtySheets,
                deleted_cells: this.cellsToDelete[tab],
            })

            if (response.status == 200) {
                this.sheets[tab].id = response.data
                this.sheets[tab].isDirty = false

                ;[...this.dirtyCells[tab]].forEach((cell) => {
                    cell.sheet_id = sheetId
                    cell.isDirty = false
                })

                ;[...this.dirtySheets[tab].cols].forEach((col) => {
                    col.isDirty = false
                    col.isNew = false
                })
            }
            console.log(response);

            this.isLoading = false;
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
    },
})
