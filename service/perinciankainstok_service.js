'use strict';
const response = require('../res/res')
const tabel = require('../conn/tabel');

let querystr = '';
let queryvalue = '';


exports.perincian_kainstok = async (req, res) => {
    let vtperincian = []
    // console.log(vtperincian.length);
    // return console.log(vtperincian);
    let { nopengeluaran } = req.body
    try {
        if (vtperincian > 0) {
            querystr = `START TRANSACTION`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then()

            querystr = `INSERT INTO a_perincian_penjualanstok VALUES(0,'${vtperincian[0].noroll}','${nopengeluaran}','${vtperincian[0].berat}',1)`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then()

            querystr = `select max(no) as no from a_perincian_penjualanstok`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then()

            querystr = `COMMMIT`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then()

            querystr = `ROLLBACK`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then()

            response.ok({ "message": "sukses"}, 200, res)
        } else {
            response.ok({ 'message': 'Data harus di isi!' }, 201, res)
        }
    } catch (error) {
        response.ok({ 'message': tabel.GetError(error) }, 300, res)
    }
}