'use strict';
const response = require('../res/res');
const tabel = require('../conn/tabel');

let querystr = '';
let queryvalue = '';

exports.stok_opname_kg = async (req, res) => {
    let tipe = ''
    let bplastik = 0
    let { no_roll, verifikasi, fisik, plastik, tsistem, tfisik } = req.body;
    let selisih
    try {
        if (no_roll == '' || no_roll == undefined) {
            response.ok({'message': 'No roll tidak boleh kosong!' }, 201, res)
        } 
        if (verifikasi == '' || verifikasi == undefined) {
            response.ok({'message': 'Kode verifikasi tidak boleh kosong!' }, 201, res)
        } 
        if (fisik == '' || fisik == undefined) {
            response.ok({'message': 'Berat fisik tidak boleh kosong!' }, 201, res)
        } 
        if(fisik < 0) {
            response.ok({'message': 'Berat fisik tidak boleh kurang dari 0' }, 201, res)
        } 
        if (fisik > 27) {
            response.ok({'message': 'Berat fisik tidak boleh lebih dari 27 Kg!' }, 201, res)
        } 
        
        querystr = `SELECT tipe_kain FROM perincian_penerimaanstok JOIN detail_penerimaanstok dp USING(no_Detail) JOIN kain k USING(id_kain) WHERE no_roll='${no_roll}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            tipe = onres.rows[0].tipe_kain
            if (tipe == 'BODY' && parseFloat(fisik) > 30) {
                response.ok({'message': 'Untuk kain body beratnya tidak boleh melibihi 30 KG!' }, 201, res)
            } 
            if (tipe != 'BODY' && parseFloat(fisik) > 20) {
                response.ok({'message': 'Untuk kain Rib, Krah, Manset beratnya tidak boleh melibihi 20 KG!' }, 201, res)
            } 
                
            querystr = `SELECT * FROM v_stokglobal_transfer WHERE no_roll='${no_roll}' AND sts='ROLLAN';`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows.length != 0) {
                    querystr = `SELECT * FROM perincian_pengeluaranstok WHERE no_roll='${no_roll}';`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        let respon = ''
                        if (onres.rows.length == 0) {
                            respon = 'Kain tersebut tidak boleh di stokopname karena belum ada penettoan!'
                        }
                        response.ok({'message': respon }, 201, res)
                    })
                        
                    querystr = `SELECT no_roll FROM penjualan_kainstok JOIN detail_pengeluaranstok USING(no_pengeluaran) JOIN perincian_pengeluaranstok USING(no_detail) 
                    WHERE (penjualan_melalui='TRANSAKSI' OR penjualan_melalui='PENJUALAN BS SEGEL') AND no_roll='${no_roll}';`
                    queryvalue = [];
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        let respon = ''
                        if (onres.rows.length > 0) {
                            respon = 'Kain tersebut sudah dijual!'
                        }
                        response.ok({'message': respon }, respon == '' ? 200 : 201, res)
                    })
                }
            })
        })

        if (plastik == '') {
            bplastik = 0
        } else {
            bplastik = parseFloat(plastik)
        }

        selisih = Math.abs(parseFloat(tsistem) - (parseFloat(tfisik) - bplastik))

        querystr = `select lower(data) as data from konstanta where jenis='LEPAS SELISIH KOREKSI'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            let respon = ''
            if (selisih > 3 && (onres.rows.length > 0 && onres.rows[0].data == 'tidak')) {
                respon = 'Selisih tidak boleh lebih dari 3 kg!'
            }
            response.ok({'message': respon}, respon == '' ? 200 : 201, res)
        })

    } catch (error) {
        response.ok(tabel.GetError(error), 301, res)
    }
}

// konfirmasi ke user
exports.stok_opname_kg2 = async (req, res) => {
    try {
        let { troll, tverifikasi, tsistem, idkaryawan, tfisik } = req.body
        let selisih, vsverifikasi, bplastik, sisapotong, vgroup, qplastik

        querystr = `select * from perincian_penerimaanstok where no_roll='${troll}' and kode='${tverifikasi}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length > 0) {
                
                querystr = `select * from v_stokglobal_transfer where no_roll='${troll}'`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    if (onres.rows[0].sts == 'ROLLAN' && onres.rows[0].b_order == 0) {
                        
                        querystr = `SELECT nama_kain FROM v_stokrollansementara WHERE nama_kain='${onres.rows[0].nama_kain}' 
                        AND jenis_warna='${onres.rows[0].jenis_warna}' AND kode_spk='${onres.rows[0].kode_spk}';`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then(async onres2 => {
                            let respon = ''
                            if (onres2.rows.length == 0) {
                                respon = `Kain tersebut tidak booleh di stokopname karean sedang di booking oleh order lain dan belum di scan!`
                            }
                            response.ok({'message': respon}, respon == '' ? 200 : 201, res)
                        })
                    }
                })

                querystr = `select data from konstanta where jenis='VERIFIKASI SUPERVISOR'`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    if (Math.abs(selisih) >= parseFloat(onres.rows[0].data)) {
                        vsverifikasi = 'SELISIH STOCK OPNAME BERAT'

                        querystr = `select status,berat from n_verifikasi where no_roll='${troll}' and keterangan='${vsverifikasi}'  ORDER BY NO DESC LIMIT 1 `
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then(async onres => {
                            if ((onres.rows.length == 0 || onres.rows[0].status == '2') && parseFloat(onres.rows[0].berat) != parseFloat(tsistem)) {

                                querystr = `INSERT INTO n_verifikasi VALUES(0,'${troll}',NULL,'${tsistem}'
                                ,'${parseFloat(tfisik) - bplastik}','${idkaryawan}',NULL,'${vsverifikasi}',NULL,NULL,0);`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then()

                            } else if (onres.rows[0].status == '1') {
                                querystr = `update n_verifikasi set status=2 where no_roll='${troll}' and keterangan='${vsverifikasi}'`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then()
                            } else if ((onres.rows[0].status == '0' || parseFloat(onres.rows[0].berat)) != parseFloat(tsistem)) {
                                querystr = `UPDATE n_verifikasi SET berat='${tsistem}',berat2='${parseFloat(tfisik) - bplastik}'
                                WHERE no_roll='${troll}' AND keterangan='${vsverifikasi}' AND STATUS=0;`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then()
                            }
                        })
                    }
                })

                querystr = `START TRANSACTION`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then()
                
                querystr = `insert into data_koreksikg values(0,now(),'${troll}','${tsistem}','${tfisik}','${idkaryawan}',0)`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then()

                querystr = `COMMIT`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then()

                response.ok({'message': 'Data berhasil di koreksi'}, 200, res)
            }
        })

        querystr = `select berat_asal from v_stokglobal_transfer where no_roll='${troll}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length != 0) {
                sisapotong = onres.rows[0].berat_asal

                querystr = `SELECT * FROM kategori_sisakain WHERE '${tsistem}' >=b_bawah and '${tsistem}'<b_atas and jenis_kain='all'`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    if (onres.rows.length != 0) {
                        vgroup = onres.rows[0].group
                    } else {
                        vgroup = ''
                    }
                })

                querystr = `select *,concat(berat_asal,' Kg') as brt from v_stokglobal_transfer where no_roll='${troll}'`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    qplastik = onres.rows
                })

                querystr = `SELECT * FROM kategori_sisakain WHERE '${sisapotong}' >=b_bawah and '${sisapotong}'<b_atas and jenis_kain='all'`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    if (onres.rows.length != 0 && vgroup != onres.rows[0].group && qplastik.length != 0) {
                        if (sisapotong < 0.05) {
                            vgroup = `- ${sisapotong}`
                        } else {
                            vgroup = onres.rows[0].group
                        }
                    }
                })
            }
        })
        response.ok({'message': selisih, vsverifikasi, bplastik, sisapotong, vgroup, qplastik}, 200, res)
    } catch (error) {
        response.ok({'message': tabel.GetError(error)}, 300, res)
    }
}

exports.formclose_stokopnamekg = async (req, res) => {
    try {
        let { troll } = req.body
        let statusproses,edit2,tstok

        if (statusproses == 'potong') {
            querystr = `SELECT IFNULL(berat_asal,'kosong') AS berat_asal,IFNULL(berat,'kosong') AS berat,IFNULL(b_order,'kosong') asberat_order,IFNULL(sts,'kosong') AS sts,IFNULL(kode,'kosong') AS kode FROM v_stokglobal_transfer WHERE no_roll='${troll}';`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows[0].berat_asal == 'kosong') {
                    // tidak ada action di delphi
                } else {
                    edit2 = onres.rows[0].berat_asal
                }
            })
        } else if (statusproses == 'pecah') {
            querystr = `SELECT IFNULL(berat_asal,'kosong') AS berat_asal,IFNULL(berat,'kosong') AS berat,IFNULL(b_order,'kosong') asberat_order,IFNULL(sts,'kosong') AS sts,IFNULL(kode,'kosong') AS kode FROM v_stokglobal_transfer WHERE no_roll='${troll}';`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows[0].berat_asal == 'kosong') {
                    // tidak ada action di delphi
                } else {
                    tstok = onres.rows[0].berat_asal
                }
            })
        } else if (statusproses == 'karung') {
            // fpembentukankarung.timertes.Enabled := true;
        } else {
            //   fantrianpenimbangan.ActiveControl := fantrianpenimbangan.Edit28;
        }
        response.ok({'message': statusproses,edit2,tstok}, 200, res)
    } catch (error) {
        response.ok({'message': tabel.GetError(error)}, 300, res)
    }
}

exports.trollKeyDown_stokopnamekg = async (req, res) => {
    try {
        let { troll } = req.body
        let tsistem, ketik, tverifikasi, tplastik

        querystr = `select * from v_stokglobal_transfer_all where no_roll='${troll}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length == 0) {
                response.ok({'message': 'No Roll sudah tidak terdaftar di database!'})
            } else {
                querystr = `SELECT no_roll FROM penjualan_kainstok JOIN detail_pengeluaranstok USING(no_pengeluaran) JOIN perincian_pengeluaranstok USING(no_detail) 
                WHERE (penjualan_melalui='TRANSAKSI' OR penjualan_melalui='PENJUALAN BS SEGEL') AND no_roll='${troll}';`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres2 => {
                    if (onres2.rows.length > 0) {
                        response.ok({'message': 'Kain tersebut sudah di jual!'})
                    }
                    tsistem = onres.rows[0].berat_asal

                    if (ketik > 1) {
                        tverifikasi.focus()
                    } else {
                        tverifikasi = onres.rows[0].kode
                        if (onres.rows[0].jenis_kain == 'BODY' && onres.rows[0].berat_asal >= 5) {
                            tplastik = '0.15'
                        } else if ((onres.rows[0].jenis_kain == 'RIB' || onres.rows[0].jenis_kain == 'RIBF' || onres.rows[0].jenis_kain == 'RIBS' || onres.rows[0].jenis_kain == 'KRAH' || onres.rows[0].jenis_kain == 'MANSET' ) && onres.rows[0].berat_asal >= 5) {
                            tplastik = '0.10'
                        } else {
                            tplastik = '0'
                        }
                    }
                })
            }
        })
        response.ok({'message': tsistem, ketik, tverifikasi, tplastik}, 200, res)
    } catch (error) {
        response.ok({'message': tabel.GetError(error)}, 300, res)
    }
}

exports.tverifikasiKeyDown_stokopnamekg = async (req, res) => {
    try {
        let { troll, tverifikasi } = req.body
        let tplastik

        querystr = `select * from v_stokglobal_transfer_all where no_roll='${troll}' and kode='${tverifikasi}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length == 0) {
                response.ok({'message': 'Kode verifikasi salah!'},200, res)
            } else {
                if (onres.rows[0].jenis_kain == 'BODY' && onres.rows[0].berat_asal >= 5) {
                    tplastik = '0.15'
                } else if ((onres.rows[0].jenis_kain == 'RIB' || onres.rows[0].jenis_kain == 'RIBF' || onres.rows[0].jenis_kain == 'RIBS' || onres.rows[0].jenis_kain == 'KRAH' || onres.rows[0].jenis_kain == 'MANSET' ) && onres.rows[0].berat_asal >= 5) {
                    tplastik = '0.10'
                } else {
                    tplastik = '0'
                }
            }
        })
    } catch (error) {
        response.ok({'message': tabel.GetError(error)}, 300, res)
    }
}