'use strict'

const todo = require('../service/keteranganbarcode_service')

module.exports = function (app) {
    app.get('/penimbangan/keterangan_barcode', todo.keterangan_barcode)
    app.post('/penimbangan/keterangan_barcode_input', todo.keterangan_barcode_input)
}