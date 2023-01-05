'use strict'

const todo = require('../service/pilihkainpengganti_service')

module.exports = function (app) {
    app.get('/penimbangan/pilih_kain_pengganti', todo.pilih_kain_pengganti)
}