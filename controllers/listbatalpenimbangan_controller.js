'use strict'

const todo = require('../service/listbatalpenimbangan_service')

module.exports = function (app) {
    app.get('/penimbangan/list_batal_penimbangan', todo.list_batal_penimbangan)
    app.post('/penimbangan/btn_list_batal_penimbangan', todo.btn_list_batal_penimbangan)
    app.post('/penimbangan/frxReportpecahanGetValue_listbatalpenimbangan', todo.frxReportpecahanGetValue_listbatalpenimbangan)
}