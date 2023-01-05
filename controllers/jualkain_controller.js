'use strict'

const todo = require('../service/jualkain_service')

module.exports = function (app) {
    app.post('/penimbangan/jual_kain', todo.jual_kain)
    app.delete('/penimbangan/jual_kain_delete/:id', todo.jual_kain_delete)
    app.get('/penimbangan/qfoot_jual_kain/:nopengeluaran', todo.qfoot_jual_kain)
    app.get('/penimbangan/customer_jualkain', todo.customer_jualkain)
    app.get('/penimbangan/btnhapus_jualkain/:nopengeluaran', todo.btnhapus_jualkain)
    app.get('/penimbangan/btnrefresh_jualkain/:nopengeluaran', todo.btnrefresh_jualkain)
    app.get('/penimbangan/btntambahdetail_jualkain/:namacus', todo.btntambahdetail_jualkain)
    app.get('/penimbangan/frxReport1GetValue_jualkain', todo.frxReport1GetValue_jualkain)
    app.get('/penimbangan/frxReport2GetValue_jualkain', todo.frxReport2GetValue_jualkain)
    app.get('/penimbangan/generate/:no_pengeluaran', todo.generate)
}