'use strict'

const todo = require('../service/antrianpenimbangan_service')

module.exports = function (app) {
    app.get('/penimbangan/antrian_penimbangan', todo.antrian_penimbangan)
    app.get('/penimbangan/search_antrian_penimbangan/:search', todo.search_antrian_penimbangan)
    app.get('/penimbangan/antrian_penimbangan_qdata', todo.antrian_penimbangan_qdata) 
    app.get('/penimbangan/form_show', todo.form_show) 
    app.get('/penimbangan/form_close/:idkaryawan', todo.form_close)
    app.get('/penimbangan/pilih_penimbangan/:noorder', todo.pilih_penimbangan)
    app.get('/penimbangan/btnlogout/:idkaryawan', todo.btnlogout)
    app.get('/penimbangan/grid5keydown/:noorder', todo.grid5keydown)
}