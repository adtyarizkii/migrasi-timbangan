'use strict'

const todo = require('../service/potongkain_service')
const authJwt = require('../middleware/verifyJwtToken')

module.exports = function (app) {
    app.post("/penimbangan/SelesaiPotong", [authJwt.verifyToken], todo.SelesaiPotong);
    app.post('/penimbangan/potong_kain', todo.potong_kain)
    app.post('/penimbangan/formshow_potongkain', todo.formshow_potongkain)
    app.post('/penimbangan/formclose_potongkain', todo.formclose_potongkain)
    app.post('/penimbangan/button1click_potongkain', todo.button1click_potongkain)
    app.post('/penimbangan/frxReport1GetValue_potongkain', todo.frxReport1GetValue_potongkain)
    app.post('/penimbangan/frxReport2GetValue_potongkain', todo.frxReport2GetValue_potongkain)
    app.post('/penimbangan/koreksistokopname_potongkain', todo.koreksistokopname_potongkain)
}