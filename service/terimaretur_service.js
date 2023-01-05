'use strict';
const response = require('../res/res');
const tabel = require('../conn/tabel');

let querystr = '';
let queryvalue = '';

exports.terima_retur = async (req, res) => {
    try {
        querystr = `SELECT no_roll,nama_kain,jenis_warna,berat,status_terima,kode_verifikasi,kode_spk FROM cetak_labelretur cl JOIN kain k USING(id_kain) JOIN warna w USING(id_warna) WHERE STATUS=1;`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            response.ok(onres.rows, 200, res)
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.btn_terima_retur = async (req, res) => {
    let { troll, tverfikasi, tberat, vsverifikasi, idkaryawan } = req.body;
    let statusterima, statusjual, nodetail, no, berat, noroll2, noterima, hargalama, berattimbang, brt, rollawal, bruto, netto, beratbaru, beratnetto, nodetail2, brt2, jmlroll2, berattotal;
    try {
        if (troll == '' || troll == undefined) {
            response.ok({'message': 'No roll harus diisi!' }, 201, res)
        } else if (tverfikasi == '' || tverfikasi == undefined) {
            response.ok({'message': 'Kode verifikasi harus diisi!' }, 201, res)
        } else if (tberat == '' || tberat == undefined) {
            response.ok({'message': 'Berat harus diisi!' }, 201, res)
        } else if (parseFloat(tberat) == 0) {
            response.ok({'message': 'Berat tidak boleh 0!' }, 201, res)
        } else {
            querystr = `SELECT * FROM cetak_labelretur WHERE no_roll='${troll}' AND STATUS=1;`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows.length == 0) {
                    response.ok({'message': 'No roll tidak terdaftar di data penerimaan retur!' }, 201, res)
                } else {
                    querystr = `SELECT * FROM cetak_labelretur WHERE no_roll='${troll}' AND STATUS=1 AND kode_verifikasi='${tverfikasi}';`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        if (onres.rows.length == 0) {
                            response.ok({'message': 'Kode verifikasi salah!' }, 201, res)
                        } else {
                            statusterima = onres.rows[0].status_terima
                            statusjual = onres.rows[0].status_jual
                            nodetail = onres.rows[0].no_detail
                            no = onres.rows[0].no
                            berat = onres.rows[0].berat
                            noroll2 = onres.rows[0].no_roll
                            
                            querystr = `SELECT no_terima,dpr.harga FROM detail_penerimaanstok dp JOIN detail_returpenjualanstok dr ON dp.no_detail=dr.no_detail
                            JOIN detail_pengeluaranstok dpr ON dr.no_detailpenjualan=dpr.no_detail  WHERE dp.no_detail='${nodetail}';`
                            queryvalue = []
                            await tabel.queryDB(querystr,queryvalue).then(async onres => {
                                noterima = onres.rows[0].no_terima
                                hargalama = onres.rows[0].harga

                                berattimbang = parseFloat(tberat)
                                querystr = `SELECT DATA FROM konstanta WHERE jenis='RETUR ROLLAN';`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                    if (onres.rows.length == 0) {
                                        response.ok({'message': 'RETUR ROLLAN tidak terdaftar di konstanta, silahkan hubungi bagian IT!' }, 201, res)
                                    } else {
                                        if (statusterima == 'ROLLAN' && berattimbang <= parseFloat(onres.rows[0].data)) {
                                            response.ok({'message': 'Jenis kain salah silahkan isi menjadi kgan!' }, 201, res)
                                        } else {
                                            querystr = `SELECT roll_terima,(SELECT pps.berat FROM  detail_pengeluaranstok dp JOIN perincian_pengeluaranstok pps USIN (no_Detail) WHERE dp.no_pengeluaran=rts.no_pengeluaran AND pps.no_roll=pp.roll_awal ) AS brt FROM retur_penjualanstok rts JOIN detail_returpenjualanstok dpr ON dpr.no_terimaretur=rts.no_terimaretur JOIN perincian_penerimaanreturstok pp ON dpr.no_detail=pp.no_detailretur WHERE rts.no_terimaretur='${noterima}' AND roll_terima ='${troll}';`
                                            queryvalue = []
                                            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                                if (onres.rows.length > 0) {
                                                    brt = onres.rows[0].brt
                                                    if (parseFloat(tberat) > (brt + 0.02)) {
                                                        response.ok({'message': `Transaksi tidak bisa dilanjutkan karena berat kain yang di retur lebih besar dari berat order (${parseFloat(brt)} Kg) !` }, 201, res)
                                                    } else {
                                                        querystr = `SELECT DATA FROM konstanta WHERE jenis='VERIFIKASI SUPERVISOR';`
                                                        queryvalue = []
                                                        await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                                            if ((brt + 0.01) - parseFloat(tberat) >= parseFloat(onres.rows[0])) {
                                                                querystr = `SELECT status,berat FROM n_verifikasi WHERE no_roll='${troll}' AND keterangan='TERIMA RETUR' ORDER BY NO DESC LIMIT 1;`
                                                                queryvalue = []
                                                                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                                                    console.log(onres);
                                                                    if (onres.rows.length == 0 || onres.rows[0].status == 2) {
                                                                        querystr = `INSERT INTO n_verifikasi VALUES(0,'${troll}',NULL,'${parseFloat(brt)}','${tberat}','${idkaryawan}',NULL,'${vsverifikasi}',NULL,NULL,0)`
                                                                        queryvalue = []
                                                                        await tabel.queryDB(querystr, queryvalue).then()

                                                                        response.ok({'message': 'insert new data sukses'}, 200, res)
                                                                    } else if (onres.rows[0].status == 1) {
                                                                        querystr = `update n_verifikasi set status=2 where no_roll='${troll}' and keterangan='TERIMA RETUR'`
                                                                        queryvalue = []
                                                                        await tabel.queryDB(querystr, queryvalue).then()

                                                                        response.ok({'message': 'update status=2 sukses'}, 200, res)
                                                                    } else if (onres.rows[0].status == 0 || parseFloat(onres.rows[0].berat) != parseFloat(tberat)) {
                                                                        querystr = `update n_verifikasi set berat='${brt}',berat2='${tberat}'  where no_roll='${noroll2}' and keterangan='${vsverifikasi}' and status=0`
                                                                        queryvalue = []
                                                                        await tabel.queryDB(querystr, queryvalue).then()

                                                                        response.ok({'message': 'update berat sukses'}, 200, res)
                                                                    }
                                                                })
                                                            }
                                                        })
                                                    }
                                                    
                                                    querystr = `SELECT IF('${tberat}' > '${brt}' OR '${tberat}' >= '${brt}'-0.02,1,0) AS sts;`
                                                    queryvalue = []
                                                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                                        if (onres.rows.length > 0 && parseInt(onres.rows[0].sts) > 0) {
                                                            berattimbang = brt
                                                        }
                                                    })
                                                }

                                            })
                                            
                                            querystr = `START TRANSACTION`
                                            queryvalue = []
                                            await tabel.queryDB(querystr, queryvalue).then()

                                            querystr = `select roll_awal from perincian_penerimaanreturstok where roll_terima='${troll}'`
                                            queryvalue = []
                                            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                                if (onres.rows.length == 0) {
                                                    response.ok({'message': 'Data tidak terdaftar di data retur, silahkan hubungi bagian IT !'})
                                                } else {
                                                    rollawal = onres.rows[0].roll_awal

                                                    querystr = `select * from e_detailpenerimaan  where no_roll='${rollawal}'`
                                                    queryvalue = []
                                                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                                        if (onres.rows.length != 0) {
                                                            bruto = onres.rows[0].bruto
                                                            netto = onres.rows[0].netto
                                                        } else {
                                                            querystr = `select * from perincian_penerimaanstok  where no_roll='${rollawal}'`
                                                            queryvalue = []
                                                            await tabel.queryDB(querystr, queryvalue).then(async onres=> {
                                                                bruto = onres.rows[0].berat_terima
                                                                netto = bruto * 0.8

                                                                netto = bruto - netto

                                                                beratbaru = bruto / netto * berattimbang
                                                            })
                                                        }
                                                    })
                                                }
                                            })

                                            if (statusjual == 'ROLLAN' && statusterima == 'KGAN') {
                                                querystr = `update cetak_labelretur set status_terima='KGAN' where no='${no}'`
                                                queryvalue = []
                                                await tabel.queryDB(querystr, queryvalue).then()

                                                beratbaru = beratbaru

                                                beratnetto = beratbaru - berattimbang
                                            } else {
                                                beratbaru = berattimbang
                                            }

                                            querystr = `update cetak_labelretur set status=2 where no='${no}'`
                                            queryvalue = []
                                            await tabel.queryDB(querystr, queryvalue).then()

                                            querystr = `update perincian_penerimaanstok set berat='${beratbaru}',berat_terima='${beratbaru}' where terima_dari='RETURAN' and no_roll='${troll}';`
                                            queryvalue = []
                                            await tabel.queryDB(querystr, queryvalue).then()

                                            querystr = `update perincian_penerimaanreturstok set berat='${beratbaru}' where roll_terima='${troll}'`
                                            queryvalue = []
                                            await tabel.queryDB(querystr, queryvalue).then()

                                            querystr = `select no_detailretur from  perincian_penerimaanreturstok  where roll_terima='${troll}'`
                                            queryvalue = []
                                            await tabel.queryDB(querystr, queryvalue).then(async onres =>{
                                                nodetail2 = onres.rows[0].no_detailretur
                                            })

                                            querystr = `select sum(berat) as brt,count(no) as jmlroll from  perincian_penerimaanreturstok  where no_Detailretur='${nodetail2}'`
                                            queryvalue = []
                                            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                                brt2 = onres.rows[0].brt
                                                jmlroll2 = onres.rows[0].jmlroll
                                            })

                                            querystr = `UPDATE detail_returpenjualanstok SET berat='${brt2}',roll='${jmlroll2}' WHERE no_detail='${nodetail2}';`
                                            queryvalue = []
                                            await tabel.queryDB(querystr, queryvalue).then()

                                            querystr = `select sum(berat) as brt from perincian_penerimaanstok where no_detail='${nodetail}'`
                                            queryvalue = []
                                            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                                berattotal = onres.rows[0].brt
                                            })
                                            
                                            querystr = `UPDATE detail_penerimaanstok SET berat='${berattotal}' WHERE no_detail='${nodetail}';`
                                            queryvalue = []
                                            await tabel.queryDB(querystr, queryvalue).then()
                                            
                                            querystr = `SELECT * FROM cetak_labelretur cl JOIN detail_penerimaanstok ds USING(no_detail) WHERE no_terima='${noterima}' AND cl.status=1;`
                                            queryvalue = []
                                            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                                if (onres.rows.length == 0) {
                                                    querystr = `update pembelian_kainstok  set status=10 where no_terima='${noterima}'`
                                                    queryvalue = []
                                                    await tabel.queryDB(querystr,queryvalue).then()
                                                }
                                            })

                                            querystr = `COMMIT`
                                            queryvalue = []
                                            await tabel.queryDB(querystr, queryvalue).then()

                                            response.ok({'message': 'Data berhasil di simpan!'})
                                        }
                                    }
                                })
                            })
                        }
                    })
                }
            })
        }
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }

}

exports.btncetakulang_terimaretur = async (req, res) => {
    try {
        let { no_roll } = req.body
        
        querystr = `select no_roll,nama_kain,jenis_warna,berat,status_terima,kode_verifikasi,kode_spk from cetak_labelretur cl join kain k using(id_kain) join warna w using(id_warna) where status=1`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length == 0) {
                response.ok({'message': 'Tidak ada data yang bisa di print ulang!'})
            } else {
                querystr = `SELECT * FROM cetak_labelretur cl JOIN kain k USING(id_kain) 
                JOIN warna w USING(id_warna) JOIN customer c USING(id_customer) 
                WHERE cl.status=1 AND no_roll='${no_roll}';`
                queryvalue = []
                await tabel.queryDB(querystr,queryvalue).then(async onres => {
                    response.ok(onres.rows, 200, res)
                })
            }
        })

    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.btnambilberatdarisistem_terimaretur = async (req, res) => {
    try {
        let { troll, tverifikasi } = req.body
        let statusterima, tberat

        querystr = `select no_roll,nama_kain,jenis_warna,berat,status_terima,kode_verifikasi,kode_spk from cetak_labelretur cl join kain k using(id_kain) join warna w using(id_warna) where status=1`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length != 0) {
                querystr = `select * from cetak_labelretur where no_roll='${troll}' and status=1 and kode_verifikasi='${tverifikasi}'`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    if (onres.rows.length == 0) {
                        response.ok({'message': 'Kode verifikasi salah!'}, 201, res)
                    } else {
                        statusterima = onres.rows[0].status_terima

                        if (statusterima == 'KGAN') {
                            response.ok({'message': 'Tidak bisa mengambil berat sistem karena jenis kain bukan Rollan!'})
                        } else {
                            querystr = `select berat from cetak_labelretur cl join kain k using(id_kain) join warna w using(id_warna) where status=1 and no_roll='${troll}'`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                tberat = onres.rows[0].berat
                            })
                            
                        }
                    }
                })
                response.ok({'message': statusterima, tberat}, 200, res)
            }
        })

    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.trollKeyDown_terimaretur = async (req, res) => {
    try {
        let { troll } = req.body
        let tverfikasi

        querystr = `select * from cetak_labelretur where no_roll='${troll}' and status=1`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length == 0) {
                response.ok({'message':'No roll tidak terdaftar di data penerimaan retur!'})
            } else {
                tverfikasi = onres.rows[0].kode_verifikasi

                response.ok(onres.rows, 200, res)
            }
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.tverifikasiKeyDown_terimaretur = async (req, res) => {
    try {
        let { troll, tverifikasi } = req.body

        querystr = `select * from cetak_labelretur where no_roll='${troll}' and status=1 and kode_verifikasi='${tverifikasi}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length == 0) {
                response.ok({'message': 'Kode verifikasi Salah!'}, 201, res)
            } else {
                response.ok(onres.rows, 200, res)
            }
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.ubahnetto = async (req, res) => {
    try {
        const props = req.body
        const page = ''
        const myFunc = new HandleFunctionChangeNetto(props, page)
        return response.ok({ pesan: await myFunc.ubahNetto() }, 200, res)
    } catch (e) {
        console.log(e)
        response.ok({ "message": tabel.GetError(e) }, 300, res)
        return
    }
}