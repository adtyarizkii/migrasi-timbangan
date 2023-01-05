'use strict'

const todo = require('../service/timbangulangkain_service')

module.exports = function (app) {
    app.post('/penimbangan/timbang_ulang_kain', todo.timbang_ulang_kain)
}