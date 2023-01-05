'use strict';
const response = require('../res/res');
const tabel = require('../conn/tabel');

let querystr = '';
let queryvalue = '';

exports.timbang_ulang_kain = async (req, res) => {
    let { edit5, vnokarung, bakhir, lberat, idKaryawan, lnokarung, vlokasi } = req.body;
    let tanggal, selisih, bsisa, vtipe, teken, vt1no_roll, vt1berat, vt1beratfix, ambil, selisihroll;
    try {
        if (edit5 == '' || edit5 == undefined) {
            response.ok({ "message": "Berat fisik tidak boleh kosong!" }, 201, res)
        } else if (edit5 <= 0 || parseFloat(edit5) <= 0) {
            response.ok({ "message": "Berat fisik tidak boleh kurang dari sama dengan 0!" }, 201, res)
        } else {
            selisih = parseFloat(bakhir) - parseFloat(lberat)

            querystr = `SELECT DATE_FORMAT(CURDATE(),''%Y-%m-%d'') as tgl`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                tanggal = onres.rows[0].tgl
            })

            bsisa = Math.abs(parseFloat(lberat)*2)/100

            if (vtipe != 'BS SEGEL' && vtipe != 'KAIN BS & SEGEL') {
                if (parseFloat(edit5) >= parseFloat(lberat) - bsisa && parseFloat(edit5) <= parseFloat(lberat) + bsisa) {
                    teken = 'jangan'
                } else {
                    teken = 'boleh'

                    response.ok({ 'message': 'Gagal disimpan! Silahkan cek kembali isi karung, dan timbang ulang karung.'})
                }
            }

            querystr = `SELECT no_roll,nd.berat FROM data_ngebal_bssegel d JOIN detail_ngebal_bssegel dn USING(no_ngebal) 
            JOIN detail_packingkain_bssegel dp USING(no_packing) JOIN n_kainbssegel nk ON kode=id_bssegel JOIN n_detail_kainbssegel nd ON nk.no=nd.no_kain 
            WHERE d.no_ngebal='${vnokarung}';`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                vt1no_roll = onres.rows[0].no_roll
                vt1berat = onres.rows[0].berat
                vt1beratfix = onres.rows[0].berat

                ambil = 0.01
                if (Math.abs(selisih) > (no_roll * 0.01)) {
                    ambil = Math.trunc(Math.abs(selisih / no_roll) * 100) / 100
                }
            })

            querystr = `START TRANSACTION`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then()

            if (vtipe == 'BS SEGEL' || vtipe == 'KAIN BS & SEGEL') {
                querystr = `update n_kategori_karung set status=1 where no_karung='${lnokarung}';`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then()

                querystr = `INSERT INTO n_kategori_karung_detail (no_karung,no_roll,berat,id_user)
                VALUES('${lnokarung}','${vt1no_roll}','${vt1beratfix}','${idKaryawan}');`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then()

                querystr = `insert into n_kategori_karung_bssegel (no_karung,no_roll,berat,berat_fix,id_user)
                values('${lnokarung}','${vt1no_roll}','${vt1berat}','${vt1beratfix}','${idKaryawan}');`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then()

                if (selisihroll != 0) {
                    querystr = `update n_detail_kainbssegel set berat='${vt1beratfix}' where no_roll='${vt1no_roll}'`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then()

                    response.ok({ 'message': 'sukses' }, 200, res)
                }

                querystr = `SELECT kode,SUM(nd.berat) AS beratfix
                FROM detail_ngebal_bssegel JOIN detail_packingkain_bssegel dp USING(no_packing) JOIN n_kainbssegel nk ON kode=id_bssegel
                JOIN n_detail_kainbssegel nd ON nk.no=nd.no_kain
                WHERE no_ngebal='${lnokarung}' GROUP BY kode;`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    querystr = `UPDATE n_kainbssegel SET total='${onres.rows[0].beratfix}' WHERE kode='${onres.rows[0].kode}';`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then()

                    querystr = `UPDATE detail_packingkain_bssegel SET berat='${onres.rows[0].beratfix}' WHERE id_bssegel='${onres.rows[0].kode}';`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then()

                    response.ok({ 'message': 'sukses' }, 200, res)
                })


                querystr = `SELECT dp.no_packing,SUM(dp.berat) AS beratfix 
                FROM detail_ngebal_bssegel JOIN detail_packingkain_bssegel dp USING(no_packing) 
                WHERE no_ngebal='${lnokarung}' GROUP BY dp.no_packing;`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    querystr = `update detail_ngebal_bssegel set berat='${onres.rows[0].beratfix}' where no_packing='${onres.rows[0].no_packing}';`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then()

                    response.ok({ 'message': 'sukses' }, 200, res)
                })

                response.ok({ 'message': 'sukses' }, 200, res)
            } else {
                querystr = `UPDATE n_kategori_karung SET STATUS=1 WHERE no_karung='${lnokarung}';`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then()
                
                response.ok({ 'message': 'sukses' }, 200, res)
            }
            
            querystr = `INSERT INTO lokasi_selesai(no_transaksi,tanggal,jenis,no_lokasi,id_karyawan,STATUS) 
            VALUES('${lnokarung}',NOW(),'KATEGORI KARUNG','${vlokasi}','${idKaryawan}',0);`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then()

            querystr = `COMMIT`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then()

            response.ok({ 'message': 'sukses' }, 200, res)
        }
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.formclose_timbangulangkain = async (req, res) => {
    try {
         let {vtipe, lnokarung} = req.body
         
         if (vtipe == 'BS SEGEL' || vtipe == 'KAIN BS & SEGEL') {
            querystr = `select no_karung from n_kategori_karung where no_karung='${lnokarung}' and status=0`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows.length > 0) {
                    querystr = `select no_karung from n_kategori_karung_detail where no_karung='${lnokarung}'`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async onres=> {
                        if (onres.rows.length == 0) {
                            querystr = `delete from n_kategori_karung where no_karung='${lnokarung}'`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then()

                            response.ok({'message': 'sukses'}, 200, res)
                        }
                    })
                }
            })
         }

         querystr = `select no_karung from n_kategori_karung where no_karung='${lnokarung}' and status=0`
         queryvalue = []
         await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length > 0) {
                
            }
         })

    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.formshow_timbangulangkain = async (req, res) => {
    try {
        let { vtipe, lnokarung, vidkategori, vperiode, vharga, vlokasi, idKaryawan } = req.body
        
        if (vtipe == 'BS SEGEL' || vtipe == 'KAIN BS & SEGEL') {
            querystr = `INSERT INTO n_kategori_karung (no_karung,tipe,id_kategori,periode_lelang,harga_pembuka,no_lokasi,STATUS,id_user)
            VALUES('${lnokarung}','${vtipe}','${vidkategori}','${vperiode}','${vharga}','${vlokasi}',0,'${idKaryawan}');`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then()

            response.ok({'message': 'sukses'}, 200, res)
        }
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}