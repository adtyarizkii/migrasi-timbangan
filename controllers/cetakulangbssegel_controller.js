'use strict'

const todo = require('../service/cetakulangbssegel_service')

module.exports = function (app) {
    app.get('/penimbangan/cetak_ulang_bssegel', todo.cetak_ulang_bssegel)
    app.get('/penimbangan/datarefresh_tcari', todo.datarefresh_tcari)
    app.get('/penimbangan/frxReport1GetValue', todo.frxReport1GetValue)
}