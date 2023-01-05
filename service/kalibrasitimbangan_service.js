const response = require('../res/res');
const tabel = require('../conn/tabel');
const globalf = require('./utility_service')

let querystr = '';
let queryvalue = '';

exports.kalibrasi_timbangan = async (req, res) => {
    let { btimbangan } = req.body;
    let vidtimbangan, vtimbangan, ip;
    try {
        if (btimbangan == '' || btimbangan == undefined) {
            response.ok({ "message": "Silahkan scan barcode timbangan!"}, 201, res)
        } else {
            querystr = `SELECT * FROM n_master_penimbangan WHERE id_timbangan='${btimbangan}'`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows.length == 0) {
                    response.ok({ "message": "Timbangan tidak terdaftar silahkan ulangi!"}, 201, res)
                } else {
                    vidtimbangan = onres.rows[0].id_timbangan
                    vtimbangan = onres.rows[0].timbangan
                    ip = onres.rows[0].ip_address

                    querystr = `update n_master_penimbangan set ip_address=null,is_used=0 where ip_address='${ip}'`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then()

                    querystr = `update n_master_penimbangan set ip_address='${ip}',is_used=1 where id_timbangan='${vidtimbangan}'`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then()

                    response.ok({ "message": "sukses"}, 200, res)
                }
            })
        }
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.btn_next_kalibrasitimbangan = async (req, res) => {
    try {
        let { vidtimbangan, ptitik1, ptitik2, ptitik3, ptitik4, ptitik5, idkaryawan } = req.body
        querystr = `START TRANSACTION`
        await tabel.queryDB(querystr, queryvalue).then()

        querystr = `INSERT INTO n_kalibrasi_penimbangan (id_timbangan,tanggal,titik_1,titik_2,titik_3,titik_4,titik_5,id_user)
        VALUES('${vidtimbangan}',NOW(),${ptitik1},${ptitik2},${ptitik3},${ptitik4},${ptitik5},'${idkaryawan}');`
        await tabel.queryDB(querystr, queryvalue).then()

        querystr = `COMMIT`
        await tabel.queryDB(querystr, queryvalue).then()

        response.ok({'message': 'sukses'}, 200, response)
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.formshow_kalibrasitimbangan = async (req, res) => {
    try {
        const data = await globalf.select_konstanta_kalibrasitimbangan()

        response.ok(data.rows, 200, res)
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}