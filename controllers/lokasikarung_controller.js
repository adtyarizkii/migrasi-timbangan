'use strict'

const todo = require('../service/lokasikarung_service')

module.exports = function (app) {
    app.get('/penimbangan/lokasi_karung', todo.lokasi_karung)
    app.get('/penimbangan/formclose_lokasikarung', todo.formclose_lokasikarung)
    app.get('/penimbangan/generatekarung/:id_karyawan', todo.generatekarung)
}