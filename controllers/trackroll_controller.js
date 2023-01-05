'use strict'

const todo = require('../service/trackroll_service')

module.exports = function (app) {
    app.get('/penimbangan/track_roll_qpecah', todo.track_roll_qpecah)
    app.get('/penimbangan/track_roll_qcustomer', todo.track_roll_qcustomer)
    app.get('/penimbangan/Edit1KeyDown_trackroll', todo.Edit1KeyDown_trackroll)
}