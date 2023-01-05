'use strict';
const response = require('../res/res');
const tabel = require('../conn/tabel');

let querystr = '';
let queryvalue = '';

exports.verifikasi_kain = async (req, res) => {
    try {
        let { kode, no_roll, no_karung } = req.body;
        if ( kode == '' || kode == undefined) {
            response.ok({ "message": "Kode Verifikasi Harus diisi!" }, 201, res)
        } else {
            querystr = `SELECT * FROM  perincian_penerimaanstok WHERE no_roll='${no_roll}' AND kode='${kode}'`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows.length == 0) {
                    response.ok({ "message": "Kode verifikasi atau no roll salah!" }, 201, res)
                } else {
                    querystr = `SELECT id FROM n_kategori_karung_detail WHERE no_karung='${no_karung}' AND no_roll='${no_roll}'`
                    queryvalue = []  
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    if (onres.rows.length > 0) {
                        querystr = `delete from n_kategori_karung_detail where id=${onres.rows[0].id}`
                        queryvalue = []
                         await tabel.queryDB(querystr, queryvalue).then(async onres => {
                             response.ok({ "message": "Berhasil dibatalkan" + onres.rows }, 200, res)
                         })
                    }
                    })
                }
            })
        } 
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}