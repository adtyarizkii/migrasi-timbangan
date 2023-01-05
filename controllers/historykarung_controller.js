'use strict'

const todo = require('../service/historykarung_service')

module.exports = function (app) {
    app.get('/penimbangan/history_karung', todo.history_karung)
    app.get('/penimbangan/history_karung2_qdata', todo.history_karung2_qdata)
    app.get('/penimbangan/history_karung2_qplastik', todo.history_karung2_qplastik)
}