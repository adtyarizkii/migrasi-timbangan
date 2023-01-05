'use strict';
const response = require('../res/res')
const tabel = require('../conn/tabel');

let querystr = '';
let queryvalue = '';

exports.pilih_kain_pengganti = async (req, res) => {
    try {
        querystr = `SELECT * FROM v_stokglobal WHERE berat < 1;`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            response.ok(onres.rows, 200, res)
        })
    } catch (error) {
        response.ok({ 'message': tabel.GetError(error) }, 300, res)
    }
}