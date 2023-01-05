'use strict'

const todo = require('../service/login_service')

module.exports = function (app) {
    app.post("/user_login/login", todo.login);
}