const response = require('../res/res');
const tabel = require('../conn/tabel');

let querystr = '';
let queryvalue = '';

exports.cetak_barcode_pecahan = async (req, res) => {
    try {
        let { idkaryawan } = req.params

        querystr = `SELECT * FROM cetak_barcodetimbangan WHERE id_karyawan='${idkaryawan}' AND catatan='BAGUS' OR ((catatan='BS' OR catatan='SEGEl') AND berat > 1)  ORDER BY NO DESC LIMIT 10;`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length == 0) {
                response.ok({ "message": "Tidak ada data yang bisa di print ulang!" }, 201, res)
            } else {
                response.ok(onres.rows, 200, res)
            }
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.btn_cetak_barcode_pecahan = async (req, res) => {
    try {
        let { idkaryawan, no, noroll } = req.params
        let nopecah

        querystr = `SELECT * FROM cetak_barcodetimbangan WHERE id_karyawan='${idkaryawan}' AND catatan='BAGUS' OR ((catatan='BS' OR catatan='SEGEl') AND berat > 1)  ORDER BY NO DESC LIMIT 10;`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length == 0) {
                response.ok({ "message": "Tidak ada data yang bisa di print ulang!" }, 201, res)
            }
        })

        querystr = `UPDATE cetak_barcodetimbangan SET status=0 WHERE NO='${no}';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then()

        querystr = `SELECT * FROM cetak_barcodetimbangan WHERE no_roll='${noroll}';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length > 0) {
                nopecah = onres.rows[0].no

                querystr = `update cetak_barcodetimbangan set status=1 where no='${nopecah}';`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then()

                querystr = `select *,concat(berat,'' Kg'') as brt from cetak_barcodetimbangan where no='${nopecah}'`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then()
            }
        })
        response.ok({ "message": 'Data berhasil di cetak ulang' }, 201, res)
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.frxReportpecahanGetValue = async (req, res) => {
    try {
        let {noroll } = req.query
        let rollinduk, rollpecah, varname, value

        querystr = `SELECT * FROM data_pecahroll WHERE roll2='${noroll}';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres=> {
            rollinduk = onres.rows[0].roll_induk
            rollpecah = noroll
        })

        if (varname = 'rollinduk') {
            value = rollinduk
        } else if (varname = 'trollpecah') {
            value = 'Roll Pecahan'
        } else if (varname = 'rollpecah') {
            value = rollpecah
        }

        querystr = `SELECT * FROM n_stok WHERE no_roll='${noroll}';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (varname = 'nodata') {
                value = onres.rows[0].kode_spk
            }
        })

        response.ok({'message': varname, value, rollinduk, rollpecah }, 200, res)
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}