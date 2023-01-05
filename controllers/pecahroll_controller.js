'use strict'

const todo = require('../service/pecahroll_service')

module.exports = function (app) {
    app.post('/penimbangan/ubahnettopecahroll', todo.ubahnetto)
    app.get('/penimbangan/buatnoroll', todo.buatnoroll)
    app.get('/penimbangan/pecah_roll', todo.pecah_roll)
    app.post('/penimbangan/koreksiselisih', todo.koreksiselisih)
    app.post('/penimbangan/btn_pecah_roll', todo.btn_pecah_roll)
    app.post('/penimbangan/btnkembali_pecahroll', todo.btnkembali_pecahroll)
    app.post('/penimbangan/Edit4KeyDown_pecahroll', todo.Edit4KeyDown_pecahroll)
    app.post('/penimbangan/frxReport2GetValue_pecahroll', todo.frxReport2GetValue_pecahroll)
    app.post('/penimbangan/frxReportpecahanGetValue_pecahroll', todo.frxReportpecahanGetValue_pecahroll)
}