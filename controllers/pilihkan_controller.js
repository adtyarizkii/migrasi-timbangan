'use strict'

const todo = require('../service/pilihkain_service')

module.exports = function (app) {
    app.get('/penimbangan/pilih_kain', todo.pilih_kain)
}