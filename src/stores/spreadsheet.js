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
            return state.sheets
                .map((sheet) => ({
                    ...sheet,
                    rows: [...new Set(state.dirtyCells[sheet.index].map((cell) => cell.row_index))],
                    cols: sheet.cols.filter((col) => {
                        if (col.isDirty) return true;

                        if (col.isNew) {
                            const table = state.cellTables[sheet.index];

                            return table.some((row) => row[col.col_index].isDirty )
                        }

                        return false;
                    }),

                    // deletedCols: sheet.cols.map((col) => {
                    //     const hasValue = state.cellTables[sheet.index].some((row) => row[col.col_index] != '');

                    //     if(!col.isNew && !hasValue) return col.col_index;

                    // }) 
                }))
                // .filter((dirtySheet) => {
                //     console.log('filtering......');
                //     console.log(state.dirtyCells);
                //     return dirtySheet.isDirty 
                //         || dirtySheet.cols.length > 0 
                //         || (!dirtySheet.id && state.dirtyCells[dirtySheet.index].length > 0)
                // })
        },

        cellsToDelete() {
            return this.dirtyCells.map((table) => {
                return table.map((cell) => !cell.isNew && (cell.cell_value == '' || cell.cell_value == null ))
            })
        }
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
                            name: getColLabel(j+1),
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
                console.log('TABB')
                console.log(tabIdx);
            const cell = this.cellTables[tabIdx][rowIdx][colIdx]
            const col = this.sheets[tabIdx].cols[colIdx]
            console.log('CELL!!!')
            console.log(newValue)
            console.log(cell)
            console.log(col);

            cell.cell_value = newValue

            if (cell.cell_value != cell.old_value) {
                cell.isDirty = true;
            } 

            console.log(this.dirtyCells)
            console.log(this.dirtySheets)

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

        // setActiveView(viewIdx) {
        //     this.activeView = viewIdx
        //     console.log('ACTIVE VIEW: ' + this.activeView)
        // },

        // setActiveSheetId(sheet) {
        //     this.activeSheetId = sheet
        // },

        // async fetchLatestSheetId() {
        //     const response = await axios.get(`${urlbase}/api/sheets/latestId`)

        //     console.log('LATEST SHEET ID: ' + response.data)

        //     this.latestSheetId = response.data

        //     return response.data
        // },

        async fetchCells(sheetId) {
            this.loading = true

            const response = await axios.get(`${urlbase}/api/cells/${sheetId}`)

            this.loading = false

            return response.data
        },

        async flushSheet(tab = this.activeTab) {
            this.isLoading = true

            const dirtyCells = this.dirtyCells[tab]

            const dirtySheets = this.dirtySheets[tab];

            console.log(dirtyCells)

            console.log(dirtySheets);

            console.log('send FLUSH request');

            const response = await axios.post(`${urlbase}/api/cells/saveCells`, {
                cells: dirtyCells,
                sheet_meta: dirtySheets,
                deleted_cells: this.cellsToDelete[tab],
            })

            if (response.status == 200) {
                this.sheets[tab].id = response.data;
                this.sheets[tab].isDirty = false;

                const updatedCells = this.dirtyCells[tab].map((cell) => {
                    return cell;
                });

                updatedCells.forEach((savedCell) => {
                    savedCell.sheet_id = response.data;
                    savedCell.isDirty = false;
                });

                const updatedCols = this.dirtySheets[tab].cols.map((col) => {
                    return col;
                })

                updatedCols.forEach((savedCol) => {
                    savedCol.isDirty = false;
                    savedCol.isNew = false;
                })
            }
            console.log(response);

            this.isLoading = false;
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
