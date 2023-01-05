const response = require('../res/res');
const tabel = require('../conn/tabel');

let querystr = '';
let queryvalue = '';

const globalf = require('./utility_service')

exports.kain_hilang_identitas = async (req, res) => {
    try {
        querystr = `select *,concat(berat,'Kg') as brt from n_kainhilangidentitas`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            response.ok(onres.rows, 200, res)
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.kain_hilang_identitas_input = async (req, res) => {
    let { twarna, tberat, tnoroll, tjeniskain, tlebar, tlot, idKaryawan, qhilang } = req.body;
    let no
    try {
        if (twarna == '' || twarna == undefined) {
            response.ok({ "message": "Warna harus diisi!" }, 200, res)
        } else if (tberat == '' || tberat == 0 || tberat == undefined) {
            response.ok({ "message": "Berat tidak boleh kosong atau 0 !" }, 200, res)
        } else {
            querystr = `START TRANSACTION`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then()

            querystr = `INSERT INTO n_kainhilangidentitas VALUES(0,'${tnoroll}', '${tjeniskain}', '${twarna}', '${tlebar}', '${tlot}', '${tberat}', '${idKaryawan}' )`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then()

            querystr = `SELECT MAX(NO) AS NO FROM n_kainhilangidentitas;`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                no = onres.rows[0].no
            })

            querystr = `SELECT * FROM n_kainhilangidentitas WHERE no_roll='${tnoroll}';`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows.length == 0) {
                    response.ok({ "message": "Data tidak ada, silahkan refresh!" }, 201, res)
                } else {
                    querystr = `UPDATE n_kainhilangidentitas SET nama_kain='${tjeniskain}', warna='${twarna}', lebar='${tlebar}',
                        lebar='${tlebar}',lot='${tlot}', berat='${tberat}', id_user='${idKaryawan}' 
                        WHERE no='${qhilang}'`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then()

                    querystr = `COMMIT`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then()

                    response.ok({ "message": "sukses" }, 200, res)
                }
            })
        }
        // strored procedure savekainhilangident
        // CALL savekainhilangident(
        // nomorHilang,
        // alamatReport = alamatReport + ' cetakkainhilangidentitas.Fr3'
        // clientAction = '(ENTER) Simpan'
        // nomor_roll,
        // jenis_kain,
        // warna,
        // lebar,
        // lot,
        // berat
        // id_karyawan
        // @out_msg); select @out_msg as pesan;
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 301, res)
    }
}

exports.selectkain_kainhilangidentitas = async (req, res) => {
    try {
        let data = await globalf.select_kain()

        response.ok(data.rows, 200, res)
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.selectwarna_kainhilangidentitas = async (req, res) => {
    try {
        let data = await globalf.select_warna()

        response.ok(data.rows, 200, res)
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}


exports.btnrefresh_kainhilangidentitas = async (req, res) => {
    try {

        querystr = `SELECT *,CONCAT(berat,'Kg') AS brt FROM n_kainhilangidentitas WHERE NO NOT IN (SELECT no_tanpaidentitas FROM n_pemasangankainhilang);`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            response.ok(onres.rows, 200, res)
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.btncetakulang_kainhilangidentitas = async (req, res) => {
    try {
        let { no } = req.params
        let respon

        querystr = `select *,concat(berat,' Kg') as brt from n_kainhilangidentitas where no='${no}';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            respon = onres.rows
        })
        response.ok({ 'message': 'Data berhasil di print ulang', respon }, 200, res)
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 301, res)
    }
}

exports.cxCheckBox1PropertiesChange_kainhilangidentitas = async (req, res) => {
    try {
        let lot, a

        querystr = `SELECT IFNULL(MAX(lot),'kosong') AS lot FROM n_kainhilangidentitas WHERE LENGTH(lot)=4 AND lot LIKE 'C%';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows[0].lot == 'kosong') {
                lot = 'C001'
            } else {
                lot = onres.rows[0].lot
                a = parseFloat(lot.substr(1)) + 1

                if (a.toString().length == 1) {
                    lot = 'C00' + parseFloat(a)
                } else if (a.toString().length == 2) {
                    lot = 'C0' + parseFloat(a)
                } else if (a.toString().length == 3) {
                    lot = 'C' + parseFloat(a)
                }
            }
            response.ok({ 'message': onres.rows, lot }, 200, res)
        })

    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 301, res)
    }
}

exports.cxGrid1DBTableView1KeyDown = async (req, res) => {
    try {
        let button3

        querystr = `select *,concat(berat,'Kg') as brt from n_kainhilangidentitas;`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length == 0) {
                response.ok({ 'message': 'Tidak ada data yang dipilih!' }, 201, res)
            } else {
                button3 = ' (ENTER) Simpan Edit'
                response.ok(onres.rows, 200, res)
            }
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 301, res)
    }
}

exports.cxGrid1DBTableView1KeyDown_hapus_kainhilangidentitas = async (req, res) => {
    try {
        let { no } = req.params

        querystr = `START TRANSACTION`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then()

        querystr = `delete from n_kainhilangidentitas where no='${no}';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then()

        querystr = `COMMIT`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then()

        response.ok({ 'message': 'Data berhasil dihapus' }, 200, res)
    } catch (error) {
        querystr = `ROLLBACK`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then()
        response.ok({ "message": 'Data gagal di hapus', 'Error': tabel.GetError(error) }, 301, res)
    }
}