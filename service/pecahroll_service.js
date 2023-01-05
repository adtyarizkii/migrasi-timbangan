'use strict';
const response = require('../res/res');
const tabel = require('../conn/tabel');
const HandleFunctionChangeNetto = require('../utils/funct_ubahnetto');

let querystr = '';
let queryvalue = '';

exports.pecah_roll = async (req, res) => {
    let { no_roll, verifikasi } = req.body;
    let tipekain, tstok;
    try {
        querystr = `SELECT * FROM perincian_penerimaanstok p JOIN detail_penerimaanstok d USING(no_detail) JOIN kain k USING(id_kain)
        WHERE no_roll='${no_roll}' AND kode='${verifikasi}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length == 0) {
                response.ok({ "message": "Kode Verifikasi Salah!" }, 201, res)
            } else {
                tipekain = onres.rows[0].tipe_kain
                querystr = `SELECT * FROM detail_order JOIN perincian_order po USING(no_detail) JOIN penjagaan_timbangan pt ON po.no=pt.no_perincian 
                WHERE dikerjakan='SIAP KIRIM' AND no_roll='${no_roll}';`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    if (onres.rows.length > 0) {
                        response.ok({ "message": "Kain tidak bisa di pecah karena kain sudah dipotong, silahkan hubungi bagian packing" }, 201, res)
                    } else {
                        querystr = `SELECT no_order,nama FROM v_stokglobal_transfer v JOIN perincian_order p USING(no_roll) JOIN detail_order d ON p.no_detail=d.no_detail 
                        JOIN order_pembelian USING(no_order) JOIN customer USING(id_customer)
                        WHERE sts='ROLLAN' AND jenis_quantity='ROLLAN' AND v.no_roll='${no_roll}'`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then(async onres => {
                            if (onres.rows.length > 0) {
                                response.ok({ "message": `Kain tersebut tidak boleh di pecah karena sedang di booking oleh ${onres.rows[0].no_order} - ${onres.rows[0].nama} ` }, 201, res)
                            } else {
                                querystr = `SELECT * FROM v_stokglobal_transfer WHERE no_roll='${no_roll}';`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                    if (onres.rows[0].sts == 'ROLLAN' && onres.rows[0].b_order == 0) {
                                        querystr = `SELECT nama_kain FROM v_stokrollansementara 
                                        WHERE nama_kain='${onres.rows[0].nama_kain}' 
                                        AND jenis_warna='${onres.rows[0].jenis_warna}' 
                                        AND kode_spk='${onres.rows[0].kode_spk}';`
                                        queryvalue = []
                                        await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                            if (onres.rows.length == 0) {
                                                response.ok({ "message": "Kain tersebut tidak boleh di pecah karena sedang di booking oleh order lain dan belum di scan!" }, 201, res)
                                            } else {
                                                response.ok(onres.rows, 200, res)
                                            }
                                        })
                                    } else {
                                        querystr = `SELECT IFNULL(berat_asal,'kosong') AS berat_asal,IFNULL(berat,'kosong') AS berat,IFNULL(b_order,'kosong') 
                                        asberat_order,IFNULL(sts,'kosong') AS sts,IFNULL(kode,'kosong') AS kode FROM v_stokglobal_transfer 
                                        WHERE no_roll='${no_roll}'`
                                        queryvalue = []
                                        await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                            tstok = onres.rows[0].berat_asal
                                            response.ok(onres.rows, 200, res)
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.btn_pecah_roll = async (req, res) => {
    try {
        let { cbpilihan, noroll, beratroll2, berat1, tplastik, memo1, tstok, vrollpecah, idkaryawan } = req.body;
        let sisapotong, sisa, body, tipekain, vsverifikasi, noroll2, idusersot, tglsot, beratasal, beratakhir, bstok, selisihbawal, lokasi, lokawal, lokasipiktet, k, kodeverifikasi, v_nodetail10, v_kain, v_warna, v_jkn2, v_wrn2, vnoorder, idc

        if (cbpilihan != 'BAGUS' && cbpilihan != 'BS' && cbpilihan != 'SEGEL' && cbpilihan != 'SAMPLE') {
            response.ok({ "message": 'Status kain salah input' }, 201, res)
        } else if (noroll == '' || noroll == undefined) {
            response.ok({ "message": 'Silahkan isi no roll yang akan di pecah' }, 201, res)
        } else if (parseFloat(beratroll2) > parseFloat(berat1)) {
            response.ok({ "message": 'Berat roll ke 2 tidak boleh lebih dengan berat roll pertama' }, 201, res)
        } else if (parseFloat(beratroll2) <= 0) {
            response.ok({ "message": 'Berat roll ke 2 tidak boleh kurang dari atau sama dengan 0' }, 201, res)
        } else if (beratroll2 == 0 || beratroll2 == '' || beratroll2 == undefined) {
            response.ok({ "message": 'Berat roll ke 2 harus diisi!' }, 201, res)
        } else if (cbpilihan == '' || cbpilihan == undefined) {
            response.ok({ "message": 'Status kain harus diisi!' }, 201, res)
        } else if (tplastik == '' || tplastik == undefined) {
            response.ok({ "message": 'Berat plastik harus diisi!' }, 201, res)
        } else {

            lokasipiktet = 'PKT '

            sisapotong = Math.abs((parseFloat(berat1) - parseFloat(tplastik)) - parseFloat(beratroll2))
            sisa = (parseFloat(berat1) - parseFloat(tplastik)) - parseFloat(beratroll2)

            if (cbpilihan == 'BS') {
                querystr = `SELECT * FROM n_fhotobs WHERE no_roll='${noroll}' AND STATUS=0;`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    if (onres.rows.length == 0) {
                        response.ok({ 'message': 'Silahkan foto kain terlebih dahulu' }, 201, res)
                    } else {
                        querystr = `SELECT * FROM v_stokglobal_transfer WHERE no_roll='${noroll}';`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then(async onres => {

                            body = onres.rows[0].body

                            if (onres.rows[0].sts == 'ROLLAN' && onres.rows[0].b_order == 0) {
                                querystr = `SELECT nama_kain FROM v_stokrollansementara WHERE nama_kain='${onres.rows[0].nama_kain}' 
                            AND jenis_warna='${onres.rows[0].jenis_warna}' 
                            AND kode_spk='${onres.rows[0].kode_spk}';`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                    if (onres.rows.length == 0) {
                                        response.ok({ 'Message': 'Kain tersebut tidak boleh di pecah karena sedang di booking oleh order lain dan belum di scan!' }, 201, res)
                                    }
                                })
                            }

                            querystr = `SELECT * FROM v_stokglobal_transfer WHERE no_roll='${noroll}' AND sts='ROLLAN';`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                if (onres.rows.length != 0) {
                                    tipekain = onres.rows[0].jenis_kain

                                    querystr = `SELECT * FROM perincian_pengeluaranstok WHERE no_roll='${noroll}';`
                                    queryvalue = []
                                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                        if (onres.rows.length == 0) {
                                            response.ok({ 'Message': 'Kain tersebut tidak boleh di pecah karena belum ada penettoan!' }, 201, res)
                                        } else {
                                            response.ok({ "message": "sukses" }, 200, res)
                                        }
                                    })
                                }
                            })
                        })
                    }
                })
            } else if (cbpilihan == 'SEGEL') {
                querystr = `SELECT roll1 FROM data_pecahroll JOIN kain_catatan ON roll2=no_roll 
            WHERE roll1='${noroll}' AND status_kain='SEGEL'`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    let respon = ''
                    if (onres.rows.length > 0) {
                        respon = 'Kain tersebut sudah di potong segel sebanyak 1 kali !'
                    }
                    response.ok({ 'message': respon }, 201, res)
                })
            } else if (cbpilihan == 'BAGUS' && (body.toUpperCase() == 'KRAH' || body.toUpperCase == 'MANSET')) {
                querystr = `SELECT LOWER(DATA) as data FROM konstanta WHERE jenis='PENJAGAAN PECAH BAGUS AKSESORIS';`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    if (onres.rows.length == 0 || onres.rows[0].data == 'ya') {
                        response.ok({ 'Message': 'Kain Krah atau Manset tidak bisa dipecah bagus !' })
                    } else {
                        querystr = `SELECT data FROM konstanta WHERE jenis='BERAT SEGEL';`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then(async onres => {
                            if (cbpilihan.toLowerCase() == 'segel' && parseFloat(beratroll2) > onres.rows[0].data) {
                                vsverifikasi = 'SELISIH BERAT SEGEL'

                                querystr = `SELECT status,berat FROM n_verifikasi WHERE no_roll='${noroll}' AND keterangan='${vsverifikasi}'  ORDER BY NO DESC LIMIT 1;`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                    if ((onres.rows.length == 0 || onres.rows[0].status == '2') && parseFloat(onres.rows[0].berat != parseFloat(beratroll2))) {
                                        querystr = `INSERT INTO n_verifikasi 
                                    VALUES(0,'${noroll}',NULL,'${berat1}','${parseFloat(beratroll2)}','${idkaryawan}',NULL,'${vsverifikasi}',NULL,NULL,0);`
                                        await tabel.queryDB(querystr, queryvalue).then()
                                    } else if (onres.rows[0].status == '1') {
                                        querystr = `update n_verifikasi set status=2 where no_roll='${noroll}' and keterangan='${vsverifikasi}'`
                                        await tabel.queryDB(querystr, queryvalue).then()
                                    } else if (onres.rows[0].status == '0' || parseFloat(onres.rows[0].berat != parseFloat(beratroll2))) {
                                        querystr = `UPDATE n_verifikasi SET berat='${berat1}',berat2='${parseFloat(beratroll2)}'
                                    WHERE no_roll='${noroll}' AND keterangan='${vsverifikasi}' AND STATUS=0;`
                                        await tabel.queryDB(querystr, queryvalue).then()
                                    }
                                })
                            }
                        })
                    }
                })
            }

            if (memo1 == '' || memo1 == 'Memo1') {
                memo1 = ''
            }

            noroll2 = noroll

            querystr = `SELECT nama_kain, jenis_warna FROM v_stokglobal_transfer WHERE no_roll='${noroll2}';`
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                v_kain = onres.rows[0].nama_kain
                v_warna = onres.rows[0].jenis_warna
            })

            querystr = `SELECT tanggal_pecah,id_user FROM data_pecahroll WHERE roll1='${noroll}';`
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows.length > 0) {
                    idusersot = onres.rows[0].id_user
                    tglsot = onres.rows[0].tanggal_pecah
                } else {
                    querystr = `select tanggal_terima,id_user FROM pembelian_kainstok JOIN detail_penerimaanstok USING(no_terima) JOIN perincian_penerimaanstok USING(no_detail) WHERE no_roll='${noroll}'`
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        idusersot = onres.rows[0].id_user
                        tglsot = onres.rows[0].tanggal_pecah
                    })
                }
            })

            querystr = `SELECT IFNULL(berat_asal,'kosong') AS berat_asal,IFNULL(berat,'kosong') AS berat,IFNULL(b_order,'kosong') asberat_order,IFNULL(sts,'kosong') AS sts,IFNULL(kode,'kosong') AS kode FROM v_stokglobal_transfer WHERE no_roll='${noroll}';`
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                beratasal = parseFloat(berat1) - parseFloat(tplastik)

                if (beratasal == 'kosong') {
                    response.ok({ 'message': 'No roll tidak terdaftar didatabase!' }, 201, res)
                }
                if (parseFloat(beratroll2) > parseFloat(beratasal)) {
                    response.ok({ 'message': `Berat roll kedua tidak boleh lebih besar dari ${beratasal} Kg` }, 201, res)
                }
                if (parseFloat(beratroll2) < 0) {
                    response.ok({ 'message': 'Berat roll kedua tidak boleh negatif' }, 201, res)
                }
                if (cbpilihan == 'SEGEL' && parseFloat(beratroll2) > 1.01) {
                    response.ok({ 'message': 'Berat segel tidak boleh lebih dari 1 Kg !' }, 201, res)
                }
                if (parseFloat(tstok) <= 0.01) {
                    response.ok({ 'message': 'Berat stok tidak boleh kurang dari sama dengan 0, silahkan ulangi!' }, 201, res)
                }
            })

            beratakhir = parseFloat(beratroll2)

            querystr = `START TRANSACTION`
            await tabel.queryDB(querystr, queryvalue).then()

            querystr = `SELECT * FROM detail_penerimaanstok JOIN kain k USING(id_kain) JOIN warna USING(id_warna) JOIN perincian_penerimaanstok pps 
        USING(no_Detail) WHERE no_roll='${noroll}';`
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows.length > 0) {
                    v_jkn2 = onres.rows[0].nama_kain
                    v_wrn2 = onres.rows[0].jenis_warna
                } else {
                    response.ok({ 'message': 'Kain tidak terdaftar di stok!' }, 201, res)
                }
            })

            bstok = parseFloat(tstok)

            if (parseFloat(berat1) - parseFloat(tplastik) != bstok) {
                selisihbawal = bstok - parseFloat(berat1) - parseFloat(tplastik)

                if (selisihbawal <= -5.01) {
                    response.ok({ 'message': 'Ada kesalahan di koreksi, silahkan ulangi !' }, 201, res)

                    querystr = `ROLLBACK`
                    await tabel.queryDB(querystr, queryvalue).then()
                }

                querystr = `select berat_asal from v_stokglobal_transfer where no_roll='${noroll}'`
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    if (Math.round(bstok * 100) / 100 != Math.round(onres.rows[0].berat_asal * 100) / 100) {
                        response.ok({ 'message': 'Stok di interface dengan sistem tidak sama, silahkan ulangi !' }, 201, res)

                        querystr = `ROLLBACK`
                        await tabel.queryDB(querystr, queryvalue).then()
                    }
                })

                // koreksi selisih
            }

            querystr = `select no_lokasi from perincian_penerimaanstok  where no_roll='${noroll2}'`
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                lokasi = onres.rows[0].no_lokasi
                lokawal = lokasi

                if (cbpilihan == 'BAGUS') {
                    lokasi = lokasipiktet
                }

                k = 0
            })

            querystr = `ROLLBACK`
            await tabel.queryDB(querystr, queryvalue).then()

            querystr = `START TRANSACTION`
            await tabel.queryDB(querystr, queryvalue).then()

            querystr = `insert into gagal_pecah values (0,'${vrollpecah}1',now(),'${idkaryawan}'`
            await tabel.queryDB(querystr, queryvalue).then()

            querystr = `COMMIT`
            await tabel.queryDB(querystr, queryvalue).then()

            if (vrollpecah = '') {
                response.ok({ 'message': 'Pecah roll gagal silahkan coba lagi 2!' }, 201, res)
            }

            querystr = `START TRANSACTION`
            await tabel.queryDB(querystr, queryvalue).then()

            querystr = `INSERT INTO gagal_pecah VALUES (0,'${vrollpecah}2',NOW(),'${idkaryawan}')`
            await tabel.queryDB(querystr, queryvalue).then()

            querystr = `COMMIT`
            await tabel.queryDB(querystr, queryvalue).then()

            try {
                k = 0
                while (k < 4) {
                    querystr = `select * from perincian_penerimaanstok where no_roll='${noroll2}'`
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        v_nodetail10 = onres.rows[0].no_detail
                    })

                    querystr = `select * from perincian_penerimaanstok where no_roll='${vrollpecah}'`
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        if (onres.rows.length > 0) {
                            let respon = ''
                            //buatnoroll
                            if (vrollpecah == '') {
                                respon = 'Pecah roll gagal silahkan coba lagi 3!'

                                querystr = `START TRANSACTION`
                                await tabel.queryDB(querystr, queryvalue).then()

                                querystr = `insert into gagal_pecah values (0,'${vrollpecah}3',now(),'${idkaryawan}'`
                                await tabel.queryDB(querystr, queryvalue).then()

                                querystr = `COMMIT`
                                await tabel.queryDB(querystr, queryvalue).then()
                            }
                            k += 1
                            response.ok({ 'message': respon }, 201, res)
                        } else {
                            kodeverifikasi = Math.floor(Math.random() * (+9 - +1)) + +1 + Math.floor(Math.random() * (+9 - +1)) + +1 + Math.floor(Math.random() * (+9 - +1)) + +1;

                            querystr = `INSERT INTO perincian_penerimaanstok 
                        VALUES('${vrollpecah}','${v_nodetail10}','${beratroll2}',0,'${lokasi}','${kodeverifikasi}','${beratroll2}','PECAHAN');`
                            await tabel.queryDB(querystr, queryvalue).then()

                            querystr = `select max(no) as no from data_pecahroll`
                            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                nopecah = onres.rows[0].no
                                k = 5
                            })
                        }
                    })
                }

                querystr = `insert into lama_dilokasi values(0,'${vrollpecah}','${lokasipiktet}',now(),'${idkaryawan}','${beratroll2}')`
                await tabel.queryDB(querystr, queryvalue).then()

                selisihbawal = parseFloat(tstok) - (parseFloat(berat1) - parseFloat(tplastik))

                querystr = `INSERT INTO n_stokopnametimbang VALUES(0,'${noroll}', 'PECAH ROLL', '${tglsot}', '${v_kain}', '${v_warna}', '${tstok}', '${idusersot}',
            '${vrollpecah}', NOW(), '${beratroll2}','${cbpilihan}', '${idkaryawan}', '${parseFloat(selisihbawal)}','${tplastik}' );`
                await tabel.queryDB(querystr, queryvalue).then()
            } catch (error) {
                response.ok({ "message": "Pecah roll gagal silahkan coba lagi 4!" }, 200, res)
                querystr = `ROLLBACK`
                await tabel.queryDB(querystr, queryvalue).then()

                querystr = `START TRANSACTION`
                await tabel.queryDB(querystr, queryvalue).then()

                querystr = `insert into gagal_pecah values (0,'${noroll2}',now(),'${idkaryawan}')`
                await tabel.queryDB(querystr, queryvalue).then()

                querystr = `COMMIT`
                await tabel.queryDB(querystr, queryvalue).then()
            }

            querystr = `update perincian_penerimaanstok set berat=berat-'${beratroll2}',no_lokasi='${lokasipiktet}' where no_roll='${noroll2}'`
            await tabel.queryDB(querystr, queryvalue).then()

            if (cbpilihan == 'BS' || cbpilihan == 'SEGEL' || cbpilihan == 'SAMPLE') {
                querystr = `select * from  kain_catatan where no_roll='${vrollpecah}'`
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    if (onres.rows.length > 0) {
                        querystr = `update  kain_catatan set tgl_terima=now(),catatan='${cbpilihan}',status_kain='${cbpilihan}' where no_roll='${vrollpecah}'`
                        await tabel.queryDB(querystr, queryvalue).then()
                    } else {
                        querystr = `insert into kain_catatan values('${vrollpecah}',now(),'${cbpilihan}','${cbpilihan}')`
                        await tabel.queryDB(querystr, queryvalue).then()
                    }
                })

                lokasi = cbpilihan
                if (cbpilihan == 'BS' && parseFloat(beratroll2) >= 1) {
                    lokasi = 'BS-RETUR'
                }

                querystr = `UPDATE perincian_penerimaanstok SET no_lokasi='${lokasi}' WHERE no_roll= '${vrollpecah}';`
                await tabel.queryDB(querystr, queryvalue).then()

                querystr = `select max(no_detail) from lama_dilokasi where no_roll='${vrollpecah}' and no_lokasi='${lokasipiktet}'`
                await tabel.queryDB(querystr, queryvalue).then(async onres1 => {
                    if (onres1.rows.length > 0) {
                        querystr = `update lama_dilokasi set no_lokasi='${lokasi}'  where no_roll='${vrollpecah}' and no_lokasi='${lokasipiktet}'`
                        await tabel.queryDB(querystr, queryvalue).then()
                    }
                })

                if (cbpilihan == 'SEGEL' || (cbpilihan == 'BS' && parseFloat(beratroll2) < 1)) {
                    querystr = `select id_kain from n_stok where no_roll='${vrollpecah}'`
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        if (onres.rows.length > 0) {
                            querystr = `select berat_1m from n_masterkain_meter where id_kain='${onres.rows[0].id_kain}'`
                            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                if (onres.rows.length > 0) {
                                    querystr = `insert into n_kainbssegel_meter value(null,now(),'${vrollpecah}','${beratroll2}','${onres.rows[0].berat_1m}',null,'${idkaryawan}')`
                                    await tabel.queryDB(querystr, queryvalue).then()
                                }
                            })
                        }
                    })
                }
            }

            querystr = `select vs.no_roll from v_penimbangan2 join v_stokglobal_transfer vs using(no_roll) where vs.no_roll='${noroll}'`
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows.length > 0) {
                    querystr = `update perincian_penerimaanstok set no_lokasi='${lokawal}' where no_roll= '${noroll}'`
                    await tabel.queryDB(querystr, queryvalue).then()
                }
            })

            if (memo1 == '') {
                querystr = `insert into cetak_barcodetimbangan values(0,'${vrollpecah}','${beratroll2}',0,'${idkaryawan}','${v_jkn2}','${v_wrn2}','${cbpilihan}','${kodeverifikasi}')`
                await tabel.queryDB(querystr, queryvalue).then()
            } else {
                querystr = `insert into cetak_barcodetimbangan values(0,'${vrollpecah}','${beratroll2}',0,'${idkaryawan}','${v_jkn2}','${v_wrn2}','${memo1}','${kodeverifikasi}')`
                await tabel.queryDB(querystr, queryvalue).then()
            }

            if (cbpilihan == 'BS') {
                querystr = `select no from n_fhotobs  where no_roll = '${noroll}' and status=0`
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    if (onres.rows.length != 0) {
                        querystr = `update n_fhotobs set status=1 where no='${onres.rows[0].no}'`
                        await tabel.queryDB(querystr, queryvalue).then()

                        querystr = `insert into n_detailfhotobs values(0,'${onres.rows[0].no}','${noroll}','${vrollpecah}')`
                        await tabel.queryDB(querystr, queryvalue).then()
                    }
                })
            }

            if (cbpilihan.toLowerCase() == 'segel') {
                if (statusproses == 'antrian') {
                    querystr = `select no_order from v_penimbangan2 where no_roll='${noroll}'`
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        if (onres.rows.length == 0) {
                            vnoorder = ''
                        } else {
                            vnoorder = onres.rows[0].no_order
                        }
                    })
                }

                querystr = `select id from n_cycle_potong where no_order='${vnoorder}' and no_roll='${noroll}'`
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    if (onres.rows.length > 0) {
                        idc = onres.rows[0].id

                        querystr = `update n_cycle_potong set tanggal_segel=now(),berat_segel='${beratroll2}',no_roll_segel='${vrollpecah}',id_user_segel='${idkaryawan}' where id='${idc}'`
                        await tabel.queryDB(querystr, queryvalue).then()
                    }
                })
            }

            let selisihhabis = false
            if (sisapotong < 0.05) {
                selisihhabis = false
            }
            //1280


        }
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.btnkembali_pecahroll = async (req, res) => {
    try {
        let statusproses = ''
        let vkeluar = ''
        let { edit1, idkaryawan } = req.body
        let vcariperincian, vcaridetail, brtjual, vnoorder, id_k, id_w, lot, lokasiawal, beratawal, noor, lokasipengganti, beratpengganti

        if (statusproses == 'timbang') {
            querystr = `SELECT norincian,vp.no_detail,beratjual,no_order,IFNULL(berat_asal,0) - beratjual as selisih FROM v_penimbangan2 vp 
            left JOIN v_stokglobal_transfer vs USING(no_roll) LEFT JOIN a_batalhasiltimbang a ON no_roll=no_roll_asal 
            where vs.no_roll='${edit1}' ORDER BY selisih desc;`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows[0].selisih < 0 && onres.rows.length > 0) {
                    response.ok({ 'message': 'Kain kurang  dari order, sistem akan mengganti roll secara otomatis' })

                    vcariperincian = onres.rows[0].norincian
                    vcaridetail = onres.rows[0].no_detail
                    brtjual = onres.rows[0].beratjual
                    vnoorder = onres.rows[0].no_order

                    querystr = `START TRANSACTION`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then()

                    querystr = `SELECT * FROM v_stokglobal_transfer WHERE no_roll='${edit1}';`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        if (onres.rows.length == 0) {
                            querystr = `SELECT id_kain,id_warna,kode_spk,no_lokasi,0 AS berat_asal FROM perincian_penerimaanstok JOIN detail_penerimaanstok USING(no_detail) WHERE no_roll='${edit1}';`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                id_k = onres.rows[0].id_kain
                                id_w = onres.rows[0].id_warna
                                lot = onres.rows[0].kode_spk
                                lokasiawal = onres.rows[0].no_lokasi
                                beratawal = onres.rows[0].berat_asal
                            })
                        }
                    })

                    querystr = `DELETE FROM data_pencariankain WHERE no_perincian='${vcariperincian}';`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then()

                    querystr = `UPDATE perincian_order SET STATUS=0 WHERE no_detail='${vcaridetail}' AND no_roll='${edit1}';`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then()

                    querystr = `SELECT no_roll,no_lokasi,berat_asal FROM v_stokglobal_transfer WHERE no_roll !='${edit1}' 
                    AND id_kain='${id_k}' AND id_warna='${id_w}' AND berat >='${brtjual}';`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        if (onres.rows.length == 0) {
                            response.ok({ 'message': 'Kain stok habis, silahkan hubungi admin' }, 201, res)
                        } else {
                            noor = onres.rows[0].no_roll
                            lokasipengganti = onres.rows[0].no_lokasi
                            beratpengganti = onres.rows[0].berat_asal

                            querystr = `UPDATE perincian_order SET no_roll='${noor}' WHERE no='${vcariperincian}';`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then()

                            querystr = `INSERT INTO pergantian_roll (no_order,tanggal,id_karyawan,no_roll,alasan,lokasi_rollawal,no_rollpengganti,lokasi_rollpengganti,id_karyawansimpan,berat_awal,berat_rollpengganti,berat_order) 
                            VALUES('${vnoorder}',NOW(),'${idkaryawan}','${edit1}','KG KURANG','${lokasiawal}','${noor}','${lokasipengganti}','${idkaryawan}','${beratawal}','${beratpengganti}','${brtjual}');`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then()

                            querystr = `INSERT INTO n_notifikasi VALUES(0,NOW(),'PENIMBANGAN','HP OPERATOR','${vnoorder}','${noor}','LIST CARI KAIN','KGAN KURANG',0);`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then()

                            querystr = `COMMIT`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then()

                            response.ok({ 'message': 'Roll berhasil di ganti, silahkan hubungi bag pencarian' }, 200, res)
                        }
                    })
                }
            })

        } else if (statusproses == 'antrian') {
            if (vkeluar == 'simpan') {
                querystr = `SELECT norincian,vp.no_detail,beratjual,no_order,IFNULL(berat_asal,0) - beratjual AS selisih FROM v_penimbangan2 vp LEFT JOIN v_stokglobal_transfer vs USING(no_roll) 
                LEFT JOIN a_batalhasiltimbang a ON no_roll=no_roll_asal WHERE vs.no_roll='${edit1}' ORDER BY selisih DESC;`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    if (onres.rows[0].selisih < 0 && onres.rows.length > 0) {
                        response.ok({ 'message': 'Kain kurang dari order, sistem akan mengganti roll secara otomatis' }, 201, res)

                        vcariperincian = onres.rows[0].norincian
                        vcaridetail = onres.rows[0].no_detail
                        brtjual = onres.rows[0].beratjual
                        vnoorder = onres.rows[0].no_order

                        querystr = `START TRANSACTION`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then()

                        querystr = `select * from v_stokglobal_transfer where no_roll='${edit1}';`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then(async onres => {
                            if (onres.rows.length == 0) {
                                querystr = `select id_kain,id_warna,kode_spk,no_lokasi,0 as berat_asal from perincian_penerimaanstok join detail_penerimaanstok using(no_detail) where no_roll='${edit1}'`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                    id_k = onres.rows[0].id_kain
                                    id_w = onres.rows[0].id_warna
                                    lot = onres.rows[0].kode_spk
                                    lokasiawal = onres.rows[0].no_lokasi
                                    beratawal = onres.rows[0].berat_asal

                                    querystr = `delete from data_pencariankain where no_perincian='${vcariperincian}';`
                                    queryvalue = []
                                    await tabel.queryDB(querystr, queryvalue).then()

                                    querystr = `update perincian_order set status=0 where no_detail='${vcaridetail}' and no_roll='${edit1}';`
                                    queryvalue = []
                                    await tabel.queryDB(querystr, queryvalue).then()

                                    querystr = `select no_roll,no_lokasi,berat_asal from v_stokglobal_transfer where no_roll !='${edit1}' and id_kain='${id_k}' and id_warna='${id_w}' and berat >='${brtjual}'`
                                    queryvalue = []
                                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                        if (onres.rows.length == 0) {
                                            response.ok({ 'message': 'Kain stok habis, silahkan hubungi admin' })
                                        } else {
                                            noor = onres.rows[0].no_roll
                                            lokasipengganti = onres.rows[0].no_lokasi
                                            beratpengganti = onres.rows[0].berat_asal

                                            querystr = `update perincian_order set no_roll='${noor}' where no='${vcariperincian}'`
                                            queryvalue = []
                                            await tabel.queryDB(querystr, queryvalue).then()

                                            querystr = `INSERT INTO pergantian_roll (no_order,tanggal,id_karyawan,no_roll,alasan,lokasi_rollawal,no_rollpengganti,lokasi_rollpengganti,id_karyawansimpan,berat_awal,berat_rollpengganti,berat_order) 
                                            VALUES('${vnoorder}',NOW(),'${idkaryawan}','${edit1}','KG KURANG','${lokasiawal}','${noor}','${lokasipengganti}','${idkaryawan}','${beratawal}','${beratpengganti}','${brtjual}');`
                                            queryvalue = []
                                            await tabel.queryDB(querystr, queryvalue).then()

                                            querystr = `insert into n_notifikasi values(0,now(),'PENIMBANGAN','HP OPERATOR','${vnoorder}','${noor}','LIST CARI KAIN',''KGAN KURANG'',0)`
                                            queryvalue = []
                                            await tabel.queryDB(querystr, queryvalue).then()

                                            querystr = `COMMIT`
                                            queryvalue = []
                                            await tabel.queryDB(querystr, queryvalue).then()

                                            response.ok({ 'message': 'Roll berhasil di ganti, silahkan hubungi bag pencarian' }, 200, res)
                                        }
                                    })
                                })
                            }
                        })
                    }
                })
            }
        }
    } catch (error) {
        response.ok({ 'message': tabel.GetError(error) }, 301, res)
    }
}

exports.Edit4KeyDown_pecahroll = async (req, res) => {
    try {
        let { tplastik, tstok, edit4, edit1, idkaryawan } = req.body
        let bstok, bplastik, selisihbawal, tipekain, vsverifikasi

        if (tplastik == '' || tplastik == undefined) {
            bplastik = 0
        } else {
            bplastik = parseFloat(tplastik)
        }

        if (tstok == '' || tstok == undefined) {
            bstok = 0
        } else {
            bstok = parseFloat(tstok)
        }

        selisihbawal = Math.abs(bstok - parseFloat(edit4) - bplastik)

        querystr = `select * from v_stokglobal_transfer where no_roll='${edit1}' and sts='ROLLAN'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length != 0) {
                tipekain = onres.rows[0].jenis_kain

                querystr = `select * from perincian_pengeluaranstok where no_roll='${edit1}'`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    if (onres.rows.length == 0) {
                        response.ok({ 'message': 'Kain tersebut tidak boleh di pecah karena belum ada penettoan!' })
                    }
                })
            }

            querystr = `select data from konstanta where jenis='VERIFIKASI SUPERVISOR';`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (Math.abs(selisihbawal) >= parseFloat(onres.rows[0].data)) {
                    vsverifikasi = 'SELISIH NETTO TIMBANG ULANG'

                    querystr = `SELECT STATUS,berat FROM n_verifikasi WHERE no_roll='${edit1}' AND keterangan='SELISIH NETTO TIMBANG ULANG'  ORDER BY NO DESC LIMIT 1;`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        if (onres.rows.length == 0 || onres.rows[0].status.toString() == '2') {
                            querystr = `INSERT INTO n_verifikasi VALUES(0,'${edit1}',NULL,'${bstok}','${parseFloat(edit4) - bplastik}','${idkaryawan}',NULL,'${vsverifikasi}',NULL,NULL,0);`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then()
                        } else if (onres.rows[0].status.toString() == '1') {

                            querystr = `update n_verifikasi set status=2 where no_roll='${edit1}' and keterangan='SELISIH NETTO TIMBANG ULANG';`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then()
                        } else if (onres.rows[0].status.toString() == '0') {
                            querystr = `update n_verifikasi set berat='${bstok}',berat2='${parseFloat(edit4) - bplastik}'  where no_roll='${edit1}' and keterangan='${vsverifikasi}' and status=0`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then()
                        }
                        response.ok({ 'message': 'sukses' }, 200, res)
                    })
                }
            })
        })

    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.frxReport2GetValue_pecahroll = async (req, res) => {
    try {
        let { noroll, vgroup } = req.body
        let varname, value

        if (varname == 'gplastik') {
            value = vgroup
        }

        querystr = `SELECT * FROM data_pecahroll WHERE roll2='${noroll}';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (varname == 'rollinduk') {
                value = onres.rows[0].roll_induk
            }
        })

        querystr = `SELECT * FROM n_stok WHERE no_roll='${noroll}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (varname == 'nodata') {
                value = onres.rows[0].kode_spk
            }
        })

        if (varname == 'ket') {
            value = 'BARCODE PENGGANTI'
        }
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.frxReportpecahanGetValue_pecahroll = async (req, res) => {
    try {
        let { rollinduk, rollpecah, noroll } = req.body
        let varname, value

        if (noroll.toUpperCase().substr(0, 1) == 'R') {
            rollinduk = noroll
            rollpecah = ''
        } else {
            querystr = `SELECT * FROM data_pecahroll WHERE roll2='${noroll}'`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                rollinduk = onres.rows[0].roll_induk
                rollpecah = noroll
            })

            if (varname == 'rollinduk') {
                value = rollinduk
            }

            if (varname == 'trollpecah') {
                if (rollpecah == '') {
                    value = ''
                } else {
                    value = 'Roll Pecahan'
                }
            }

            if (varname == 'rollpecah') {
                value = rollpecah
            }

            querystr = `SELECT * FROM n_stok WHERE no_roll='${noroll}'`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (varname == ' nodata') {
                    value = onres.rows[0].kode_spk
                }
            })
        }
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.buatnoroll = async (req, res) => {
    try {
        querystr = `CALL buatnomorroll(@out_msg);
        SELECT @out_msg AS pesan;`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            response.ok(onres.rows[1][0], 200, res)
        })
        return
    } catch (e) {
        console.log(e)
        response.ok({ "message": tabel.GetError(error) }, 300, res)
        return
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

exports.koreksiselisih = async (req, res) => {
    try {
        const { tgl2, id_karyawan, nomor_roll, catatan, berat } = req.body
        if (!catatan || !tgl2 || !id_karyawan || !nomor_roll || !catatan || !berat) {
            response.ok({ pesan: 'Data tidak boleh ada yang kosong !' }, 200, res)
            return
        }
        querystr = `CALL koreksiselisih(?, ?, ?, ?, ?, @out_msg);
        SELECT @out_msg AS pesan;`
        queryvalue = [nomor_roll, tgl2, berat, catatan, id_karyawan]
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            response.ok({ pesan: onres.rows[1][0].pesan }, 200, res)
        })
        return
    } catch (e) {
        console.log(e)
        response.ok({ "message": tabel.GetError(e) }, 300, res)
        return
    }
}