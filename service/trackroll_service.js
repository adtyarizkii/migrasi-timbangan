'use strict';
const response = require('../res/res');
const tabel = require('../conn/tabel');

let querystr = '';
let queryvalue = '';


exports.track_roll_qpecah = async (req, res) => {
    try {
        querystr = `SELECT * FROM data_pecahroll d JOIN perincian_penerimaanstok p  ON p.no_roll=d.roll1 JOIN kain_catatan USING(no_roll) JOIN user USING(id_user) where no_roll='0'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            response.ok(onres.rows, 200, res)
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.track_roll_qcustomer = async (req, res) => {
    try {

        querystr = `SELECT *,(CASE penjualan_melalui WHEN 'TRANSAKSI' THEN 'PENJUALAN' ELSE penjualan_melalui END) AS jenis_transaksi,
        (CASE penjualan_melalui WHEN 'TRANSAKSI' THEN c.nama ELSE '-' END) AS customer FROM perincian_pengeluaranstok p JOIN detail_pengeluaranstok dp USING(no_detail)
        JOIN penjualan_kainstok pj USING(no_pengeluaran) JOIN customer c USING(id_customer) JOIN USER USING(id_user) WHERE p.no_roll='0';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            response.ok(onres.rows, 200, res)
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.Edit1KeyDown_trackroll = async (req, res) => {
    try {
        let { noroll } = req.body
        let ltglterima, lrollinduk, lberatnetto, lberatsegel, qpecah, qcus

        querystr = `SELECT * FROM perincian_penerimaanstok JOIN detail_penerimaanstok USING(no_detail) JOIN pembelian_kainstok USING(no_terima) WHERE no_roll='${noroll}';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length == 0) {
                response.ok({'message': 'No Roll tidak terdaftar !'})
            } else {
                ltglterima = onres.rows[0].tanggal_terima

                querystr = `select * from data_pecahroll where roll2='${noroll} or roll1='${noroll}';`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres =>{
                    if (onres.rows.length == 0) {
                        lrollinduk = noroll
                    } else {
                        lrollinduk = onres.rows[0].roll_induk
                    }
                })
            }
        })

        querystr = `SELECT SUM(p.berat) AS berat FROM perincian_pengeluaranstok p JOIN detail_pengeluaranstok dp USING(no_detail)
        JOIN penjualan_kainstok pj USING(no_pengeluaran) WHERE penjualan_melalui ='UBAH NETTO' AND no_roll='${noroll}' GROUP BY p.no_roll;`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length == 0) {
                lberatnetto = '0'
            } else {
                lberatnetto = onres.rows[0].berat
            }
        })

        querystr = `SELECT * FROM kain_catatan JOIN perincian_penerimaanstok p USING(no_roll) where status_kain='SEGEL' and no_roll='${noroll}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length == 0) {
                lberatsegel = '0'
            } else {
                lberatsegel = onres.rows[0].berat
            }
        })

        querystr = `SELECT * FROM data_pecahroll d JOIN perincian_penerimaanstok p  ON p.no_roll=d.roll2 LEFT JOIN kain_catatan USING(no_roll) JOIN user USING(id_user) where roll1='${noroll}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            qpecah = onres.rows
        })

        querystr = `SELECT *,(CASE penjualan_melalui WHEN 'TRANSAKSI' THEN 'PENJUALAN' ELSE penjualan_melalui END) AS jenis_transaksi,
        (CASE penjualan_melalui WHEN 'TRANSAKSI' THEN c.nama ELSE '-' END) AS customer FROM perincian_pengeluaranstok p JOIN detail_pengeluaranstok dp USING(no_detail)
        JOIN penjualan_kainstok pj USING(no_pengeluaran) JOIN customer c USING(id_customer) JOIN USER USING(id_user) WHERE p.no_roll='${noroll}';`
        queryvalue = []
        await tabel.queryDB(querystr,queryvalue).then(async onres => {
            qcus = onres.rows
        })

        response.ok({'message': ltglterima, lrollinduk, lberatnetto, lberatsegel, qpecah, qcus}, 200, res)
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}