const response = require('../res/res');
const tabel = require('../conn/tabel');

let querystr = '';
let queryvalue = '';

async function data_noroll(noroll, namakain) {
    return new Promise(async (resolve, reject) => {
        try {
            querystr = `select no_roll from n_stok join kain using(id_kain)`
            if ((noroll && noroll != '') || (namakain && namakain != '')) {
                querystr = querystr + `where no_roll ='${noroll}' and nama_kain like '%${namakain}%'`
            }
            queryvalue = []
            const data = await tabel.queryDB(querystr, queryvalue).then(onres => onres.rows)
            resolve(data)
        } catch (e) {
            reject(e)
        }
    })
}

exports.norollnstok_catatroll = async (req, res) => {
    try {
        let { noroll, namakain } = req.query
        
        const data = await data_noroll(noroll, namakain)

        if (data > 0) {
            response.ok(data, 200, res)
        } else {
            response.ok(data, 200, res)
        }
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.catat_roll_pabrik = async (req, res) => {
    let brutto, limit, bert, stsproses, pesan, bpabrik, npabrik, selisih, selisihfisik, idc, idkaryawan;
    let { berat_timbang_awal, no_roll_toko, v_noorder, no_roll_pabrik, no_roll_celupan, tplastik } = req.body;
    try {
        if (berat_timbang_awal == '' || berat_timbang_awal == undefined) {
            response.ok({ "message": "Silahkan isi berat timbang awal terlebih dahulu!" }, 201, res)
        } else if (berat_timbang_awal == '0' || berat_timbang_awal == 0) {
            response.ok({ "message": "Berat tidak boleh 0 !" }, 201, res)
        } else if (berat_timbang_awal > 35) {
            response.ok({ "message": "Berat timbang awal tidak boleh lebih dari 35" }, 201, res)
        } else {
            stsproses = 'JALAN'
        querystr = `SELECT berat FROM perincian_penerimaanstok WHERE no_roll='${no_roll_toko}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            brutto = onres.rows[0].berat;
            
            bert = (brutto - (parseFloat(berat_timbang_awal))) + 0.01;

            limit = (bert / brutto) * 100;

            let abss = Math.abs(bert)

            if (abss > 10){
                response.ok({ "message": "Selisih tidak boleh lebih atau kurang dari 10 KG!" }, 201, res)
            } else {
                querystr = `SELECT no_roll FROM n_stok JOIN kain USING(id_kain) WHERE no_roll ='${no_roll_toko}' AND nama_kain LIKE '%pique%';`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    if (onres.rows.length > 0) {
                        if (Math.abs(limit) >= 9) {
                            stsproses = 'JALAN'
                        } else {
                            stsproses = 'STOP'
                        }
                    } else {
                        querystr = `SELECT no_roll FROM n_stok JOIN kain USING(id_kain) WHERE no_roll ='${no_roll_toko}' AND nama_kain LIKE '%fleece%';`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then(async onres => {
                            if (onres.rows.length > 0) {
                                if (Math.abs(limit) >= 13) {
                                    response.ok({ "message": `Data brutto dan netto ada selisih ${parseFloat(limit)}% apakah Anda yakin akan menyimpan data?` }, 201, res)
                                    if (pesan == 'YES') {
                                        stsproses = 'JALAN'
                                    } else {
                                        stsproses = 'STOP'                                        
                                    }
                                } else if (Math.abs(limit) >= 8 && Math.abs(limit) <= 15) {
                                    response.ok({ "message": `Data brutto dan netto ada selisih ${parseFloat(limit)}% apakah Anda yakin akan menyimpan data?` }, 201, res)
                                    if (pesan == 'YES') {
                                        stsproses = 'JALAN'
                                    } else {
                                        stsproses = 'STOP'                                        
                                    }
                                } else if (Math.abs(limit)>15) {
                                    response.ok({ "message": `Selisih Netto dan bruto lebih dari 15% apakah Anda yakin akan menyimpan data?` }, 201, res)
                                    if (pesan == 'YES') {
                                        stsproses = 'JALAN'
                                    } else {
                                        stsproses = 'STOP'                                        
                                    }
                                }
                                if (stsproses == 'JALAN') {
                                    response.ok({ "message": "Berhasil di simpan" }, 201, res)
                                } else {
                                    response.ok({ "message": "Simpan dibatalkan" }, 201, res)
                                }
                            } else {
                                response.ok({ "message": "Empty!" }, 201, res)
                            }
                        })
                    }
                })
            }

        })}

        if (stsproses == 'JALAN') {
            querystr = `SELECT bruto,netto FROM e_detailpenerimaan WHERE no_roll='${no_roll_toko}';`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows.length != 0) {
                    bpabrik = onres.rows[0].bruto
                    npabrik = onres.rows[0].netto
                } else {
                    querystr = `SELECT berat_terima FROM perincian_penerimaanstok WHERE no_roll='${no_roll_toko}';`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        if (onres.rows.length != 0) {
                            bpabrik = onres.rows[0].berat_terima
                            npabrik = 0
                        }
                    })
                }
            })
        }

        selisih = bpabrik * 0.08
        selisihfisik = parseFloat(berat_timbang_awal) * 0.08

        querystr = `START TRANSACTION`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then()

        querystr = `SELECT id FROM n_cycle_potong WHERE no_order='${v_noorder}' AND no_roll='${no_roll_toko}';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length > 0) {
                idc = onres.rows[0].id

                querystr = `UPDATE n_cycle_potong SET tanggal_netto=NOW(),berat_netto='${berat_timbang_awal}' WHERE id='${idc}';`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then()
            }
        })

        querystr = `INSERT INTO n_pencatatannetto 
        VALUES(0,'${no_roll_toko}','${bpabrik}','${npabrik}','${berat_timbang_awal}','${selisih}','${selisihfisik}');`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then()

        querystr = `SELECT * FROM pencatatan_rollcelupan WHERE no_rolltoko='${no_roll_toko}';`
        querystr = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length > 0) {
                querystr = `UPDATE pencatatan_rollcelupan SET no_rollcelupan='${no_roll_celupan}',no_rollpabrik='${no_roll_pabrik}',id_karyawan='${idkaryawan}',tanggal=NOW() WHERE no_rolltoko='${no_roll_toko}';`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then()
            } else {
                querystr = `INSERT INTO pencatatan_rollcelupan VALUES('${no_roll_toko}','${no_roll_celupan}','${no_roll_pabrik}','${idkaryawan}',NOW());`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then()
            }
        })

        querystr = `select * from perincian_pengeluaranstok where no_roll ='${no_roll_toko}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length > 0) {
                response.ok({ 'message': 'Ada kesalahan sistem saat netto, silahkan ulangi!' }, 201, res)

                querystr = `ROLLBACK`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then()
            }
        })

        querystr = `SELECT no_roll FROM n_stok WHERE no_roll='${no_roll_toko}' AND jenis='CUTTING LOSS';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length > 0) {
                querystr = `UPDATE n_stok SET jenis='BAGUS' WHERE no_roll='${no_roll_toko}';`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then()
                
                response.ok({ 'message': 'sukses' }, 200, res)
            } else {
                querystr = `ROLLBACK`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then()

                response.ok({ 'message': 'Gagal Netto, silahkan hubungi batian IT.' }, 201, res)
            }
        })

        querystr = `COMMIT`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then()

    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}


exports.sp_catatrollpabrik = async (req, res) => {
    try {
        let { edit25, edit23, edit22, edit24, v_noorder, idkaryawan } = req.body

        querystr = `CALL sp_catatrollpabrik('${edit25}', '${edit22}', '${edit23}', '${edit24}', '${v_noorder}', ${idkaryawan})`
        await tabel.queryDB(querystr, queryvalue).then()
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}