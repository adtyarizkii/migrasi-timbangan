'use strict'

const todo = require('../service/cetakulang_service')

module.exports = function (app) {
    app.post('/penimbangan/cetak_ulang', todo.cetak_ulang)
    app.post('/penimbangan/cekystokall', todo.cekystokall)
    app.post('/penimbangan/btn_cetak_ulang', todo.btn_cetak_ulang)
    app.post('/penimbangan/frxReport2GetValue', todo.frxReport2GetValue)
    app.post('/penimbangan/frxReportpecahanGetValue', todo.frxReportpecahanGetValue)
}