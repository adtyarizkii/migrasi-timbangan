'use strict'

const todo = require('../service/kalibrasitimbangan_service')

module.exports = function (app) {
    app.post('/penimbangan/kalibrasi_timbangan', todo.kalibrasi_timbangan)
    app.post('/penimbangan/formshow_kalibrasitimbangan', todo.formshow_kalibrasitimbangan)
    app.post('/penimbangan/btn_next_kalibrasitimbangan', todo.btn_next_kalibrasitimbangan)
}