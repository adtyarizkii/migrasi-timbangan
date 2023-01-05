'use strict'

const todo = require('../service/batalkanpencarian_service')

module.exports = function (app) {
    app.get('/penimbangan/antrian_penimbangan', todo.batalkan_pencarian)
}