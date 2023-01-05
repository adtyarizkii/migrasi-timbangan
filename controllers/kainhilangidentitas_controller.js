'use strict'

const todo = require('../service/kainhilangidentitas_service')

module.exports = function (app) {
    app.get('/penimbangan/kain_hilang_identitas', todo.kain_hilang_identitas)
    app.post('/penimbangan/kain_hilang_identitas_input', todo.kain_hilang_identitas_input)
    app.get('/penimbangan/selectkain_kainhilangidentitas', todo.selectkain_kainhilangidentitas)
    app.get('/penimbangan/selectwarna_kainhilangidentitas', todo.selectwarna_kainhilangidentitas)
    app.get('/penimbangan/btnrefresh_kainhilangidentitas', todo.btnrefresh_kainhilangidentitas)
    app.get('/penimbangan/btncetakulang_kainhilangidentitas/:no', todo.btncetakulang_kainhilangidentitas)
    app.get('/penimbangan/cxCheckBox1PropertiesChange_kainhilangidentitas', todo.cxCheckBox1PropertiesChange_kainhilangidentitas)
    app.get('/penimbangan/cxGrid1DBTableView1KeyDown', todo.cxGrid1DBTableView1KeyDown)
    app.get('/penimbangan/cxGrid1DBTableView1KeyDown_hapus_kainhilangidentitas/:no', todo.cxGrid1DBTableView1KeyDown_hapus_kainhilangidentitas)
}