'use strict'

const todo = require('../service/pergantianbarcode_service')

module.exports = function (app) {
    app.post('/penimbangan/pergantian_barcode', todo.pergantian_barcode)
    app.post('/penimbangan/Edit1KeyDown_pergantianbarcode', todo.Edit1KeyDown_pergantianbarcode)
    app.post('/penimbangan/frxReportpecahanGetValue_pergantianbarcode', todo.frxReportpecahanGetValue_pergantianbarcode)
    app.post('/penimbangan/tverifikasiKeyDown_pergantianbarcode', todo.tverifikasiKeyDown_pergantianbarcode)
}