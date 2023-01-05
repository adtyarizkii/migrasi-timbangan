'use strict'

const todo = require('../service/cuttingloss_service')

module.exports = function (app) {
    app.get('/penimbangan/cutting_loss', todo.cutting_loss)
}