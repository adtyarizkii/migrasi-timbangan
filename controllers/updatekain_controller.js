'use strict'

const todo = require('../service/updatekain_service')

module.exports = function (app) {
    app.post('/penimbangan/update_kain', todo.update_kain)
    app.post('/penimbangan/Button1Click_updatekain', todo.Button1Click_updatekain)
    app.post('/penimbangan/Button2Click_updatekain', todo.Button2Click_updatekain)
    app.post('/penimbangan/Button19Click_updatekain', todo.Button19Click_updatekain)
    app.post('/penimbangan/Button41Click_updatekain', todo.Button41Click_updatekain)
    app.post('/penimbangan/Button43Click_updatekain', todo.Button43Click_updatekain)
}