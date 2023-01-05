'use strict'

const todo = require('../service/stokopnamekg_service')

module.exports = function (app) {
    app.post('/penimbangan/stok_opname_kg', todo.stok_opname_kg)
    app.post('/penimbangan/stok_opname_kg2', todo.stok_opname_kg2)
    app.post('/penimbangan/formclose_stokopnamekg', todo.formclose_stokopnamekg)
    app.post('/penimbangan/trollKeyDown_stokopnamekg', todo.trollKeyDown_stokopnamekg)
    app.post('/penimbangan/tverifikasiKeyDown_stokopnamekg', todo.tverifikasiKeyDown_stokopnamekg)
}