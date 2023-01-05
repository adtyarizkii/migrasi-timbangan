const response = require('../res/res');
const tabel = require('../conn/tabel');

let querystr = '';
let queryvalue = '';


exports.cetak_ulang = async (req, res) => {
    let { noroll } = req.body;
    let berat, jkn2, wrn2, kodeverifikasi;
    try {
        querystr = `SELECT * FROM perincian_penerimaanstok WHERE no_roll='${noroll}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length == 0) {
                response.ok({ "message": "No roll tidak terdaftar di Stok" }, 201, res)
            } else {
                querystr = `SELECT * FROM v_stokglobal_transfer WHERE no_roll='${noroll}';`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    if (onres.rows.length > 0) {
                        berat = onres.rows[0].berat_asal
                        jkn2 = onres.rows[0].nama_kain
                        wrn2 = onres.rows[0].jenis_warna
                        kodeverifikasi = onres.rows[0].kode                        
                    }
                        response.ok({
                            berat: berat,
                            nama_kain: jkn2,
                            jenis_warna: wrn2,
                            kode_verifikasi: kodeverifikasi
                        }, 200, res)
                })
            }
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.cekystokall = async (req, res) => {
    try {
        let { noroll } = req.body

        querystr = `CALL cekystokall('${noroll}');`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            response.ok(onres.rows[0], 200, res)
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.btn_cetak_ulang = async (req, res) => {
    try {
        let { noroll, idkaryawan } = req.body;
        let berat, jkn2, wrn2, kodeverifikasi, no, sisapotong, vgroup, qplastik

        querystr = `SELECT * FROM perincian_penerimaanstok WHERE no_roll='${noroll}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length == 0) {
                response.ok({ "message": "No roll tidak terdaftar di Stok" }, 201, res)
            } else {
                querystr = `SELECT * FROM v_stokglobal_transfer WHERE no_roll='${noroll}';`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    if (onres.rows.length > 0) {
                        berat = onres.rows[0].berat_asal
                        jkn2 = onres.rows[0].nama_kain
                        wrn2 = onres.rows[0].jenis_warna
                        kodeverifikasi = onres.rows[0].kode                        
                    }
                })
            }
        })

        querystr = `INSERT INTO cetak_barcodetimbangan VALUES(0,'${noroll}','${berat}',0,'${idkaryawan}','${jkn2}','${wrn2}','CETAK ULANG','${kodeverifikasi}')`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then()

        querystr = `select max(no)  as no from cetak_barcodetimbangan`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            no = onres.rows[0].no
        })

        querystr = `select berat_asal from v_stokglobal_transfer where no_roll='${noroll}';`
        queryvalue = []
        await tabel.queryDB(querystr,queryvalue).then(async onres=>{
            if (onres.rows.length != 0) {
                sisapotong = onres.rows[0].berat_asal

                querystr = `SELECT *,CONCAT(berat_asal,' Kg') AS brt FROM v_stokglobal_transfer WHERE no_roll='${noroll}';`
                queryvalue = []
                await tabel.queryDB(querystr,queryvalue).then(async onres => {
                    qplastik = onres.rows
                })

                querystr = `SELECT * FROM kategori_sisakain WHERE '${sisapotong}' >=b_bawah AND '${sisapotong}'<b_atas AND jenis_kain='all';`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    if (onres.rows.length != 0 && qplastik.length != 0) {
                        if (sisapotong < 0.05) {
                            vgroup = `- ${sisapotong}`
                        } else {
                            vgroup = onres.rows[0].group
                        }
                    }
                })
            }
        })

        response.ok({'message': berat, jkn2, wrn2, kodeverifikasi, no, sisapotong, vgroup, qplastik }, 200, res)
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.frxReport2GetValue = async (req, res) => {
    try {
        let { noroll } = req.body
        let varname, value, ket, vketerangancetakulang

        querystr = `select berat_asal from v_stokglobal_transfer where no_roll='${noroll}';`
        queryvalue = []
        await tabel.queryDB(querystr,queryvalue).then(async onres=>{
            if (onres.rows.length != 0) {
                sisapotong = onres.rows[0].berat_asal

                querystr = `SELECT *,CONCAT(berat_asal,' Kg') AS brt FROM v_stokglobal_transfer WHERE no_roll='${noroll}';`
                queryvalue = []
                await tabel.queryDB(querystr,queryvalue).then(async onres => {
                    qplastik = onres.rows
                })

                querystr = `SELECT * FROM kategori_sisakain WHERE '${sisapotong}' >=b_bawah AND '${sisapotong}'<b_atas AND jenis_kain='all';`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    if (onres.rows.length != 0 && qplastik.length != 0) {
                        if (sisapotong < 0.05) {
                            vgroup = `- ${sisapotong}`
                        } else {
                            vgroup = onres.rows[0].group
                        }
                    }
                })
            }
        })

        if (varname == 'gplastik') {
            value = vgroup
        }

        querystr = `SELECT * FROM data_pecahroll WHERE roll1='${noroll}' or roll2='${noroll}';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (varname == 'rollinduk') {
                value = onres.rows[0].roll_induk
            }
        })

        querystr = `SELECT * FROM n_stok WHERE no_roll='${noroll}';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (varname == 'nodata') {
                value = onres.rows[0].kode_spk
            }
        })

        if (vketerangancetakulang == 'ORDER KAIN < 1KG') {
            ket = vketerangancetakulang
        } else {
            ket = 'BARCODE PENGGANTI'
        }

        if (varname == 'ket') {
            value = ket
        }

        response.ok({'message': varname, value, ket, vketerangancetakulang }, 200, res)
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.frxReportpecahanGetValue = async (req, res) => {
    try {
        let { noroll } = req.body
        let varname, value, rollinduk, rollpecah
        querystr = `SELECT * FROM data_pecahroll WHERE roll1='${noroll}' or roll2='${noroll}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length > 0) {
                rollinduk = onres.rows[0].roll_induk
                rollpecah = noroll
            } else {
                rollinduk = noroll
                rollpecah = ''
            }
        })

        if (varname == 'rollinduk') {
            value = rollinduk
        }

        if (varname == 'trollpecah') {
            if (rollpecah = '') {
                value = ''
            } else {
                value = 'Roll Pecahan'
            }
        }

        if (varname == 'rollpecah') {
            value = rollpecah
        }

        querystr = `SELECT * FROM n_stok WHERE no_roll='${noroll}';`
        queryvalue = []
        await tabel.queryDB(querystr,queryvalue).then(async onres => {
            if (varname == 'nodata') {
                value = onres.rows[0].kode_spk
            }
        })

        response.ok({'message': varname, value, rollinduk, rollpecah }, 200, res)
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}