'use strict';
const response = require('../res/res');
const tabel = require('../conn/tabel');

let querystr = '';
let queryvalue = '';

exports.timbang_kain = async (req, res) => {
    let {edit5, nokarung, bakhir, lnoroll, idKaryawan, lokasi} = req.body;
    let tanggal, berat_dibawah, berat_diatas, idkategori
    try {
        if (edit5 == '' || edit5 == undefined) {
            response.ok({ "message": "Berat fisik tidak boleh kosong" }, 201, res)
        } else if (edit5 <= 0 || parseFloat(edit5) <= 0) {
            response.ok({ "message": "Berat fisik tidak boleh kurang dari sama dengan 0" }, 201, res)
        } else if (edit5 > 27 || parseFloat(edit5) > 27) {
            response.ok({ "message": "Berat fisik tidak boleh lebih dari 27 KG!" }, 201, res)
        } else {
            querystr = `SELECT DATE_FORMAT(CURDATE(),''%Y-%m-%d'') as tgl`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                tanggal = onres.rows[0].tgl
            })

            querystr = `START TRANSACTION`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then()

            querystr = `SELECT berat_dibawah,berat_diatas FROM n_kategori_karung 
            JOIN n_kategori_karung_detail USING(no_karung) WHERE no_karung='${nokarung}';`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows.length == 0) {
                    querystr = `SELECT id,berat_dibawah,berat_diatas FROM s_kategori_berat_lelang 
                    WHERE UPPER(sts_kategori)='AKTIF' AND tanggal_efektif<=NOW() AND ${bakhir} BETWEEN berat_dibawah AND berat_diatas;`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        if (onres.rows.length == 0) {
                            querystr = `ROLLBACK`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then()
                            response.ok({ "message": "Scan gagal, karena kain tidak masuk ke dalam kategori manapun" }, 201, res)
                        } else {
                            idkategori = onres.rows[0].id
                            berat_dibawah = onres.rows[0].berat_dibawah
                            berat_diatas = onres.rows[0].berat_diatas

                            querystr = `UPDATE n_kategori_karung SET id_kategori='${idkategori}',berat_dibawah='${parseFloat(berat_dibawah)}',berat_diatas='${parseFloat(berat_diatas)}' WHERE no_karung='${nokarung}'`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then()
                            
                            querystr = `INSERT INTO n_kategori_karung_detail(no_karung,no_roll,berat,id_user) VALUES('${nokarung}','${lnoroll}','${bakhir}','${idKaryawan}'`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then()

                            response.ok({ "message": "sukses"}, 200, res)
                        }
                    })
                } else {
                    berat_dibawah = onres.rows[0].berat_dibawah
                    berat_diatas = onres.rows[0].berat_diatas

                    querystr = `SELECT ${bakhir} BETWEEN ${parseFloat(berat_dibawah)} AND ${parseFloat(berat_diatas)} as beratt`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        if (onres.rows.length == 0 || onres.rows.length > 0 && onres.rows[0].beratt == 0) {
                            querystr = `ROLLBACK`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then()
                            response.ok({ "message": "Kategori berat tidak sesuai! Pastikan kain memiliki kategori yang sama dengan kain awal yang di scan!" }, 201, res)
                        } else {
                            querystr = `SELECT id FROM n_kategori_karung_detail WHERE no_karung='${nokarung}' AND no_roll='${lnoroll}'`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                if (onres.rows.length == 0) {
                                    querystr = `INSERT INTO n_kategori_karung_detail(no_karung,no_roll,berat,id_user) 
                                    VALUES('${nokarung}','${lnoroll}','${bakhir}','${idKaryawan}')`
                                    queryvalue = []
                                    await tabel.queryDB(querystr, queryvalue).then()
                                    response.ok({ "message": "sukses"}, 200, res)
                                } else {
                                    querystr = `update perincian_penerimaanstok set no_lokasi='${lokasi}' where no_roll='${lnoroll}'`
                                    queryvalue = []
                                    await tabel.queryDB(querystr, queryvalue).then()

                                    querystr = `INSERT INTO lama_dilokasi(no_roll,no_lokasi,tanggal_simpan,id_karyawan,berat) VALUES('${lnoroll}','${lokasi}',NOW(),'${idKaryawan}','${bakhir}')`
                                    queryvalue = []
                                    await tabel.queryDB(querystr, queryvalue).then()
                                    
                                    querystr = `COMMIT`
                                    queryvalue = []
                                    await tabel.queryDB(querystr, queryvalue).then()
                                    
                                    response.ok({ "message": "sukses"}, 200, res)
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

exports.timbang_kain2 = async (req, res) => {
    try {
        let { edit5, vnokarung, vidkain, vidwarna, bakhir, vtipe, noroll, idKaryawan, vidkategori, vkelompok, vkelompokwarna, vlokasi } = req.body;
        let idkategori, idberat, idkelompok, idkelompokwarna, kondisi, periode, harga, berat_dibawah, berat_diatas, kelompok, kelompok_warna, cekkelompok, cekberat, cekloop, cekkelompokwarna;
        let result1, result2;

        if (edit5 == '' || edit5 == undefined) {
            response.ok({ "message": "Berat fisik tidak boleh kosong" }, 201, res)
        } else if (edit5 <= 0 || parseFloat(edit5) <= 0) {
            response.ok({ "message": "Berat fisik tidak boleh kurang dari sama dengan 0" }, 201, res)
        } else if (edit5 > 27 || parseFloat(edit5) > 27) {
            response.ok({ "message": "Berat fisik tidak boleh lebih dari 27 KG!" }, 201, res)
        } else {
            querystr = `SELECT DATE_FORMAT(CURDATE(),''%Y-%m-%d'') as tgl`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                tanggal = onres.rows[0].tgl
            })

            querystr = `START TRANSACTION`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then()

            querystr = `SELECT berat_dibawah,berat_diatas,IFNULL(kelompok,'') AS kelompok FROM n_kategori_karung JOIN n_kategori_karung_detail USING(no_karung) WHERE no_karung='${vnokarung}';`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows.length == 0) {
                    querystr = `SELECT s.id,berat_dibawah,berat_diatas,kondisi_kain,kategori_kain,kategori_warna,periode_lelang,harga_pembuka 
                    FROM s_master_lelang s JOIN s_kondisi_kain_lelang sk USING(id_kondisi) 
                    JOIN s_kategori_kain_lelang_master skm USING(id_kategori) JOIN s_kategori_kain_lelang_detail skmd ON skm.id_kategori=skmd.id_kategori_master 
                    JOIN s_kategori_group_warna_lelang_master skw USING(id_group_warna) JOIN s_kategori_group_warna_lelang_detail skwd USING(id_group_warna)       
                    JOIN s_kategori_berat_lelang skb ON id_range=skb.id WHERE kondisi_kain='KAIN DI BAWAH 1 KG' AND s.sts='AKTIF' AND id_kain='${vidkain}' AND id_warna='${vidwarna}' AND '${bakhir}' BETWEEN berat_dibawah AND berat_diatas 
                    UNION ALL
                    SELECT s.id,NULL,NULL,kondisi_kain,NULL,NULL,periode_lelang,harga_pembuka 
                    FROM s_master_lelang s JOIN s_kondisi_kain_lelang sk USING(id_kondisi) JOIN master_stok_lot_kain msl 
                    WHERE kondisi_kain='KAIN STOCKLOT' AND s.sts='AKTIF' AND msl.status='AKTIF' AND id_kain='${vidkain}' AND id_warna='${vidwarna}'`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        if (onres.rows.length == 0) {
                            querystr = `SELECT s.id,id_kategori,id_range,id_group_warna,kondisi_kain,harga_pembuka,periode_lelang
                            FROM s_master_lelang s JOIN s_kondisi_kain_lelang sk USING(id_kondisi)
                            WHERE s.sts='AKTIF' AND kondisi_kain IN ('KAIN DI BAWAH 1 KG','KAIN STOCKLOT');`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then(async onres1 => {
                                if (onres1.rows.length == 0) {
                                    querystr = `ROLLBACK`
                                    queryvalue = []
                                    await tabel.queryDB(querystr, queryvalue).then()

                                    response.ok({ 'message': 'Scan gagal, karena kain tidak masuk ke dalam Master Lelang manapun' }, 201, res)
                                } else {
                                    cekloop = 0

                                    for (let i = 0; i < onres1.rows.length; i++) {
                                        idkategori = onres1.rows[i].id
                                        idberat = onres1.rows[i].id_range
                                        idkelompok = onres1.rows[i].id_kategori
                                        idkelompokwarna = onres1.rows[i].id_group_warna
                                        kondisi = onres1.rows[i].kondisi_kain
                                        periode = onres1.rows[i].periode_lelang
                                        harga = onres1.rows[i].harga_pembuka
    
                                        berat_dibawah = 0
                                        berat_diatas = 0
                                        kelompok = ''
                                        kelompok_warna = ''
    
                                        cekkelompok = 1
                                        cekkelompokwarna = 1
                                        cekberat = 1
    
                                        if (idkelompok != 0 || idkelompok != '0') {
                                            querystr = `SELECT kategori_kain FROM s_kategori_kain_lelang_master sm JOIN s_kategori_kain_lelang_detail ON sm.id=id_kategori_master 
                                            WHERE id_kategori_master='${idkelompok}' AND id_kain='${vidkain}';`
                                            queryvalue = []
                                            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                                if (onres.rows.length == 0) {
                                                    cekkelompok = 0
                                                } else {
                                                    kelompok = onres.rows[0].kategori_kain
                                                }
                                            })
                                        }
    
                                        if (idkelompokwarna != 0 || idkelompokwarna != '0') {
                                            querystr `SELECT kategori_warna FROM s_kategori_group_warna_lelang_master sm JOIN s_kategori_group_warna_lelang_detail smd USING(id_group_warna) 
                                            WHERE id_group_warna='${idkelompokwarna}' AND id_warna='${vidwarna}';`
                                            queryvalue = []
                                            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                                if (onres.rows.length == 0) {
                                                    cekkelompok = 0
                                                } else {
                                                    kelompok_warna = onres.rows[0].kategori_warna
                                                }
                                            })
                                        }
    
                                        if (idberat != 0) {
                                            querystr = `select id,berat_dibawah,berat_diatas from s_kategori_berat_lelang where id='${idberat}' and '${bakhir}' between berat_dibawah and berat_diatas`
                                            queryvalue = []
                                            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                                if (onres.rows.length == 0) {
                                                    cekberat = 0
                                                } else {
                                                    berat_dibawah = onres.rows[0].berat_dibawah
                                                    berat_diatas = onres.rows[0].berat_diatas
                                                }
                                            })
                                        }
    
                                        if (cekkelompok == 0 || cekkelompokwarna == 0 || cekberat == 0) {
                                            cekloop = 1
                                        } else {
                                            cekloop = 0
                                        }
                                        
                                    }

                                    if (cekloop == 1) {
                                        querystr = `ROLLBACK`
                                        queryvalue = []
                                        await tabel.queryDB(querystr, queryvalue).then()

                                        response.ok({ 'message': 'Scan gagal, karena kain tidak masuk ke dalam Master Lelang manapun' }, 201, res)
                                    }
                                }
                            })
                        } else {
                            idkategori = onres.rows[0].id
                            berat_dibawah = onres.rows[0].berat_dibawah
                            berat_diatas = onres.rows[0].berat_diatas
                            kelompok = onres.rows[0].kategori_kain
                            kelompok_warna = onres.rows[0].kategori_warna
                            periode = onres.rows[0].periode_lelang
                            harga = onres.rows[0].harga_pembuka
                        }
                        
                        querystr = `UPDATE n_kategori_karung SET kelompok=IF('${kelompok}' = '',NULL,'${kelompok}'),kelompok_warna=IF('${kelompok_warna}' = '',NULL,'${kelompok_warna}') 
                        ,tipe='${vtipe}',id_kategori='${idkategori}',berat_dibawah='${berat_dibawah}',berat_diatas='${berat_diatas}' 
                        ,periode_lelang='${periode}',harga_pembuka='${harga}' 
                        WHERE no_karung='${vnokarung}';`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then()

                        querystr = `insert into n_kategori_karung_detail(no_karung,no_roll,berat,id_user) 
                        values('${vnokarung}','${noroll}','${bakhir}','${idKaryawan}');`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then()
                    })
                } else {
                    berat_dibawah = onres.rows[0].berat_dibawah
                    berat_diatas = onres.rows[0].berat_diatas

                    if (vtipe == 'KAIN STOCKLOT' || vtipe == 'KAIN DIBAWAH 1 KG') {
                        querystr = `select '${bakhir}' between '${berat_dibawah}' and '${berat_diatas} as brtt`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then(async onres => {
                            result1 = onres
                        })

                        querystr = `SELECT kategori_kain,kategori_warna FROM s_master_lelang s JOIN s_kondisi_kain_lelang sk USING(id_kondisi) 
                        JOIN s_kategori_kain_lelang_master skm USING(id_kategori) JOIN s_kategori_kain_lelang_detail skmd ON skm.id_kategori=skmd.id_kategori_master
                        JOIN s_kategori_group_warna_lelang_master skw USING(id_group_warna) JOIN s_kategori_group_warna_lelang_detail skwd USING(id_group_warna)       
                        JOIN s_kategori_berat_lelang skb ON id_range=skb.id WHERE s.id='${vidkategori}' AND s.sts='AKTIF' AND id_kain='${vidkain}' AND id_warna='${vidwarna}';`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then(async onres => {
                            result2 = onres
                        })

                        if ((result1.rows.length == 0 || (result1.rows.length > 0 && result1.rows[0].brtt == 0)) || (result2.rows.length == 0 || result2.rows.length > 0 && result2.rows[0].kategori_kain != vkelompok && vkelompok != '' && result2.rows[0].kategori_warna != vkelompokwarna && vkelompokwarna != '')) {
                            querystr = `SELECT s.id,id_kategori,id_range,id_group_warna,kondisi_kain FROM s_master_lelang s JOIN s_kondisi_kain_lelang sk USING(id_kondisi) 
                            WHERE s.sts='AKTIF' AND s.id='${vidkategori}';`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                if (onres.rows.length == 0) {
                                    querystr = `ROLLBACK`
                                    queryvalue = []
                                    await tabel.queryDB(querystr, queryvalue).then()

                                    response.ok({'message': 'Kain tidak dapat di-scan! Patikan kain memiliki kondisi kain, kategori kain lelang, kategori warna, dan range berat netto sama dengan kain yang pertama di-scan' }, 201, res)
                                } else {
                                    idberat = onres.rows[0].id_range
                                    idkelompok = onres.rows[0].id_kategori
                                    idkelompokwarna = onres.rows[0].id_group_warna

                                    cekkelompok = 1
                                    cekkelompokwarna = 1
                                    cekberat = 1

                                    if (idkelompok != '0' && vkelompok != '') {
                                        querystr = `SELECT kategori_kain FROM s_kategori_kain_lelang_master sm JOIN s_kategori_kain_lelang_detail ON sm.id=id_kategori_master 
                                        WHERE id_kategori_master='${idkelompok}' AND id_kain='${vidkain}';`
                                        queryvalue = []
                                        await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                            if (onres.rows.length == 0 || onres.rows.length > 0 && onres.rows[0].kategori_kain != vkelompok) {
                                                cekkelompok = 0
                                            }
                                        })
                                    }

                                    if (idkelompokwarna != '0' && vkelompokwarna != '') {
                                        querystr = `SELECT kategori_warna FROM s_kategori_group_warna_lelang_master sm JOIN s_kategori_group_warna_lelang_detail smd USING(id_group_warna)
                                        WHERE id_group_warna='${idkelompokwarna}' AND id_warna='${vidwarna}';`
                                        queryvalue = []
                                        await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                            if (onres.rows.length == 0 || onres.rows.length > 0 && onres.rows[0].kategori_warna != vkelompokwarna) {
                                                cekkelompok = 0
                                            }
                                        })
                                    }

                                    if (idberat != '0' && berat_dibawah != 0) {
                                        querystr = `select '${bakhir}' between '${berat_dibawah}' and '${berat_diatas}' as brtt`
                                        queryvalue = []
                                        await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                            if (onres.rows.length == 0 || onres.rows.length > 0 && onres.rows[0].brtt == 0) {
                                                cekberat = 0
                                            }
                                        })
                                    }

                                    if (cekkelompok == 0 || cekkelompokwarna == 0 || cekberat == 0) {
                                        querystr = `ROLLBACK`
                                        queryvalue = []
                                        await tabel.queryDB(querystr, queryvalue).then()

                                        response.ok({ 'message': "Kain tidak dapat di-scan! Pastikan kain memiliki kondisi kain, kategori kain lelang, kategori warna, dan range berat netto sama dengan kain yang pertama di-scan" }, 201, res)
                                    }
                                }
                            })
                        }
                    } else {
                        querystr = `select '${bakhir}' between '${berat_dibawah}' and '${berat_diatas} as brtt`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then(async onres => {
                            result1 = onres
                        })

                        querystr = `select kelompok from n_kelompok_kategori_karung where id_kain='${vidkain}'`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then(async onres => {
                            result2 = onres
                        })

                        if ((result1.rows.length == 0 || (result1.rows.length > 0 && result1.rows[0].brtt == 0)) || (result2.rows.length == 0 || (result2.rows.length > 0 && result2.rows[0].kelompok != vkelompok && vkelompok != ''))) {
                            querystr = `ROLLBACK`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then()

                            response.ok({ 'message': 'Kain tidak dapat di-scan! Pastikan kain memiliki kondisi kain, kategori kain lelang, kategori warna, dan range berat netto sama dengan kain yang pertama di-scan!' }, 201, res)
                        }

                        querystr = `SELECT id FROM n_kategori_karung_detail WHERE no_karung='${vnokarung}' AND no_roll='${noroll}';`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then(async onres => {
                            if (onres.rows.length == 0) {
                                querystr = `INSERT INTO n_kategori_karung_detail(no_karung,no_roll,berat,id_user) 
                                VALUES('${vnokarung}','${noroll}','${bakhir}','${idKaryawan}');`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then()


                            }
                        })

                        querystr = `UPDATE perincian_penerimaanstok SET no_lokasi='${vlokasi}' WHERE no_roll='${noroll}';`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then()

                        querystr = `INSERT INTO lama_dilokasi(no_roll,no_lokasi,tanggal_simpan,id_karyawan,berat)
                        VALUES('${noroll}','${vlokasi}',NOW(),'${idKaryawan}','${bakhir}');`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then()

                        querystr = `COMMIT`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then()

                        response.ok({ 'message': 'sukses' }, 200, res)
                    }
                }
            })

        }
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.formclose_timbangkain = async (req, res) => {
    try {
        let { vnokarung } = req.body
        let lkategori, lkelompok, lkelompokwarna, lkondisi

        querystr = `select no_karung,no_lokasi,berat_dibawah,ifnull(berat_diatas,0) as berat_diatas,ifnull(kelompok,'-') as kelompok,ifnull(kelompok_warna,'-') as kelompok_warna,tipe
        FROM n_kategori_karung WHERE no_karung='${vnokarung}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length > 0) {
                if (onres.rows[0].berat_diatas != 0) {
                    lkategori = onres.rows[0].berat_dibawah + ' - ' + onres.rows[0].berat_diatas
                }

                lkelompok = onres.rows[0].berat_dibawah
                lkelompokwarna = onres.rows[0].kelompok_warna
                
                if (onres.rows[0].tipe == 'DIBAWAH 1KG') {
                    lkondisi = 'Kain di Bawah 1 Kg'
                } else if (onres.rows[0].tipe == 'BS SEGEL') {
                    lkondisi = 'Kain BS && SEGEL'
                } else {
                    lkondisi = onres.rows[0].tipe
                }
            }
            response.ok({'message': lkategori, lkelompok, lkelompokwarna, lkondisi}, 200, res)
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}