'use strict';
const response = require('../res/res')
const tabel = require('../conn/tabel');

let querystr = '';
let queryvalue = '';


exports.pilih_kain = async (req, res) => {
    try {
        let { kode, no_roll, no_order, qdatanorincian, qdatanodetail, qdataberatjual, tipekain, edit2, tsistem } = req.body;
        let llokasitujuan, vlokasidibawah1kg, k, t, tes, no, nodetail, border, tplastik, label8

        if ( kode == '' || kode == undefined) {
            response.ok({ 'message': 'Kode Verifikasi Harus Diisi!' }, 201, res)
        } else {
            querystr = `SELECT * FROM  perincian_penerimaanstok WHERE no_roll='${no_roll}' AND kode='${kode}'`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows.length == 0) {
                    response.ok({"message": "Kode verifikasi salah"}, 201, res)
                } else {
                    tes = no_roll.substr(0, 1)
                }

                if (onres.rows.length == 0) {
                    response.ok({"message": "No Roll Salah !"})
                } else {
                    querystr = `select * from penjualan_kainstok_temp where no_pengeluaran='${no_order}'`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        if (onres.rows.length > 0) {
                            querystr = `SELECT * FROM pergantian_roll WHERE no_rollpengganti='${no_roll}' AND no_order='${no_order}';`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                if (onres.rows.length == 0) {
                                    querystr = `SELECT * FROM perincian_pengeluaranstok_temp JOIN detail_pengeluaranstok_temp USING(no_detail) WHERE no_roll='${no_roll}' AND no_pengeluaran='${no_order}';`
                                    queryvalue = []
                                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                        if (onres.rows.length == 0) {
                                            response.ok({"message": "Silahkan melakukan cetak faktur sementara terlebih dahulu"})
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })

            querystr = `select no_lokasi from n_lokasiorder_dibawah1kg where no_order='${no_order}'`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows.length == 0) {
                    if (vlokasidibawah1kg = '') {
                        llokasitujuan = ''
                        vlokasidibawah1kg = ''
                    }
                } else {
                    llokasitujuan = `Lokasi Tujuan : ${onres.rows[0].no_lokasi}`
                    vlokasidibawah1kg = onres.rows[0].no_lokasi
                }
            })

            querystr = `select * from perincian_pengeluaranstok where no_roll='${no_roll}'`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                k = onres.rows.length
            })

            querystr = `select * from data_pecahroll where roll1='${no_roll}'`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                t = onres.rows.length
            })

            if (k == 0 && t == 0 && tes == 'R') {
                no = qdatanorincian.toString()

                nodetail = qdatanodetail.toString()
                border = qdataberatjual

                if (tipekain == 'BODY') {
                    tplastik = '0.15'
                } else {
                    tplastik = '0.10'
                }
            } else {
                querystr = `select * from v_stokglobal_transfer where no_roll='${no_roll}'`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    if (onres.rows.length == 0) {
                        response.ok({"message": "Stok habis!"}, 201, res)
                    }else {

                        querystr = `select no_order from a_orderdibawah1kg where no_order='${no_order}'`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then(async onres1 => {
                            if (onres1.rows.length == 0) {
                                querystr = `SELECT v.no_Roll, berat_asal FROM v_penimbangan2 v JOIN v_stokglobal_transfer USING(no_Roll)  WHERE LEFT(v.no_roll,1)='R' AND v.no_roll NOT IN 
                                (SELECT roll_induk FROM data_pecahroll JOIN kain_catatan ON no_roll=roll2 
                                WHERE status_kain='SEGEL') AND v.no_roll='${no_roll}';`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then(async onres2 =>{
                                    if (onres2.rows.length > 0) {
                                        label8 = 'Kain belum potong segel'
                                    } else {
                                        if (no_roll.substr(0, 1) == 'A') {
                                            label8 = ''
                                        } else {
                                            label8 = 'Kain sudah potong segel'
                                        }
                                    }
                                    border = parseFloat(edit2)
                            
                                    if (tipekain == 'BODY' && border >= 5) {
                                        tplastik = '0.15'
                                    } else if ((tipekain == 'RIB' || tipekain == 'RIBF' || tipekain == 'RIBS' ||tipekain == 'KRAH' || tipekain == 'MANSET') && border >=5 ) {
                                        tplastik = '0.10'
                                    } else {
                                        tplastik = '0'
                                    }
                                })
                            } else {
                                
                                querystr = `SELECT v.no_Roll, berat_asal FROM v_penimbangan2 v JOIN v_stokglobal_transfer USING(no_Roll)  WHERE LEFT(v.no_roll,1)='R' AND v.no_roll NOT IN (SELECT roll_induk FROM data_pecahroll JOIN kain_catatan ON no_roll=roll2
                                WHERE status_kain='SEGEL') AND v.no_roll='${no_roll}';`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                    if (onres.rows.length > 0) {
                                        label8 = 'Kain belum potong segel'
                                    } else {
                                        if (no_roll.substr(0, 1) == 'A') {
                                            label8 = ''
                                        } else {
                                            label8 = 'Kain sudah potong segel'
                                        }
                                    }
                                    border = parseFloat(tsistem)

                                    if (tipekain == 'BODY' && border >= 5) {
                                        tplastik = '0.15'
                                    } else if ((tipekain == 'RIB' || tipekain == 'RIBF' || tipekain == 'RIBS' ||tipekain == 'KRAH' || tipekain == 'MANSET') && border >=5 ) {
                                        tplastik = '0.10'
                                    } else {
                                        tplastik = '0'
                                    }
                                })
                            }
                        })
                    }
                })
            }
        }
        response.ok({'message': 'sukses'},200, res)
    } catch (error) {
        response.ok({ 'message': tabel.GetError(error) }, 300, res)
    }
}