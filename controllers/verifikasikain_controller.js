'use strict'

const todo = require('../service/verifikasikain_service')

module.exports = function (app) {
    app.post('/penimbangan/verifikasi_kain', todo.verifikasi_kain)
}