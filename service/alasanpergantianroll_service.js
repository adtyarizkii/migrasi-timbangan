const response = require('../res/res');
const tabel = require('../conn/tabel');

let querystr = '';
let queryvalue = '';

const globalf = require('./utility_service')

exports.alasan_pergantian_roll = async (req, res) => {
    try {
        let { alasan } = req.body;

        if (alasan == '' || alasan == undefined) {
            response.ok({ "message": "Alasan tidak boleh kosong!" }, 201, res)
        } else {
            let { no_roll, kode } = req.body;
            querystr = `SELECT no_roll FROM perincian_penerimaanstok WHERE no_roll='${no_roll}' AND kode='${kode}';`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue)
                .then(async onres => {
                if (onres.rows.length == 0) {
                    response.ok({ "message": "No Roll atau Kode Verifikasi salah!" }, 201, res)
                } else {
                    let { no_order, roll_awal, idKaryawan } = req.body;
                    querystr = `CALL sp_ubahrollpencarian_dibawah1kg('${no_order}', '${roll_awal}', '${no_roll}', '${alasan}', ${idKaryawan});`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        const message = onres.rows[0][0].message
                        if (onres.rows.length == 0 || onres.rows.length > 0 || onres.rows[0][0].status != 200) {
                            if (onres.rows.length > 0) {
                                response.ok({ "message": "Data gagal diupdate, silahkan ulang lagi!" + ' ' + message }, 201, res)
                            } else {
                                response.ok({ "message": "Data gagal diupdate, silahkan ulang lagi!" }, 201, res)
                            }
                        } else {
                            response.ok({ "message": "No Roll berhasil diupdate" }, 200, res)
                        }
                    })
                }
            })
        }
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.tunik_key_down = async (req, res) => {
    try {
        let {tnoroll, tunik, memo} = req.body
        
        querystr = `SELECT no_roll FROM perincian_penerimaanstok WHERE no_roll='${tnoroll}' AND kode='${tunik}';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            let respon = ''
            if (onres.rows.length == 0) {
                respon = 'Kode verifikasi salah'
            } else {
                memo.focus()
            }
            response.ok({'message': respon})
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}
