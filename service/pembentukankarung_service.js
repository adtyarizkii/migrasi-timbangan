'use strict';
const response = require('../res/res');
const tabel = require('../conn/tabel');

let querystr = '';
let queryvalue = '';

exports.pembentukan_karung = async (req, res) => {
    try {
        let { nokarung } = req.body;
        querystr = `SELECT no_roll,nama_kain,jenis_warna,no_lokasi,n.berat AS berat_asal 
        FROM n_kategori_karung_detail JOIN n_stok n USING(no_roll) JOIN kain k USING(id_kain) JOIN warna w USING(id_warna) where no_karung='${nokarung}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            response.ok(onres.rows, 200, res)
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}
exports.pembentukan_karung = async (req, res) => {
    try {
        let { nokarung } = req.body;
        querystr = `SELECT no_roll,nama_kain,jenis_warna,no_lokasi,n.berat AS berat_asal 
        FROM n_kategori_karung_detail JOIN n_stok n USING(no_roll) JOIN kain k USING(id_kain) JOIN warna w USING(id_warna) where no_karung='${nokarung}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            response.ok(onres.rows, 200, res)
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}
exports.pembentukan_karung = async (req, res) => {
    try {
        let { nokarung } = req.body;
        querystr = `SELECT no_roll,nama_kain,jenis_warna,no_lokasi,n.berat AS berat_asal 
        FROM n_kategori_karung_detail JOIN n_stok n USING(no_roll) JOIN kain k USING(id_kain) JOIN warna w USING(id_warna) where no_karung='${nokarung}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            response.ok(onres.rows, 200, res)
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}
exports.pembentukan_karung = async (req, res) => {
    try {
        let { nokarung } = req.body;
        querystr = `SELECT no_roll,nama_kain,jenis_warna,no_lokasi,n.berat AS berat_asal 
        FROM n_kategori_karung_detail JOIN n_stok n USING(no_roll) JOIN kain k USING(id_kain) JOIN warna w USING(id_warna) where no_karung='${nokarung}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            response.ok(onres.rows, 200, res)
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}
exports.pembentukan_karung = async (req, res) => {
    try {
        let { nokarung } = req.body;
        querystr = `SELECT no_roll,nama_kain,jenis_warna,no_lokasi,n.berat AS berat_asal 
        FROM n_kategori_karung_detail JOIN n_stok n USING(no_roll) JOIN kain k USING(id_kain) JOIN warna w USING(id_warna) where no_karung='${nokarung}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            response.ok(onres.rows, 200, res)
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}
exports.pembentukan_karung = async (req, res) => {
    try {
        let { nokarung } = req.body;
        querystr = `SELECT no_roll,nama_kain,jenis_warna,no_lokasi,n.berat AS berat_asal 
        FROM n_kategori_karung_detail JOIN n_stok n USING(no_roll) JOIN kain k USING(id_kain) JOIN warna w USING(id_warna) where no_karung='${nokarung}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            response.ok(onres.rows, 200, res)
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.scan_pembentukan_karung2 = async (req, res) => {
    try {
        let { noroll } = req.body;
        let vbalbssegel, vidkategori, vtipe, vperiode, vharga, no_order, id_kain, id_warna, jeniskain, berat, berat_order, kain, warna, cekloop, idkategori, idberat, idkelompok, idkelompokwarna, kondisi, cekkelompok, cekkelompokwarna, cekberat, kelompok, kelompok_warna, berat_dibawah, berat_diatas;
        let lnokarung = '-';
        let respon = ''
        let result1, result2

        querystr = `SELECT * FROM data_ngebal_bssegel d JOIN detail_ngebal_bssegel dn USING(no_ngebal) 
        JOIN detail_packingkain_bssegel dp USING(no_packing) JOIN n_kainbssegel nk ON kode=id_bssegel 
        WHERE d.status = 0 AND no_ngebal='${noroll}';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length > 0) {
                querystr = `SELECT s.id,kondisi_kain,periode_lelang,harga_pembuka FROM s_master_lelang s JOIN s_kondisi_kain_lelang USING(id_kondisi) 
                WHERE kondisi_kain='KAIN BS & SEGEL' AND s.sts='AKTIF';`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    if (onres.rows.length == 0) {
                        response.ok({'message': 'Scan gagal, karena kain tidak masuk ke dalam Master Lelang manapun'}, 201, res)
                    } else {
                        vbalbssegel = noroll
                        vidkategori = onres.rows[0].id
                        vtipe = onres.rows[0].kondisi_kain
                        vperiode = onres.rows[0].periode_lelang
                        vharga = onres.rows[0].harga_pembuka

                        response.ok(onres.rows, 200, res)
                    }
                })
            } else {
                if (lnokarung != '-') {
                    response.ok({ 'message': 'Silahkan buat karung terlebih dahulu!'}, 201, res)
                } else {
                    querystr = `SELECT TRIM(UPPER(jenis_kain)) AS jenis_kain,berat_asal,nama_kain,jenis_warna,id_kain,id_warna,b_order 
                    FROM v_stokglobal WHERE no_roll='${noroll}';`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        if (onres.rows.length == 0) {
                            response.ok({ 'message': 'Kain tidak terdaftar pada sistem'}, 201, res)
                        } else {
                            querystr = `SELECT no_roll FROM n_kategori_karung_detail WHERE no_roll='${noroll}';`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then(async onres1 => {
                                if (onres1.rows.length > 0) {
                                    response.ok({ 'Message': 'Kain sudah di scan' }, 201, res)
                                } else {
                                    // response.ok(onres.rows, 200, res)
                                    id_kain = onres.rows[0].id_kain
                                    id_warna = onres.rows[0].id_warna
                                    jeniskain = onres.rows[0].jenis_kain
                                    berat = onres.rows[0].berat_asal
                                    berat_order = onres.rows[0].b_order
                                    kain = onres.rows[0].nama_kain
                                    warna = onres.rows[0].jenis_warna

                                    if (onres.rows[0].b_order > 0) {
                                        querystr = `SELECT no_order FROM perincian_order JOIN detail_order USING(no_detail) WHERE no_roll='${noroll}';`
                                        queryvalue = []
                                        await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                            if (onres.rows.length > 0) {
                                                no_order = onres.rows[0].no_order

                                                respon = `Kain tidak dapat dimasukan ke dalam karung, karena sudah dibooking oleh ${no_order}`
                                            }
                                        })
                                        response.ok({ 'message': respon }, 201, res)
                                    } else {
                                        querystr = `SELECT id_kategori,IFNULL(berat_dibawah,0) AS berat_dibawah,IFNULL(berat_diatas,0) AS berat_diatas,IFNULL(kelompok,'') AS kelompok,IFNULL(kelompok_warna,'') AS kelompok_warna,IFNULL(tipe,'') AS tipe
                                        FROM n_kategori_karung JOIN n_kategori_karung_detail USING(no_karung) WHERE no_karung='${lnokarung}'`
                                        queryvalue = []
                                        await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                            if (onres.rows.length == 0) {
                                                querystr = `SELECT s.id,berat_dibawah,berat_diatas,kondisi_kain,kategori_kain,kategori_warna FROM s_master_lelang s JOIN s_kondisi_kain_lelang sk USING(id_kondisi) 
                                                JOIN s_kategori_kain_lelang_master skm USING(id_kategori) JOIN s_kategori_kain_lelang_detail skmd ON skm.id_kategori=skmd.id_kategori_master 
                                                JOIN s_kategori_group_warna_lelang_master skw USING(id_group_warna) JOIN s_kategori_group_warna_lelang_detail skwd USING(id_group_warna)       
                                                JOIN s_kategori_berat_lelang skb ON id_range=skb.id                                                                                            
                                                WHERE kondisi_kain IN ('KAIN DI BAWAH 1 KG','KAIN STOCKLOT') AND s.sts='AKTIF' and id_kain='${id_kain}' and id_warna='${id_warna}' and ${berat} between berat_dibawah and berat_diatas;`
                                                queryvalue = []
                                                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                                    if (onres.rows.length == 0) {
                                                        querystr = `SELECT s.id,id_kategori,id_range,id_group_warna,kondisi_kain FROM s_master_lelang s JOIN s_kondisi_kain_lelang sk USING(id_kondisi)
                                                        WHERE s.sts='AKTIF' AND kondisi_kain IN ('KAIN DI BAWAH 1 KG','KAIN STOCKLOT');`
                                                        queryvalue = []
                                                        await tabel.queryDB(querystr, queryvalue).then(async onres2 => {
                                                            if (onres2.rows.length == 0) {
                                                                response.ok({ 'message': 'Scan gagal, karena kain tidak masuk ke dalam Master Lelang manapun'}, 201, res)
                                                            } else {
                                                                cekloop = 0;
                                                                for (let i = 0; i < onres2.rows.length; i++) {

                                                                    idkategori = onres2.rows[i].id;
                                                                    idberat = onres2.rows[i].id_range;
                                                                    idkelompok = onres2.rows[i].id_kategori;
                                                                    idkelompokwarna = onres2.rows[i].id_group_warna;
                                                                    kondisi = onres2.rows[i].kondisi_kain;
    
                                                                    cekkelompok = 1;
                                                                    cekkelompokwarna = 1;
                                                                    cekberat = 1;
                                                                    
                                                                    if (idkelompok != 0 || idkelompok != '0') {
                                                                        querystr = `SELECT kategori_kain FROM s_kategori_kain_lelang_master sm JOIN s_kategori_kain_lelang_detail ON sm.id=id_kategori_master 
                                                                        WHERE id_kategori_master='${idkelompok}' AND id_kain='${id_kain}';`
                                                                        queryvalue = []
                                                                        await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                                                            if (onres.rows.length == 0) {
                                                                                cekkelompok = 0
                                                                            } else {
                                                                                kelompok = onres.rows[0].kategori_kain
                                                                            }
                                                                        })
                                                                    } else if (idkelompokwarna != 0 || idkelompokwarna != '0') {
                                                                        querystr = `select kategori_warna from s_kategori_group_warna_lelang_master sm join s_kategori_group_warna_lelang_detail smd using(id_group_warna) where id_group_warna='${idkelompokwarna}' and id_warna='${id_warna}';`
                                                                        queryvalue = []
                                                                        await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                                                            if (onres.rows.length == 0) {
                                                                                cekkelompok = 0
                                                                            } else {
                                                                                kelompok_warna = onres.rows[0].kategori_warna
                                                                            }
                                                                        })
                                                                    } else if (idberat != 0 || idberat != '0') {
                                                                        querystr = `SELECT id FROM s_kategori_berat_lelang WHERE id='${idberat}' AND '${berat}' 
                                                                        BETWEEN berat_dibawah AND berat_diatas;`
                                                                        queryvalue = []
                                                                        await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                                                            if (onres.rows.length == 0) {
                                                                                cekberat = 0
                                                                            }
                                                                        })
                                                                    } 
                                                                    
                                                                    if (cekkelompok = 0 || cekkelompokwarna == 0 || cekberat == 0) {
                                                                        cekloop = 1
                                                                    } else {
                                                                        cekloop = 0
                                                                    }
                                                                }

                                                                if (cekloop = 1) {
                                                                    response.ok({ 'message': 'Scan gagal, karena kain tidak masuk ke dalam Master lelang manapun'})
                                                                }
                                                            }
                                                        })
                                                    } else {
                                                        idkategori = onres.rows[0].id
                                                        kelompok = onres.rows[0].kategori_kain
                                                        kelompok_warna = onres.rows[0].kategori_warna
                                                        kondisi = onres.rows[0].kondisi_kain

                                                        querystr = `update n_kategori_karung set id_kategori='${idkategori}' where no_karung='${lnokarung}'`
                                                        queryvalue = []
                                                        await tabel.queryDB(querystr, queryvalue).then()

                                                    }
                                                })
                                            } else {
                                                idkategori = onres.rows[0].id_kategori
                                                berat_dibawah = onres.rows[0].berat_dibawah
                                                berat_diatas = onres.rows[0].berat_diatas
                                                kelompok = onres.rows[0].kelompok
                                                kelompok_warna = onres.rows[0].kelompok_warna
                                                kondisi = onres.rows[0].tipe

                                                if (kondisi == 'KAIN STOCKLOT' || kondisi == 'KAIN DI BAWAH 1 KG') {
                                                    querystr = `select '${berat}' between '${berat_dibawah}' and '${berat_diatas}' as brtt`
                                                    queryvalue = []
                                                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                                        result1 = onres
                                                    })
                                                    
                                                    querystr = `SELECT kategori_kain,kategori_warna FROM s_master_lelang s JOIN s_kondisi_kain_lelang sk USING(id_kondisi) 
                                                    JOIN s_kategori_kain_lelang_master skm USING(id_kategori) JOIN s_kategori_kain_lelang_detail skmd ON skm.id_kategori=skmd.id_kategori_master 
                                                    JOIN s_kategori_group_warna_lelang_master skw USING(id_group_warna) JOIN s_kategori_group_warna_lelang_detail skwd USING(id_group_warna)       
                                                    JOIN s_kategori_berat_lelang skb ON id_range=skb.id
                                                    WHERE s.id='${idkategori}' AND s.sts='AKTIF' and id_kain='${id_kain}' AND id_warna='${id_warna}';`
                                                    queryvalue = []
                                                    await tabel.queryDB(querystr, queryvalue).then(async onres =>{
                                                        result2 = onres
                                                    })

                                                    if ((result1.rows.length == 0) || ((result1.rows.length > 0) && (result1.rows[0].brtt == 0 )) || (result2.rows.length == 0) || (result2.rows.length > 0) && (result2.rows[0].kategori_kain != kelompok) && (kelompok != '' ) && (result2.rows[0].kategori_warna != kelompok_warna) && (kelompok_warna != '')) {
                                                        querystr = `SELECT s.id,id_kategori,id_range,id_group_warna,kondisi_kain FROM s_master_lelang s JOIN s_kondisi_kain_lelang sk USING(id_kondisi) WHERE s.sts='AKTIF' and s.id='${idkategori}'`
                                                        queryvalue = []
                                                        await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                                            if (onres.rows.length == 0) {
                                                                response.ok({ 'message': 'Kain tidak dapat di=scan! Pastikan kain memiliki kondisi kain, kategori kain lelang, kategori warna, dan range berat netto yang sama dengan kain yang pertama di-scan '}, 201, res)
                                                            } else {
                                                                idkategori = onres.rows[0].id
                                                                idberat = onres.rows[0].id_range
                                                                idkelompok = onres.rows[0].id_kategori
                                                                idkelompokwarna = onres.rows[0].id_group_warna
                                                                kondisi = onres.rows[0].kondisi_kain

                                                                cekkelompok = 1
                                                                cekkelompokwarna = 1
                                                                cekberat = 1

                                                                if (idkelompok != '0' && kelompok != '') {
                                                                    querystr = `SELECT kategori_kain FROM s_kategori_kain_lelang_master sm JOIN s_kategori_kain_lelang_detail ON sm.id=id_kategori_master 
                                                                    WHERE id_kategori_master='${idkelompok}' AND id_kain='${id_kain}';`
                                                                    queryvalue = []
                                                                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                                                        if (onres.rows.length == 0 || onres.rows.length > 0 && onres.rows[0].kategori_kain != kelompok) {
                                                                            cekkelompok = 0
                                                                        }
                                                                    })
                                                                }

                                                                if (idkelompokwarna != '0' && kelompok_warna != '') {
                                                                    querystr = `SELECT kategori_warna FROM s_kategori_group_warna_lelang_master sm JOIN s_kategori_group_warna_lelang_detail smd USING(id_group_warna)
                                                                    WHERE id_group_warna='${idkelompokwarna}' AND id_warna='${id_warna}';`
                                                                    queryvalue = []
                                                                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                                                        if (onres.rows.length == 0 || onres.rows.length > 0 && onres.rows[0].kategori_warna != kelompok_warna) {
                                                                            cekkelompok = 0
                                                                        }
                                                                    })
                                                                }

                                                                if (idberat != '0' && berat_dibawah != 0) {
                                                                    querystr = `select '${berat}' between '${berat_dibawah}' and '${berat_diatas}' as brtt`
                                                                    queryvalue = []
                                                                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                                                        if (onres.rows.length == 0 || onres.rows.length > 0 && onres.rows[0].brtt == 0) {
                                                                            cekberat = 0
                                                                        }
                                                                    })
                                                                }

                                                                if (cekkelompok == 0 || cekkelompokwarna == 0 || cekberat == 0) {
                                                                    response.ok({ 'message': 'Kain tidak dapat di-scan! Pastikan kain memiliki kondisi kain, kategori kain lelang, kategori warna, dan range berat netto sama dengan kain yang pertama di-scan' }, 201, res)
                                                                }
                                                            }
                                                        })
                                                    }
                                                } else {
                                                    querystr = `select '${berat}' between '${berat_dibawah}' and '${berat_diatas}' as brtt`
                                                    queryvalue = []
                                                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                                        result1 = onres
                                                    })
                                                    
                                                    querystr = `select kelompok from n_kelompok_kategori_karung where id_kain='${id_kain}'`
                                                    queryvalue = []
                                                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                                        result2 = onres
                                                    })

                                                    if ((result1.rows.length == 0 || (result1.rows.length > 0 && result1.rows[0].brtt == 0)) || ((result2.rows.length == 0 || (result2.rows.length > 0 && result2.rows[0].kelompok != kelompok && kelompok != '')))) {
                                                        respon = 'Kain tidak dapat di-scan! Pastikan kain memiliki kondisi kain, kategori kain lelang, kategori warna, dan range berat netto sama dengan kain yang pertama di-scan'
                                                    }
                                                }
                                            response.ok({ 'message': respon }, 201, res)
                                            }
                                        })
                                    }
                                }
                            })
                        }
                    })
                }
            }
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.formshow_pembentukankarung = async (req, res) => {
    try {
        let intervalday, lnokarung, llokasi, lkategori, lkelompok, lkelompokwarna, lkondisi, button18

        querystr = `select data from konstanta where jenis='INTERVAL DAY KARUNG'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length > 0) {
                intervalday = onres.rows[0].data
            } else {
                intervalday = '1'
            }
        })

        querystr = `SELECT no_karung,no_lokasi,berat_dibawah,IFNULL(berat_diatas,0) AS berat_diatas,IFNULL(kelompok,'-') AS kelompok,IFNULL(kelompok_warna,'-') AS kelompok_warna,tipe
        FROM n_kategori_karung WHERE STR_TO_DATE(SUBSTR(no_karung,4,6),'%d%m%y') BETWEEN DATE_ADD(CURDATE(),INTERVAL -'intervalday' DAY) AND CURDATE() AND id_user='idkaryawan' AND STATUS=0 ORDER BY no_karung DESC LIMIT 1;`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length > 0) {
                for (let i = 0; i < onres.rows.length; i++) {
                    lnokarung = onres.rows[i].no_karung
                    llokasi = onres.rows[i].no_lokasi
                }
                
                if (onres.rows[0].berat_diatas != 0) {
                    lkategori = `${onres.rows[0].berat_dibawah} - ${onres.rows[0].berat_diatas}`
                }
                
                lkelompok = onres.rows[0].kelompok
                lkelompokwarna = onres.rows[0].kelompok_warna

                if (onres.rows[0].tipe == 'DIBAWAH 1 KG') {
                    lkondisi = 'Kain di Bawah 1 Kg'
                } else if (onres.rows[0].tipe == 'BS SEGEL') {
                    lkondisi = 'Kain BS && SEGEL'
                } else {
                    lkondisi = onres.rows[0].tipe
                }

                button18 = 'Selesai (Spasi)'
            } else {
                lnokarung = '-'
                llokasi = '-'
                lkategori = '-'
                lkelompok = '-'
                lkelompokwarna = '-'
                lkondisi = '-'

                button18 = 'Buat Karung (Spasi)'
            }
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.btnbuatkarung_pembentukankarung = async (req, res) => {
    try {
        let { lnokarung } = req.params
        let jml, berat, vtipe, lkelompokwarna

        querystr = `SELECT COUNT(no_roll) AS jml,IFNULL(SUM(berat),0) AS berat FROM n_kategori_karung_detail WHERE no_karung='${lnokarung}';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres =>{
            jml = onres.rows[0].jml
            berat = onres.rows[0].berat

            querystr = `SELECT tipe,IFNULL(kelompok_warna,'-') AS kelompok_warna FROM n_kategori_karung WHERE no_karung='${lnokarung}';`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                vtipe = onres.rows[0].tipe
                lkelompokwarna = onres.rows[0].kelompok_warna
            })
        })
        response.ok({'message': 'ok', jml, berat, vtipe, lkelompokwarna }, 200, res)

    } catch (error) {
        response.ok({'message': tabel.GetError(error)}, 300, res)
    }
}

exports.formclose_pembentukankarung = async (req, res) => {
    try {
        let { lnokarung } = req.params
        querystr = `SELECT no_karung FROM n_kategori_karung WHERE no_karung='${lnokarung}' AND STATUS=0;`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length > 0) {
                querystr = `SELECT no_karung FROM n_kategori_karung_detail WHERE no_karung='${lnokarung}';`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    if (onres.rows.length == 0) {
                        querystr = `delete from n_kategori_karung where no_karung='${lnokarung}'`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then()
                    }
                })
            }
        })
    } catch (error) {
        response.ok({'message': tabel.GetError(error)}, 300, res)
    }
}