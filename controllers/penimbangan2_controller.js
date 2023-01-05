'use strict'

const todo = require('../service/penimbangan2_service')

module.exports = function (app) {
    app.post('/penimbangan/penimbangan2', todo.penimbangan2)
    app.post('/penimbangan/ubahnettopenimbangan2', todo.ubahnetto)
    app.post('/penimbangan/formshow_penimbangan2', todo.formshow_penimbangan2)
    app.post('/penimbangan/antrianbaru_penimbangan2', todo.antrianbaru_penimbangan2)
    app.post('/penimbangan/btnpecahroll_penimbangan2', todo.btnpecahroll_penimbangan2)
    app.post('/penimbangan/btnbatalkanpencarian_penimbangan2', todo.btnbatalkanpencarian_penimbangan2)
    app.post('/penimbangan/btngantiorder_penimbangan2', todo.btngantiorder_penimbangan2)
    app.post('/penimbangan/btnubahroll_penimbangan2', todo.btnubahroll_penimbangan2)
    app.post('/penimbangan/btncetak_penimbangan2/:idkaryawan', todo.btncetak_penimbangan2)
    app.post('/penimbangan/Edit1KeyDown_penimbangan2', todo.Edit1KeyDown_penimbangan2)
}