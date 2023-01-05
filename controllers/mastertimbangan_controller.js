'use strict'

const todo = require('../service/mastertimbangan_service')

module.exports = function (app) {
    app.get('/penimbangan/master_timbangan', todo.master_timbangan)
}