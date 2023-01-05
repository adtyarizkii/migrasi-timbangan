'use strict'

const todo = require('../service/cetakbarcodepecahan_service')

module.exports = function (app) {
    app.post('/penimbangan/cetak_barcode_pecahan', todo.cetak_barcode_pecahan)
    app.post('/penimbangan/frxReportpecahanGetValue', todo.frxReportpecahanGetValue)
}