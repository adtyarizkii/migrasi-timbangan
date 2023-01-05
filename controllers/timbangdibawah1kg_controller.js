'use strict'

const todo = require('../service/timbangdibawah1kg_service')

module.exports = function (app) {
    app.get('/penimbangan/timbang_dibawah_1kg', todo.timbang_dibawah_1kg)
    app.get('/penimbangan/formshow_timbangdibawah1kg', todo.formshow_timbangdibawah1kg)
    app.get('/penimbangan/formclose_timbangdibawah1kg', todo.formclose_timbangdibawah1kg)
    app.get('/penimbangan/frxReport2GetValue_timbangdibawah1kg', todo.frxReport2GetValue_timbangdibawah1kg)
}