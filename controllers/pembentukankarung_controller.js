'use strict'

const todo = require('../service/pembentukankarung_service')

module.exports = function (app) {
    app.get('/penimbangan/pembentukan_karung', todo.pembentukan_karung)
    app.post('/penimbangan/scan_pembentukan_karung2', todo.scan_pembentukan_karung2)
    app.post('/penimbangan/formshow_pembentukankarung', todo.formshow_pembentukankarung)
    app.post('/penimbangan/formclose_pembentukankarung/:id', todo.formclose_pembentukankarung)
    app.post('/penimbangan/btnbuatkarung_pembentukankarung/:id', todo.btnbuatkarung_pembentukankarung)
}