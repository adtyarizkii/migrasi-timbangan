'use strict'

const todo = require('../service/hasilfotobs_service')

module.exports = function (app) {
    app.get('/penimbangan/hasil_foto_bs', todo.hasil_foto_bs)
    app.post('/penimbangan/insert_hasil_foto_bs', todo.insert_hasil_foto_bs)
}