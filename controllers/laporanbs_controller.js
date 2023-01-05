'use strict'

const todo = require('../service/laporanbs_service')

module.exports = function (app) {
    app.post('/penimbangan/laporan_bs', todo.laporan_bs)
    app.post('/penimbangan/btn_laporan_bs', todo.btn_laporan_bs)
    app.get('/penimbangan/generatekode', todo.generatekode)
    app.post('/penimbangan/cekkeluar_laporanbs', todo.cekkeluar_laporanbs)
    app.post('/penimbangan/timbangulang_laporanbs', todo.timbangulang_laporanbs)
}