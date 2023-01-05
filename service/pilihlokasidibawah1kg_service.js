'use strict';
const response = require('../res/res')
const tabel = require('../conn/tabel');

let querystr = '';
let queryvalue = '';

exports.pilih_lokasi_dibawah_1kg = async (req, res) => {
    let { lokasi, no_order } = req.body;
    try {
        if (lokasi == '' || lokasi == undefined) {
            response.ok({ 'message': 'Lokasi harus diisi!' }, 201, res)
        } else {
            querystr = `SELECT no_lokasi FROM lokasi WHERE UPPER(no_lokasi)=UPPER(TRIM('${lokasi}'));`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows.length == 0) {
                    response.ok({ 'message': 'Lokasi tidak terdaftar di sistem!' }, 201, res)
                } else {
                    querystr = `SELECT no_lokasi FROM n_lokasiorder_dibawah1kg WHERE no_order='${no_order}' AND no_lokasi <> '${lokasi}';`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        if (onres.rows.length > 0) {                            
                            response.ok({ 'message': `Order ${no_order} sudah memiliki lokasi` }, 201, res)
                        } else {
                            response.ok({ 'message': `Lokasi tujuan : ${lokasi}` }, 201, res)
                        }
                    })
                }
            })
        }
    } catch (error) {
        response.ok({ 'message': tabel.GetError(error) }, 300, res)
    }
}