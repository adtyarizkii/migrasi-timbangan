'use strict'

const todo = require('../service/pilihlokasidibawah1kg_service')

module.exports = function (app) {
    app.get('/penimbangan/pilih_lokasi_dibawah_1kg', todo.pilih_lokasi_dibawah_1kg)
}