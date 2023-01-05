'use strict';
var response = require('../res/res');
const jwt = require('jsonwebtoken');
const config = require('../config/config.js');
const tabel = require('../conn/tabel')

exports.login = async function (req, res) {
    try {

        const username = req.body.username
        const password = req.body.password
        console.log(username, password)
        await tabel.queryDB('select aktif,id_user,level,nama,concat(id_user,nama,username,password) as kode from user where username=? and  password=md5(?) and aktif=1', [username, password])
            .then(onres => {
                if (onres.rows.length > 0) {
                    if (onres.rows[0].aktif == 0) {
                        var jsonData = { "status": "User sudah tidak aktif" };
                        console.log(jsonData)
                        response.ok(jsonData, 201, res)
                    } else {
                        var iduser = '';
                        var nama = '';
                        var level = '';
                        var kode = '';
                        var row = onres.rows[0];
                        iduser = row.id_user;
                        nama = row.nama;
                        level = row.level;
                        kode = row.kode;

                        const user = {
                            id: kode
                        }
                        var token = jwt.sign({ id: user.id }, config.secret, {
                            expiresIn: 86400 // 24 jam
                        })

                        var jsonData = { "login": "SUKSES", "id_user": iduser, "level": level, "nama": nama, auth: true, screetkey: token };
                        console.log(jsonData)
                        response.ok(jsonData, 200, res)
                    }
                } else {
                    var jsonData = { "status": "Username atau Password salah" };
                    console.log(jsonData)
                    response.ok(jsonData, 201, res)

                }
            })


    } catch (e) {
        tabel.dumpError(e)
        response.ok({ "message": tabel.GetError(e) }, 300, res)
    }
}