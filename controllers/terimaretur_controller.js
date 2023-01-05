'use strict'

const todo = require('../service/terimaretur_service')

module.exports = function (app) {
    app.get('/penimbangan/terima_retur', todo.terima_retur)
    app.post('/penimbangan/ubahnettoterima_retur', todo.ubahnetto)
    app.post('/penimbangan/btn_terima_retur', todo.btn_terima_retur)
    app.post('/penimbangan/btncetakulang_terimaretur', todo.btncetakulang_terimaretur)
    app.post('/penimbangan/btnambilberatdarisistem_terimaretur', todo.btnambilberatdarisistem_terimaretur)
    app.post('/penimbangan/trollKeyDown_terimaretur', todo.trollKeyDown_terimaretur)
    app.post('/penimbangan/tverifikasiKeyDown_terimaretur', todo.tverifikasiKeyDown_terimaretur)
}