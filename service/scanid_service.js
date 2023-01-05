'use strict';
const response = require('../res/res');
const tabel = require('../conn/tabel');

let querystr = '';
let queryvalue = '';

exports.scan_id = async (req, res) => {
    let { scan, vsverifikasi, noroll } = req.body;
    let viduser, id, nama, s, inisial, vnamafile
    try {
        if (scan == '' || scan == undefined) {
            response.ok({'message': 'Silahkan scan ID terlebih dahulu!' }, 201, res)
        } else {
            querystr = `SELECT id_user FROM n_supervisor WHERE id='${scan}';`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows.length == 0) {
                    response.ok({'message': 'ID tidak terdaftar!' }, 201, res)
                } else {
                    viduser = onres.rows[0].id_user
                }
            })
            id = scan

            querystr = `select foto from n_verifikasi where no_roll='${noroll}' and keterangan='${vsverifikasi}' and foto is not null order by no desc`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows.length == 0) {
                    nama = noroll + inisial + '1'
                } else {
                    s = onres.rows[0].foto
                    nama = s
                }
                vnamafile = nama + '.png'
            })

            querystr = `START TRANSACTION`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then()

            querystr = `UPDATE n_verifikasi SET tanggal=NOW(),user_supervisor='${viduser}',catatan='',foto='${vnamafile}',STATUS=1
            WHERE no_roll='${noroll}' AND keterangan='${vsverifikasi}' AND STATUS=0;`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then()

            querystr = `COMMIT`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then()

            response.ok({"message": "sukses"}, 200, res)
        }
    } catch (error) {
        response.ok({ 'message': tabel.GetError(error) }, 300, res)
    }
}