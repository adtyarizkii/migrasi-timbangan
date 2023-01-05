'use strict'

const todo = require('../service/timbangkain_service')

module.exports = function (app) {
    app.post('/penimbangan/timbang_kain', todo.timbang_kain)
}