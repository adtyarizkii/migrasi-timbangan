const response = require('../res/res');
const tabel = require('../conn/tabel');

let querystr = '';
let queryvalue = '';

exports.keterangan_barcode = async (req, res) => {
    try {
        querystr = `SELECT keterangan FROM n_keterangan_cetakulang ORDER BY id;`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            response.ok(onres.rows, 200, res)
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.keterangan_barcode_input = async (req, res) => {
    let { vket, noroll, statusproses, idKaryawan } = req.body
    try {
        if (vket == '' || vket == undefined) {
            response.ok({ "message": "Keterangan tidak boleh kosong !" }, 201, res)
        } else {
            querystr = `INSERT INTO n_cetakulang_barcode
            VALUES(0,NOW(),'${noroll}','${statusproses}','${vket}','${idKaryawan}')`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then()

            response.ok({ "message": "sukses"}, 200, res)
        }
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}