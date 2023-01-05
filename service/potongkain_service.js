'use strict';
const response = require('../res/res')
const tabel = require('../conn/tabel');

let querystr = '';
let queryvalue = '';

exports.SelesaiPotong = async function (req, res) {
    try {
        const noorder = req.body.noorder
        const nodetail = req.body.nodetail
        const norincian = req.body.norincian
        const noroll = req.body.noroll
        const kain = req.body.kain
        const warna = req.body.warna
        const lot = req.body.lot
        // const kodeverifikasi = req.body.kodeverifikasi
        const habis = req.body.habis
        const berat = req.body.berat
        const berat_awal = req.body.berat_awal
        const berat_stok = req.body.berat_stok
        const berat_timbang = req.body.berat_timbang
        const berat_plastik = req.body.berat_plastik
        const selisihbawal = req.body.selisihbawal
        const sisapotong = req.body.sisapotong
        const berat_habis = req.body.berat_habis
        const tanggal_roll1 = req.body.tanggal_roll1
        const iduser_roll1 = req.body.iduser_roll1
        const iduser = req.body.iduser
        const checkbox = req.body.checkbox
        const koreksiminus = req.body.koreksiminus
        const statusproses = req.body.statusproses
        const stskoreksi = req.body.stskoreksi

        querystr = 'CALL sp_selesaipotong(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
        queryvalue = [noorder, nodetail, norincian, noroll, kain, warna, lot, habis, berat, berat_awal, berat_stok, berat_timbang, berat_plastik, selisihbawal, sisapotong, tanggal_roll1, iduser_roll1, iduser, checkbox, statusproses, stskoreksi]
        console.log(queryvalue)
        await tabel.queryDB(querystr, queryvalue)
            .then(onres => {
                console.log(onres.rows)
                const status = onres.rows[0][0].status
                const message = onres.rows[0][0].message
                const no_roll_pecah = onres.rows[0][0]["no_roll_pecah"]
                response.ok({ "message": message, no_roll_pecah }, status, res)
            })
    } catch (e) {
        response.ok({ "message": tabel.GetError(e) }, 300, res)
    }
}

exports.potong_kain = async (req, res) => {
    let { bakhir, no, kain, warna, vborder, no_order, idKaryawan } = req.body;
    let kurangorder, vnorolorder, vspkorder, nodetail15
    try {
        querystr = `UPDATE detail_order SET berat_ataujmlroll='${bakhir}'
        WHERE no_detail=(SELECT no_detail FROM perincian_order WHERE NO='${no}');`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then()

        querystr = `UPDATE perincian_order SET berat='${bakhir}' WHERE NO='${no}';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then()

        kurangorder = vborder - parseFloat(bakhir)

        querystr = `SELECT IFNULL(no_roll,'kosong') AS noroll,IFNULL(berat,'kosong') AS berat,IFNULL(kode,'kosong') AS kode FROM v_stokglobal_transfer 
        WHERE nama_kain='${kain}' AND jenis_warna='${warna}' HAVING berat >='${kurangorder}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            vnorolorder = onres.rows[0].noroll
            vspkorder = onres.rows[0].kode

            if (vnorolorder == '' || vnorolorder == undefined || vnorolorder == 'kosong') {
                response.ok({ 'message': 'Tidak ada kain yang bisa memenuhi kekurangan order tersebut silahkan hub admin!' }, 201, res)
            } else {
                querystr = `INSERT INTO detail_order VALUES(0,'${no_order}','${kain}','${warna}','KGAN','${kurangorder}',0,'SIAP POTONG',0,'',0,'${vspkorder}');`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then()

                querystr = `select max(no_detail) as no from detail_order`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    nodetail15 = onres.rows[0].no
                })

                querystr = `INSERT INTO perincian_order VALUES(0,'${vnorolorder}','${nodetail15}',0,'${kurangorder}',0,'${idKaryawan}',0,'','')`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then()
                response.ok({ 'message': 'Data berhasil di pecah order' }, 200, res)
            }
        })
    } catch (error) {
        response.ok({ 'message': tabel.GetError(error) }, 300, res)
    }
}

exports.formshow_potongkain = async (req, res) => {
    try {
        let { noorder, edit1 } = req.body
        let intervalenter, lstep

        querystr = `SELECT DATA FROM konstanta WHERE jenis ='INTERVAL ENTER TIMBANGAN'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length > 0) {
                intervalenter = onres.rows[0].data
            } else {
                intervalenter = 30
            }
        })

        querystr = `SELECT CONCAT('PROSES POTONG ',(total - jmlroll) + 1,' / ',total) AS dari 
        FROM v_antrianpenimbanganfix WHERE no_order='${noorder}';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length == 0) {
                lstep = ''
            } else {
                lstep = onres.rows[0].dari
            }
        })

        querystr = `select * from v_stokglobal_transfer where no_roll='${edit1}' and sts='ROLLAN';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length != 0) {
                querystr = `select * from perincian_pengeluaranstok where no_roll='${edit1}'`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres1 => {
                    if (onres1.rows.length == 0) {
                        querystr = `INSERT INTO n_tidak_masuk_penettoan VALUES(0,'${edit1}', NOW());`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then()
                    }
                    response.ok({ onres, onres1 }, 200, res)
                })
            }
        })
    } catch (error) {
        response.ok({ 'message': tabel.GetError(error) }, 300, res)
    }
}

exports.button1click_potongkain = async (req, res) => {
    try {
        let { edit4, edit5, edit2, vnoorder, tplastik, edit1, vkain, vnodetail, idkaryawan } = req.body
        let bawal, habis, noroll, tanggal, kodeverifikasi, lot, g, mn, mb, i, saldo, jenis, kn, wr, bawal2, beratulang, bstok, selisih, selisihtimbang, kn2, wr2, t_rol, lokasiawal, tmp, prosesjalan, stskoreksi, pecahorder, kain, warna, kodespk, nodetail15, vnorolorder, vspkorder, tipekn, tampilkanpesan, selisihpersen, kurangorder, sisapotong, hasiltimbang, bplastik, selisihbawal, pesan, no_idx, k, notimbangan, namaprinter, koreksiminus, bgroupplastik, loknoorder, loknodetail, lokasipiktet, idpiket, cekrolldouble, statussesc
        let bakhir, vborder, intervalenter, vno, vgroup, qplastik


        if (edit4 == '') {
            response.ok({ 'message': 'Berat awal harus diisi!' }, 201, res)
        }
        if (edit5 == '') {
            response.ok({ 'message': 'Berat sisa harus diisi!' }, 201, res)
        }
        if (edit4 == '0') {
            response.ok({ 'message': 'Berat awal tidak boleh 0!' }, 201, res)
        }
        if (parseFloat(edit2) <= 0.01) {
            response.ok({ 'message': 'Berat Stok tidak boleh kurang dari sama dengan 0, silahkan ulangi !' }, 201, res)
        }

        if (tplastik == '') {
            bplastik = 0
        } else {
            bplastik = parseFloat(tplastik)
        }

        querystr = `select * from order_pembelian where no_order='${vnoorder}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            jenis = onres.rows[0].jenis
            if (jenis == 'TOKO') {
                bakhir = hasiltimbang
            } else {
                bakhir = vborder
            }
        })

        prosesjalan = 'JALAN'
        stskoreksi = 'JANGAN'
        pecahorder = 'TIDAK'
        sisapotong = bawal2 - hasiltimbang

        querystr = `select roll2 from data_pecahroll where roll1='${edit1}' AND tanggal_pecah BETWEEN DATE_ADD(now() ,INTERVAL -${intervalenter} SECOND) AND now()`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length > 0) {
                cekrolldouble = onres.rows[0].roll2

                querystr = `select no_roll from detail_order join perincian_order p using(no_detail)
                where p.no = '${vno}' and no_roll='${cekrolldouble}';`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    if (onres.rows.length > 0) {

                        querystr = `select no_lokasi from perincian_penerimaanstok where no_roll='${edit1}'`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then(async onres => {
                            if (onres.rows.length > 0) {
                                lokasiawal = onres.rows[0].no_lokasi
                            }
                        })

                        querystr = `SELECT * FROM group_penimbangan gp JOIN detail_order dr ON dr.no_Detail=gp.no_Detailorder 
                        JOIN order_pembelian op USING(no_order) JOIN customer c USING(id_customer)
                        WHERE gp.roll1='${edit1}' AND roll2='${cekrolldouble}' ORDER BY gp.no ASC;`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then(async onres => {
                            if (onres.rows.length > 0) {
                                querystr = `SELECT *, IF((SELECT COUNT(no_roll) AS jml FROM detail_order JOIN perincian_order pr USING(no_Detail) WHERE jenis_quantity='KGAN' AND pr.status=0 AND no_order=va.no_order)=0,'KOMPLIT',
                                IF((SELECT COUNT(no_roll) AS jml FROM detail_order JOIN perincian_order pr USING(no_Detail) WHERE jenis_quantity='KGAN' AND pr.status=1 AND no_order=va.no_order)>0,'PROSES','')) AS statusambil 
                                FROM v_antrianpenimbanganfix va where no_order in (select no_order from detail_order join perincian_order using (no_detail) where no_roll=''${edit1}) ORDER BY jenis DESC,tgl_ambil ASC;`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                    if (onres.rows.length >= 1) {
                                        querystr = `SELECT a.*,(SELECT DATA FROM konstanta WHERE jenis='PIKET ORDER') AS params 
                                        FROM (SELECT @urut:= @urut + 1 AS urut,v.no_order FROM v_antrianpenimbanganfix v JOIN (SELECT @urut:=0) AS a)AS a 
                                        LEFT JOIN konfirmasi_pembayaran k USING(no_order) LEFT JOIN n_temp_kasir n USING(no_order) 
                                        WHERE no_order='${onres.rows[0].no_order}' AND ISNULL(k.no_order) AND ISNULL(n.no_order) HAVING urut >= params`
                                        queryvalue = []
                                        await tabel.queryDB(querystr, queryvalue).then(async onres1 => {
                                            if (onres1.rows.length > 0) {
                                                response.ok({ 'message': 'Simpan Kain ini ke lokasi PKT!' }, 201, res)
                                            } else {
                                                response.ok({ 'message': `Kain ini dibutuhkan oleh ${onres.rows[0].nama}, Silahkan simpan dilokasi ${lokasiawal}` }, 201, res)

                                                querystr = `SELECT *, IF((SELECT COUNT(no_roll) AS jml FROM detail_order JOIN perincian_order pr USING(no_Detail) WHERE jenis_quantity='KGAN' AND pr.status=0 AND no_order=va.no_order)=0,'KOMPLIT',
                                                IF((SELECT COUNT(no_roll) AS jml FROM detail_order JOIN perincian_order pr USING(no_Detail) WHERE jenis_quantity='KGAN' AND pr.status=1 AND no_order=va.no_order)>0,'PROSES','')) AS statusambil
                                                FROM v_antrianpenimbanganfix va WHERE no_order IN (SELECT no_order FROM detail_order JOIN perincian_order USING (no_detail) WHERE no_roll='${edit1}')
                                                ORDER BY jenis DESC,tgl_ambil ASC;`
                                                queryvalue = []
                                                await tabel.queryDB(querystr, queryvalue).then(async onres2 => {
                                                    if (onres2.rows.length > 0) {
                                                        loknoorder = onres2.rows[0].no_order

                                                        querystr = `select no_detail from detail_order where no_order='${loknoorder}'`
                                                        queryvalue = []
                                                        await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                                            if (onres.rows.length > 0) {
                                                                querystr = `update perincian_order set status=1 where no_detail='${loknodetail}' and no_roll='${edit1}'`
                                                                queryvalue = []
                                                                await tabel.queryDB(querystr, queryvalue).then()

                                                                querystr = `update perincian_penerimaanstok set no_lokasi='${lokasiawal}' where no_roll='${edit1}'`
                                                                queryvalue = []
                                                                await tabel.queryDB(querystr, queryvalue).then()
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })

                                querystr = `SELECT * FROM kategori_sisakain WHERE '${edit4}' >= b_bawah AND '${edit4}' < b_atas AND jenis_kain='all';`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                    if (onres.rows.length != 0) {
                                        vgroup = onres.rows[0].group
                                    } else {
                                        vgroup = ''
                                    }
                                })

                                querystr = `select *,concat(berat_asal,' Kg') as brt from v_stokglobal_transfer where no_roll='${edit1}'`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                    qplastik = onres.rows
                                })

                                querystr = `SELECT * FROM kategori_sisakain WHERE '${sisapotong}' >= b_bawah AND '${sisapotong}' < b_atas AND jenis_kain='all';`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                    if (onres.rows.length != 0 && vgroup != onres.rows[0].group && qplastik.length != 0) {
                                        if (sisapotong < 0.05) {
                                            vgroup = `- ${parseFloat(sisapotong)}`
                                        } else {
                                            vgroup = onres.rows[0].group
                                        }

                                        querystr = `SELECT LOWER(DATA) AS data FROM konstanta WHERE jenis='PRINT SISA POTONG'`
                                        queryvalue = []
                                        await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                            if (onres.rows.length == 0 || onres.rows[0].data == 'on') {
                                                vsts = 'sisakain'
                                            }
                                        })
                                    } else {
                                        statussesc = 'boleh'
                                        // checkpoint line 1840
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
        statussesc = 'jangan'
        if (bawal2 <= (Math.abs(vborder) - 0.02)) {
            response.ok({'message': 'Berat kain lebih kecil atau lebih besar dari berat order silahkan hub admin untuk melakukan edit order!'}, 201, res)
            statussesc = 'boleh'
        }

        cekstok = bawal2 - vborder
        try {
            
            querystr = `select tanggal,id_user from penjualan_kainstok join detail_pengeluaranstok using(no_pengeluaran) join perincian_pengeluaranstok using(no_detail) where no_roll='${edit1}'`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows.length > 0) {
                    idusersot = onres.rows[0].id_user
                    tglsot = onres.rows[0].tanggal                    
                } else {
                    querystr = `select tanggal_terima,id_user FROM pembelian_kainstok JOIN detail_penerimaanstok USING(no_terima) JOIN perincian_penerimaanstok USING(no_detail) WHERE no_roll='${edit1}'`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        idusersot = onres.rows[0].id_user
                        tglsot = onres.rows[0].tanggal                        
                    })
                }
            })

            if (hasiltimbang != vborder) {
                selisihtimbang = hasiltimbang - vborder
                selisihpersen = (selisihtimbang / vborder) * 100

                querystr = `select selisih,(selisih / '${vborder}') * 100 as persen from ( select '${hasiltimbang}' - '${vborder}' as selisih) v`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    selisihtimbang = onres.rows[0].selisih
                    selisihpersen = onres.rows[0].persen

                    querystr = `select tipe_kain from kain where nama_kain='${vkain}'`
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        if (selisihpersen > 5 && onres.rows[0].tipe_kain == 'BODY') {
                            response.ok({'message': 'Selisih penimbangan lebih dari 5% silahkan pecah roll terlebih dahulu!'}, 201, res)
                            statussesc = 'boleh'
                        } else {
                            // do something here ...
                        }

                        if (prosesjalan == 'JALAN' && pecahorder != 'YA') {
                            stskoreksi = 'KOREKSI'

                            querystr = `INSERT INTO selisih_penjualanonline 
                            VALUES(0,'${vnodetail}','${hasiltimbang}','${vborder}','${idkaryawan}',NOW(),0);`
                            await tabel.queryDB(querystr, queryvalue).then()

                        }
                    })
                })
            }

            if (prosesjalan != 'JALAN') {
                querystr = `ROLLBACK`
                await tabel.queryDB(querystr, queryvalue).then()

                statussesc = 'boleh'
            }

            querystr = `select *,ifnull(kode_spk,'') as lot from detail_order where no_Detail='${vnodetail}'`
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows.length == 0) {
                    lot = ''
                } else {
                    lot = onres.rows[0].lot
                }
            })

            querystr = `select * from penjagaan_timbangan where no_perincian ='${vno}'`
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows.length > 0) {
                    response.ok({'message': 'Ada kesalahan sistem saat pecah roll, silahkan ulangi!'}, 201, res)
                    querystr = `ROLLBACK`
                    await tabel.queryDB(querystr, queryvalue).then()

                    querystr = `delete from penjagaan_timbangan where no_perincian='${vno}'`
                    await tabel.queryDB(querystr, queryvalue).then()

                    statussesc = 'boleh'
                }
            })

            querystr = `insert into penjagaan_timbangan values(0,'${vno}')`
            await tabel.queryDB(querystr, queryvalue).then()

            querystr = `select * from v_stokglobal_transfer where no_roll='${edit1}'`
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                koreksiminus = 'tidak'
                if (onres.rows.length > 0) {
                    bstok = onres.rows[0].berat_asal

                    if (bstok >= -0.03 && bstok <= 0.03) {
                        koreksiminus = 'ya'
                        bstok = bstok
                    }
                } else {
                    bstok = 0
                }
            })

            querystr = `select * from detail_order where dikerjakan='SIAP POTONG' and no_order='${vnoorder}'`
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows.length > 0) {
                    kn = onres.rows[0].jenis_kain
                    wr = onres.rows[0].warna
                    response.ok({'message': `Stok untuk kain ${kn} warna ${wr} menurut stok sudah habis silahkan hub admin untuk edit order!`}, 201, res)
                } else {
                    response.ok(onres.rows, 200, res)
                }
            })

            querystr = `select * from status_pekerjaan where jenis_pekerjaan=''PENIMBANGAN'' and id_karyawan='${idkaryawan}' and no_order='${vnoorder}'`
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows.length > 0) {
                    querystr = `update status_pekerjaan set status=1 where jenis_pekerjaan='PENIMBANGAN' and id_karyawan='${idkaryawan}' and no_order='${vnoorder}'`
                    await tabel.queryDB(querystr, queryvalue).then()
                }
            })

            selisihbawal = parseFloat(edit2) - (parseFloat(edit4) - parseFloat(tplastik))

            // 2152

            querystr = `select no_lokasi from perincian_penerimaanstok where no_roll='${edit1}'`
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows > 0) {
                    lokasiawal = onres.rows[0].no_lokasi

                    querystr = `SELECT *, IF((SELECT COUNT(no_roll) AS jml FROM detail_order JOIN perincian_order pr USING(no_Detail) 
                    WHERE jenis_quantity='KGAN' AND pr.status=0 AND no_order=va.no_order)=0,'KOMPLIT', IF((SELECT COUNT(no_roll) AS jml 
                    FROM detail_order JOIN perincian_order pr USING(no_Detail) WHERE jenis_quantity='KGAN' AND pr.status=1 
                    AND no_order=va.no_order)>0,'PROSES','')) AS statusambil  FROM v_antrianpenimbanganfix va 
                    WHERE no_order IN (SELECT no_order FROM detail_order JOIN perincian_order USING (no_detail) WHERE no_roll='${edit1}')
                    ORDER BY jenis DESC,tgl_ambil ASC;`
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        if (onres.rows.length > 0) {
                            loknoorder = onres.rows[0].no_order
                        }
                    })
                }
            })

            querystr = `select no_roll,berat_asal from v_stokglobal_transfer where no_roll='${edit1}'`
            await tabel.queryDB(querystr, queryvalue).then(async onres =>{
                if (onres.rows.length != 0 && (onres.rows[0].berat_asal >= cekstok)) {
                    // 2197
                }
            })

        } catch (e) {
			querystr = `ROLLBACK`
            response.ok({'message': 'Data gagal disimpan, silahkan ulangi lagi!', 'err': e }, 301, res)
	    }
    } catch (error) {
        response.ok({ 'message': tabel.GetError(error) }, 300, res)
    }
}

exports.formclose_potongkain = async (req, res) => {
    try {
        let { idkaryawan } = req.body

        querystr = `select * from status_pekerjaan where status=0 and jenis_pekerjaan='PENIMBANGAN' and id_karyawan='${idkaryawan}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length > 0) {
                querystr = `START TRANSACTION`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then()

                querystr = `delete from status_pekerjaan where status=0 and jenis_pekerjaan='PENIMBANGAN' and id_karyawan='${idkaryawan}'`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then()

                querystr = `COMMIT`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then()

                querystr = `COMMIT`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then()

                response.ok({ 'message': 'sukses' }, 200, res)
            }
        })

    } catch (error) {
        response.ok({ 'message': tabel.GetError(error) }, 300, res)
    }
}

exports.frxReport1GetValue_potongkain = async (req, res) => {
    try {
        let { noorder } = req.body
        let varname, value, jmltotal, jmldari, hasil

        querystr = `SELECT COUNT(DISTINCT no_detail) AS total,IFNULL(SUM(IF(dikerjakan='SIAP KIRIM',1,0)),0) AS dari FROM detail_order 
        WHERE no_order='${noorder}' AND jenis_quantity='KGAN';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length > 0) {
                jmltotal = onres.rows[0].total
                jmldari = onres.rows[0].dari
            } else {
                jmltotal = 0
                jmldari = 0
            }
            hasil = `${jmldari} dari ${jmltotal}`

            if (varname == 'urutan') {
                value = hasil
            }
        })
        response.ok({ 'message': varname, value, jmltotal, jmldari, hasil }, 200, res)
    } catch (error) {
        response.ok({ 'message': tabel.GetError(error) }, 300, res)
    }
}

exports.frxReport2GetValue_potongkain = async (req, res) => {
    try {
        let { qplastiknoroll, vgroup } = req.body
        let varname, value

        if (varname == 'gplastik') {
            value = vgroup
        }

        querystr = `SELECT * FROM data_pecahroll WHERE roll2='${qplastiknoroll}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (varname == 'rollinduk') {
                value = onres.rows[0].roll_induk
            }
        })

        querystr = `SELECT * FROM n_stok WHERE no_roll='${qplastiknoroll}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (varname == 'nodata') {
                value = onres.rows[0].kode_spk
            }
        })

        if (varname == 'ket') {
            value = 'BARCODE PENGGANTI'
        }
        response.ok({ 'message': varname, value }, 200, res)
    } catch (error) {
        response.ok({ 'message': tabel.GetError(error) }, 300, res)
    }
}

exports.koreksistokopname_potongkain = async (req, res) => {
    try {
        const { nomor_roll, berat, id_karyawan, beratawal } = req.body
        querystr = `CALL koreksistokopname(?, ?,?, ?,@out_msg);
        SELECT @out_msg AS pesan;`
        queryvalue = [nomor_roll, parseInt(berat), parseInt(id_karyawan), parseInt(beratawal)]
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            return response.ok({ pesan: onres.rows[1][0].pesan }, 200, res)
        })

    } catch (e) {
        console.log(e)
        response.ok({ "message": tabel.GetError(e) }, 300, res)
        return
    }
}