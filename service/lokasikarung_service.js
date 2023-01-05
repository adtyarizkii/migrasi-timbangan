'use strict';
const response = require('../res/res');
const tabel = require('../conn/tabel');

let querystr = '';
let queryvalue = '';

exports.lokasi_karung = async (req, res) => {
    let { lokasi, no_karung, vbalbssegel } = req.body;
    try {
        if (lokasi == '' || lokasi == undefined) {
            response.ok({ "message": "Lokasi tidak boleh kosong!" }, 201, res)
        } else {
            querystr = `SELECT no_lokasi FROM lokasi WHERE no_lokasi='${lokasi}}'`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows.length == 0) {
                    response.ok({ "message": "Lokasi tidak ada dalam sistem!" }, 201, res)
                } else {
                    if (vbalbssegel == '') {
                        querystr = `UPDATE n_kategori_karung SET no_lokasi='${lokasi}' WHERE no_karung='${no_karung}'`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then()

                        response.ok({ "message": "sukses " }, 200, res)
                    } else {
                        querystr = `SELECT jml,berat FROM detail_ngebal_bssegel WHERE no_ngebal='${no_karung}';`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then(async onres => {
                            response.ok(onres.rows, 200, res)
                        })
                    }
                }
            })
        }
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.formclose_lokasikarung = async (req, res) => {
    try {
        let { nokarung } = req.body
        
        querystr = `select no_karung from n_kategori_karung where no_karung='${nokarung}' and no_lokasi is null;`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length > 0) {
                querystr = `delete from n_kategori_karung where no_karung='${nokarung}'`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then()
            }
            response.ok({'message': 'sukses'}, 200, res)
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}


exports.generatekarung = async (req, res) => {
    try {
        const { id_karyawan } = req.body
        querystr = `CALL generatekarung(?, @out_msg);
        SELECT @out_msg AS pesan;`
        queryvalue = [id_karyawan]
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            response.ok({ pesan: onres.rows[1][0].pesan }, 200, res)
        })
        return
    } catch (e) {
        console.log(e)
        response.ok({ "message": tabel.GetError(e) }, 300, res)
        return
    }
}