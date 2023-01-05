'use strict'

const todo = require('../service/cetakbarcodepenimbangan_service')

module.exports = function (app) {
    app.get('/penimbangan/cetak_barcode_penimbangan', todo.cetak_barcode_penimbangan)
    app.post('/penimbangan/btn_cetak_barcode_penimbangan', todo.btn_cetak_barcode_penimbangan)
    app.post('/penimbangan/frxReport1GetValue', todo.frxReport1GetValue)
}