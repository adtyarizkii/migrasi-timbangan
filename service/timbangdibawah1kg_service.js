'use strict';
const response = require('../res/res');
const tabel = require('../conn/tabel');

let querystr = '';
let queryvalue = '';


exports.timbang_dibawah_1kg = async (req, res) => {
    let { edit5, noroll, tsistem, tplastik, idKaryawan, vnoorder, vlokasidibawah1kg } = req.body;
    let tanggal, vsverifikasi, bakhir, bplastik, selisih, norincian, sisaroll, plastikq,  vgroup
    try {

        if (tplastik == '') {
            bplastik = 0
        } else {
            bplastik = parseFloat(tplastik)
        }

        selisih = Math.abs(parseFloat(tsistem)) - bplastik

        if (edit5 == '' || edit5 == undefined) {
            response.ok({ 'message': 'Berat fisik tidak boleh kosong!'})
        } else if (parseFloat(edit5) <= 0 || edit5 <= 0) {
            response.ok({ 'message': 'Berat fisik tidak boleh kurang dari sama dengan 0!'})
        } else if (edit5 > 27 || parseFloat(edit5) > 27) {
            response.ok({ 'message': 'Berat fisik tidak boleh lebih dari 27 KG!'})
        } else {
            querystr = `SELECT DATE_FORMAT(CURDATE(),''%Y-%m-%d'') as tgl`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                tanggal = onres.rows[0].tgl
            })
            //here
            querystr = `SELECT data FROM konstanta WHERE jenis='VERIFIKASI SUPERVISOR'`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (Math.abs(selisih) >= parseFloat(onres.rows[0].data)) {
                    vsverifikasi = 'SELISIH NETTO TIMBANG ULANG DIBAWAH 1KG'
                    querystr = `SELECT STATUS,berat FROM n_verifikasi 
                    WHERE no_roll='${noroll}' AND keterangan='${vsverifikasi}'  ORDER BY NO DESC LIMIT 1;`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        bakhir = onres.rows[0].berat

                        if ((onres.rows.length == 0 || onres.rows[0].status == 2 || onres.rows[0].status == '2') && parseFloat(onres.rows[0].berat) != parseFloat(tsistem)) {
                            querystr = `INSERT INTO n_verifikasi VALUES(0,'${noroll}',NULL,'${tsistem}',
                            '${parseFloat(bakhir) - parseFloat(bplastik)}','${idKaryawan}',NULL,'${vsverifikasi}',NULL,NULL,0)`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then()

                            response.ok({ "message": "insert data sukses"}, 200, res)
                        } else if (onres.rows[0].status == 1 || onres.rows[0].status == '1') {
                            querystr = `UPDATE n_verifikasi SET STATUS=2 WHERE no_roll='${noroll}' AND keterangan='${vsverifikasi}'`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then()

                            response.ok({ "message": "update data status sukses"}, 200, res)
                        } else if (onres.rows[0].status == 1 || onres.rows[0].status == '1' || parseFloat(onres.rows[0].berat) != parseFloat(tsistem)) {
                            querystr = `UPDATE n_verifikasi SET berat='${tsistem}',berat2='${parseFloat(bakhir) - parseFloat(bplastik)}'  
                            WHERE no_roll='${noroll}' AND keterangan='${vsverifikasi}' AND STATUS=0`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then()
                            
                            response.ok({ "message": "update data berat sukses"}, 200, res)
                        } else {
                            querystr = `SELECT p.no FROM detail_order JOIN perincian_order p USING(no_detail) WHERE no_order='${vnoorder}' AND no_roll='${noroll}';`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                if (onres.rows.length > 0) {
                                    norincian = onres.rows[0].no
                                } else {
                                    norincian = 0
                                }

                                querystr = `START TRANSACTION`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then()

                                querystr = `insert into data_koreksikg values(0,now(),'${noroll}','${tsistem}','${bakhir}','${idKaryawan}',0)`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then()

                                querystr = `update detail_order set dikerjakan='SIAP KIRIM' where no_detail=(select no_detail from perincian_order where no='${norincian}')`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then()

                                querystr = `update perincian_order set berat_ditimbang='${bakhir}',berat_awal='${tsistem}',habis='ya',no_rolldisimpan='${noroll}',no_roll='${noroll}' where no='${norincian}'`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then()

                                querystr = `update perincian_penerimaanstok set no_lokasi='${vlokasidibawah1kg}' where no_roll='${noroll}'`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then()

                                querystr = `insert into lama_dilokasi (no_roll,no_lokasi,tanggal_simpan,id_karyawan,berat) values('${noroll}','${vlokasidibawah1kg}',now(),'${idKaryawan}','${bakhir}')`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then()

                                querystr = `select * from perincian_order join detail_order using(no_detail) where no_order='${vnoorder}' and berat_ditimbang=0`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                    sisaroll = onres.rows.length
                                    if (onres.rows.length == 0) {
                                        querystr = `update order_pembelian set status_order='SIAP KIRIM' where no_order='${vnoorder}'`
                                        queryvalue = []
                                        await tabel.queryDB(querystr, queryvalue).then()

                                        querystr = `update a_orderdibawah1kg set sts_timbang='SELESAI TIMBANG' where no_order='${vnoorder}'`
                                        queryvalue = []
                                        await tabel.queryDB(querystr, queryvalue).then()

                                        querystr = `call sp_selesai_timbang_dibawah1kg('${vnoorder}','${vlokasidibawah1kg}','${idKaryawan}')`
                                        queryvalue = []
                                        await tabel.queryDB(querystr, queryvalue).then(async onres =>{
                                            if (onres.rows.length > 0) {
                                                if (parseInt(onres.rows[0].status) == 301) {
                                                    querystr = `ROLLBACK`
                                                    queryvalue = []
                                                    await tabel.queryDB(querystr, queryvalue).then()

                                                    response.ok({'Error sp ': onres.rows[0].message}, 301, res)
                                                }
                                            }
                                        })
                                    }
                                })

                                querystr = `select no_order from n_lokasiorder_dibawah1kg where no_order='${vnoorder}'`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                    if (onres.rows.length == 0) {
                                        querystr = `insert into n_lokasiorder_dibawah1kg (no_order,no_lokasi,create_at,create_user) values('${vnoorder}','${vlokasidibawah1kg}',now(),'${idKaryawan}')`
                                        queryvalue = []
                                        await tabel.queryDB(querystr, queryvalue).then()
                                    }
                                })

                                querystr = `COMMIT`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then()

                                if (sisaroll == 0) {
                                    querystr = `select *,concat(berat_asal,' Kg') as brt from v_stokglobal_transfer where no_roll='${noroll}'`
                                    queryvalue = []
                                    await tabel.queryDB(querystr, queryvalue).then(async x => {
                                        plastikq = x.rows
                                    })

                                    querystr = `SELECT * FROM kategori_sisakain WHERE '${bakhir}' >=b_bawah and '${bakhir}' < b_atas and jenis_kain='all'`
                                    queryvalue = []
                                    await tabel.queryDB(querystr, queryvalue).then(async onres =>{
                                        if (onres.rows.length != 0 && plastikq.length != 0) {
                                            if (parseFloat(bakhir) < 0.05) {
                                                vgroup = `- ${bakhir}`
                                            } else {
                                                vgroup = onres.rows[0].group
                                            }
                                        }
                                    })

                                    response.ok({'message': tanggal, vsverifikasi, bakhir, bplastik, selisih, norincian, sisaroll, plastikq,  vgroup}, 200, res)
                                }
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

exports.formshow_timbangdibawah1kg = async (req, res) =>{
    try {
        let {vnoorder} = req.body
        let llokasitujuan, lstep

        querystr = `select no_lokasi from n_lokasiorder_dibawah1kg where no_order='${vnoorder}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length == 0) {
                llokasitujuan = ''
            } else {
                llokasitujuan = `Lokasi Tujuan : ${onres.rows[0].no_lokasi}`
            }
        })

        querystr = `SELECT CONCAT('PROSES POTONG ',(total - jmlroll) + 1,' / ',total) AS dari FROM v_antrianpenimbanganfix WHERE no_order='${vnoorder}';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length == 0) {
                lstep = ''
            } else {
                lstep = onres.rows[0].dari
            }
        })
        response.ok({llokasitujuan, lstep}, 200, res)
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.formclose_timbangdibawah1kg = async (req, res) => {
    try {
        let { idKaryawan } = req.body

        querystr = `select * from status_pekerjaan where status=0 and jenis_pekerjaan='PENIMBANGAN' and id_karyawan='${idKaryawan}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length > 0) {
                querystr = `START TRANSACTION`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then()

                querystr = `delete from status_pekerjaan where status=0 and jenis_pekerjaan='PENIMBANGAN' and id_karyawan='${idKaryawan}'`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then()

                querystr = `COMMIT`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then()
            }

            response.ok({'message':'sukses'}, 200, res)
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.frxReport2GetValue_timbangdibawah1kg = async (req, res) => {
    try {
        let { plastiknorollq } = req.body
        let varname, value
        
        if (varname == 'gplastik') {
            value = vgroup
        }

        querystr = `SELECT * FROM data_pecahroll WHERE roll2='${plastiknorollq}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (varname == 'rollinduk') {
                value = onres.rows[0].roll_induk
            }
        })

        querystr = `SELECT * FROM v_stokglobal_transfer WHERE no_roll='${plastiknorollq}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (varname == 'nodata') {
                value = onres.rows[0].kode_spk
            }

            if (varname == 'ket') {
                value = 'ORDER KAIN < 1 KG'
            }
        })
        response.ok({'message': varname, value}, 200, res)
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}