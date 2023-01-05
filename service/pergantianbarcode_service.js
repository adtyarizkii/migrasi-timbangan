'use strict';
const response = require('../res/res');
const tabel = require('../conn/tabel');

let querystr = '';
let queryvalue = '';

exports.pergantian_barcode = async (req, res) => {    
    try {
        let { no_roll, kodeverifikasi, sistem, plastik, fisik, idKaryawan, berat, jkn2, wrn2} = req.body;
        let rollbaru, tbl, kolom, no
    
        const bsistem = parseFloat(sistem) + parseFloat(plastik)
        const bfisik = parseFloat(fisik)

        if (no_roll.substring(0, 1).toUpperCase() != 'A') {
            response.ok({ 'message': 'No roll bukan kain pecahan' }, 201, res)
        } 
        if (Math.abs(bsistem - bfisik) > 0.02) {
            response.ok({ 'message': 'Berat fisik harus sama dengan berat sistem' }, 201, res)
        }

            querystr = `SELECT kode_roll FROM data_cabang LIMIT 1;`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                rollbaru = onres.rows[0].kode_roll
            })

            querystr = `START TRANSACTION`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then()

            querystr = `INSERT INTO n_pergantian_rollcabang VALUES(0,NOW(),'${no_roll}','${rollbaru}','${idKaryawan}')`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then()

            querystr = `SELECT * FROM s_tabelnoroll;`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                tbl = onres.rows[0].nama_tabel
                kolom = onres.rows[0].nama_field

                querystr = `SELECT ${kolom} FROM ${tbl} WHERE '${kolom}'='${no_roll}';`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    if (onres.rows.length > 0) {
                        querystr = `UPDATE ${tbl} SET ${kolom}='${rollbaru}' WHERE ${kolom}='${no_roll}'`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then()

                        response.ok({ "message": "sukses"}, 200, res)
                    } else {
                        querystr = `INSERT INTO cetak_barcodetimbangan 
                        VALUES(0,'${rollbaru}','${berat}',0,'${idKaryawan}','${jkn2}','${wrn2}','PERGANTIAN BARCODE','${kodeverifikasi}');`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then()
                   
                        querystr = `select max(no) as no from cetak_barcodetimbangan`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then(async onres => {
                            no = onres.rows[0].no
                        })

                        querystr = `COMMIT`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then()

                        querystr = `select *,concat(berat,' Kg') as brt from cetak_barcodetimbangan where no='${no}'`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then(async onres => {
                            
                        })

                        response.ok({ "message": "Data berhasil di cetak ulang"}, 200, res)
                    }
                })
            })
    } catch (error) {
        response.ok({ 'message': tabel.GetError(error) }, 300, res)
    }
}

exports.Edit1KeyDown_pergantianbarcode = async (req, res) => {
    try {
        let { no_roll, tsistem } = req.body
        let berat, jkn2, wrn2, kodeverifikasi, status, tverifikasi, tplastik
        
        querystr = `select * from v_stokglobal_transfer where no_roll='${no_roll}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length == 0) {
                response.ok({'message': 'No roll tidak terdaftar di stok!'}, 201, res)
            } else {
                berat = onres.rows[0].berat_asal
                jkn2 = onres.rows[0].nama_kain
                wrn2 = onres.rows[0].jenis_warna
                kodeverifikasi = onres.rows[0].kode
                
                tsistem = onres.rows[0].berat_asal

                if (status > 2) {
                    tverifikasi.focus()
                } else {
                    tverifikasi = onres.rows[0].kode
                    if (onres.rows[0].jenis_kain == 'BODY' && onres.rows[0].berat_asal >= 5) {
                        tplastik = '0.15'
                    } else if ((onres.rows[0].jenis_kain == 'RIB' || onres.rows[0].jenis_kain == 'RIBF' || onres.rows[0].jenis_kain == 'RIBS' || onres.rows[0].jenis_kain == 'KRAH' || onres.rows[0].jenis_kain == 'MANSET') && onres.rows[0].berat_asal >= 5) {
                        tplastik = '0.10'
                    } else {
                        tplastik = '0'
                    }
                }
                response.ok({'message': berat, jkn2, wrn2, kodeverifikasi, status, tverifikasi, tplastik}, 200, res)
            }
        })
    } catch (error) {
        response.ok({ 'message': tabel.GetError(error) }, 300, res)
    }
}

exports.frxReportpecahanGetValue_pergantianbarcode = async (req, res) => {
    try {
        const { qpecahanno_roll } = req.body
        let varname, value, rollinduk, rollpecah

        if (qpecahanno_roll.toUpperCase().substr(0, 1) == 'R') {
            rollinduk = qpecahanno_roll
            rollpecah = ''
        } else {
            querystr = `SELECT * FROM data_pecahroll WHERE roll2='${qpecahanno_roll}'`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                rollinduk = onres.rows[0].roll_induk
                rollpecah = qpecahanno_roll
            })
        }
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

        querystr = `SELECT * FROM v_penimbangan2SELECT * FROM n_stok WHERE no_roll='${qpecahanno_roll}';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (varname == 'nodata') {
                value = onres.rows[0].kode_spk
            }
        })
        response.ok({varname, value, rollinduk, rollpecah}, 200, res)
    } catch (error) {
        response.ok({ 'message': tabel.GetError(error) }, 300, res)
    }
}

exports.tverifikasiKeyDown_pergantianbarcode = async (req, res) => {
    try {
        let {noroll, unik} = req.body
        let berat, jkn2, wrn2, kodeverifikasi, tplastik
        querystr = `select * from v_stokglobal_transfer where no_roll='${noroll}' and kode=${unik}`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length == 0) {
                response.ok({'message': 'No roll tidak terdaftar di Stok!'}, 201, res)
            } else {
                berat = onres.rows[0].berat_asal
                jkn2 = onres.rows[0].nama_kain
                wrn2 = onres.rows[0].jenis_warna
                kodeverifikasi = onres.rows[0].kode

                if (onres.rows[0].jenis_kain == 'BODY' && onres.rows[0].berat_asal >= 5) {
                    tplastik = '0.15'
                } else if ((onres.rows[0].jenis_kain == 'RIB' || onres.rows[0].jenis_kain == 'RIBF' || onres.rows[0].jenis_kain == 'RIBS' || onres.rows[0].jenis_kain == 'KRAH' || onres.rows[0].jenis_kain == 'MANSET') && onres.rows[0].berat_asal >= 5) {
                    tplastik = '0.10'
                } else {
                    tplastik = '0'
                }
            }
            response.ok({berat, jkn2, wrn2, kodeverifikasi, tplastik}, 200, res)
        })
    } catch (error) {
        response.ok({ 'message': tabel.GetError(error) }, 300, res)
    }
}