'use strict'

const todo = require('../service/historycuttingloss_service')

module.exports = function (app) {
    app.get('/penimbangan/history_cutting_loss', todo.history_cutting_loss)
}