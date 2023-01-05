'use strict'

const todo = require('../service/perinciankainstok_service')

module.exports = function (app) {
    app.get('/penimbangan/perincian_kainstok', todo.perincian_kainstok)
}