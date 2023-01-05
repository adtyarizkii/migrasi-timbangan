'use strict'

const todo = require('../service/alasanpergantianroll_service')

module.exports = function (app) {
    app.post('/penimbangan/alasan_pergantian_roll', todo.alasan_pergantian_roll)
    app.post('/penimbangan/tunik_key_down', todo.tunik_key_down)
}