'use strict'

const todo = require('../service/catatrollpabrik_service')

module.exports = function (app) {
    app.post('/penimbangan/catat_roll_pabrik', todo.catat_roll_pabrik)
    app.post('/penimbangan/norollnstok_catatroll', todo.norollnstok_catatroll)
}