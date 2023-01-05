'use strict'

const todo = require('../service/scanid_service')

module.exports = function (app) {
    app.post('/penimbangan/scan_id', todo.scan_id)
}