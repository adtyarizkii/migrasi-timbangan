'use strict'

const todo = require('../service/batalkanpenimbangan_service')

module.exports = function (app) {
    app.get('/penimbangan/batalkan_penimbangan', todo.batalkan_penimbangan)
    app.post('/penimbangan/btn_batalkan_penimbangan', todo.btn_batalkan_penimbangan)
    app.post('/penimbangan/sp_btnbatalkanpenimbangan', todo.sp_btnbatalkanpenimbangan)
}