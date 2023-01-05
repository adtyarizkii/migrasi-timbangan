'use strict';
const response = require('../res/res');
const tabel = require('../conn/tabel');
const HandleFunctionChangeNetto = require('../utils/funct_ubahnetto');

let querystr = '';
let queryvalue = '';

exports.penimbangan2 = async function (req, res) {
    try {
        querystr = `SELECT vp.*, vs.berat_asal,IFNULL(a.keterangan,'') AS keterangan FROM v_penimbangan2 vp JOIN v_stokglobal vs USING(no_roll) LEFT JOIN a_batalhasiltimbang a ON no_roll=no_roll_asal ORDER BY berat_ditimbang ASC;`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            response.ok(onres, 200, res)
        })
    } catch (error) {
        response.ok({ 'message': tabel.GetError(error) }, 300, res)
    }
}

exports.formshow_penimbangan2 = async (req, res) => {
    try {
        const { vnoorder } = req.body
        let vorderdibawah1kg, llokasitujuan, vlokasidibawah1kg, vmasuklewat

        querystr = `select no_order from a_orderdibawah1kg where no_order='${vnoorder}';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length > 0) {
                vorderdibawah1kg = 1

                if (vmasuklewat != 'scan') {
                    querystr = `select no_lokasi from n_lokasiorder_dibawah1kg where no_order='${vnoorder}'`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        if (onres.rows.length == 0) {
                            llokasitujuan = ''
                            vlokasidibawah1kg = ''
                        } else {
                            llokasitujuan = `Lokasi Tujuan : ${onres.rows[0].no_lokasi}`
                            vlokasidibawah1kg = onres.rows[0].no_lokasi
                        }
                    })
                }
            }
            response.ok({ vorderdibawah1kg, llokasitujuan, vlokasidibawah1kg, vmasuklewat }, 200, res)
        })
    } catch (error) {
        response.ok({ 'message': tabel.GetError(error) }, 300, res)
    }
}

exports.antrianbaru_penimbangan2 = async (req, res) => {
    try {
        const { noorder, idkaryawan } = req.body
        let nama, no_or, v_idcustomer2, lorder, lnama
        let data1, data2

        querystr = `SELECT * FROM v_antrianpenimbangan va where no_order='${noorder}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length > 0) {
                nama = onres.rows[0].nama
                no_or = onres.rows[0].no_order
                v_idcustomer2 = onres.rows[0].id_customer
                lorder = `Customer : ['${onres.rows[0].id_customer}'] ${no_or}`
                lnama = `Customer : ${nama}`

                querystr = `SELECT vp.*, vs.berat_asal,IFNULL(a.keterangan,IFNULL(av.keterangan,'')) AS keterangan FROM v_penimbangan2 vp JOIN v_stokglobal_transfer vs USING(no_roll) LEFT JOIN a_batalhasiltimbang a ON no_roll=no_roll_asal 
                LEFT JOIN (SELECT roll2,keterangan FROM data_pecahroll JOIN a_batalhasiltimbang ON roll1=no_roll_asal) AS av ON no_roll=roll2 
                WHERE  no_order='${no_or}' ORDER BY no_roll;`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    data1 = onres.rows
                })

                querystr = `select * from  status_pekerjaan where jenis_pekerjaan='PENIMBANGAN' and id_karyawan='${idkaryawan}' and no_order='${noorder}' and status=0`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    if (onres.rows.length == 0) {
                        querystr = `INSERT INTO status_pekerjaan VALUES(0,'${noorder}','PENIMBANGAN','${idkaryawan}',0);`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then()
                    } else {
                        data2 = onres.rows
                    }
                    response.ok({ 'message': nama, no_or, v_idcustomer2, lorder, lnama, data1, data2 }, 200, res)
                })
            } else {
                response.ok({ 'message': 'Tidak ada data kain yang akan di timbang' }, 200, res)
            }
        })
    } catch (error) {
        response.ok({ 'message': tabel.GetError(error) }, 300, res)
    }
}

exports.btnpecahroll_penimbangan2 = async (req, res) => {
    try {
        let { vnodetail, vnoroll, tstok } = req.body
        let kode, vnodetail10, id_kain, jenis_kain, kualitas, mesin, lebar, gramasi, id_warna, kode_spk, v_jkn2, v_wrn2, border, tplastik

        querystr = `select * from detail_order where no_detail='${vnodetail}';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            let respon = ''
            if (onres.rows.length == 0) {
                respon = 'Ada pembatalan order oleh admin data akan otomatis di refresh'
            }
            response.ok({ 'message': respon }, 201, res)
        })

        querystr = `select IFNULL(berat_asal,'kosong') as berat_asal,IFNULL(berat,'kosong') as berat,IFNULL(b_order,'kosong') asberat_order
        ,IFNULL(sts,'kosong') as sts,IFNULL(kode,'kosong') as kode from v_stokglobal_transfer where no_roll='${vnoroll}';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length == 0) {
                response.ok({ 'message': 'No Roll tidak terdaftar di stok' })
            } else {

                querystr = `SELECT * FROM perincian_penerimaanstok p JOIN detail_penerimaanstok d USING(no_detail) JOIN kain k USING(id_kain) 
                JOIN warna w USING(id_warna)  WHERE no_roll='${vnoroll}';`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {

                    kode = onres.rows[0].kode
                    vnodetail10 = onres.rows[0].no_detail
                    id_kain = onres.rows[0].id_kain
                    jenis_kain = onres.rows[0].jenis_kain
                    kualitas = onres.rows[0].kualitas
                    mesin = onres.rows[0].mesin
                    lebar = onres.rows[0].lebar
                    gramasi = onres.rows[0].gramasi
                    id_warna = onres.rows[0].id_warna
                    kode_spk = onres.rows[0].kode_spk
                    v_jkn2 = onres.rows[0].nama_kain
                    v_wrn2 = onres.rows[0].jenis_warna

                    border = parseFloat(tstok)
                    if (jenis_kain == 'BODY' && border >= 5) {
                        tplastik = '0.15'
                    } else if (jenis_kain == 'RIB' || jenis_kain == 'RIBF' || jenis_kain == 'RIBS' || jenis_kain == 'KRAH' || jenis_kain == 'MANSET' && border >= 5) {
                        tplastik = '0.10'
                    } else {
                        tplastik = '0'
                    }
                })
                response.ok({ kode, vnodetail10, id_kain, jenis_kain, kualitas, mesin, lebar, gramasi, id_warna, kode_spk, v_jkn2, v_wrn2, border, tplastik }, 200, res)
            }
        })
    } catch (error) {
        response.ok({ 'message': tabel.GetError(error) }, 300, res)
    }
}

exports.btnbatalkanpencarian_penimbangan2 = async (req, res) => {
    try {
        let { norincian, no_detail, noroll, jeniskain, warna, beratjual, vnoorder, idkaryawan, berat_asal } = req.body
        let qdatasts, noor, berat, lok

        if (qdatasts == 1) {
            querystr = `START TRANSACTION`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then()

            querystr = `delete from data_pencariankain where no_perincian='${norincian}'`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then()

            querystr = `update perincian_order set status=0 where no_detail='${no_detail}' and no_roll='${noroll}'`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then()

            querystr = `select no_roll,berat_asal,no_lokasi from v_stokglobal_transfer where no_roll !='${noroll}' and nama_kain='${jeniskain}' and jenis_warna='${warna}' and berat >='${beratjual}';`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows.length == 0) {
                    response.ok({ 'message': 'Kain stok habis, silahkan hubungi admin' }, 201, res)
                } else {
                    noor = onres.rows[0].no_roll
                    berat = onres.rows[0].berat_asal
                    lok = onres.rows[0].no_lokasi

                    querystr = `update perincian_order set no_roll='${noor}' where no='${norincian}'`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then()

                    querystr = `INSERT INTO pergantian_roll (no_order,tanggal,id_karyawan,no_roll,alasan,lokasi_rollawal,no_rollpengganti,lokasi_rollpengganti,id_karyawansimpan,berat_awal,berat_rollpengganti,berat_order)
                    VALUES('${vnoorder}',NOW(),'  ${idkaryawan}  ','${noroll}','LAIN-LAIN','${no_lokasi}','${noor}','${lok}','  ${idkaryawan}  ','${berat_asal}','${berat}','${beratjual}');`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then()
                }
            })

            querystr = `update perincian_penerimaanstok set no_lokasi='PKT' where no_roll='${noroll}';`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then()

            querystr = `insert into lama_dilokasi (no_roll,no_lokasi,tanggal_simpan,id_karyawan,berat)
            values('${noroll}','PKT',now(),'${idkaryawan}','${berat_asal}');`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then()

            querystr = `COMMIT`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then()

            response.ok({ 'message': 'Pencarian berhasil dibatalkan..' }, 200, res)
        } else {
            response.ok({ 'message': 'Kain tersebut belum di cari' }, 201, res)
        }
    } catch (error) {
        response.ok({ 'message': tabel.GetError(error) }, 300, res)
    }
}

exports.btngantiorder_penimbangan2 = async (req, res) => {
    try {
        let { idkaryawan } = req.body
        querystr = `select * from status_pekerjaan where status=0 and jenis_pekerjaan='PENIMBANGAN' and id_karyawan='${idkaryawan}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            let respon = ''
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

                respon = 'Sukses'
            }
            response.ok({ 'message': respon }, respon == '' ? 201 : 200, res)
        })
    } catch (error) {
        response.ok({ 'message': tabel.GetError(error) }, 300, res)
    }
}

exports.btnubahroll_penimbangan2 = async (req, res) => {
    try {
        let { vorderdibawah1kg, noroll, berat_asal, warna, jenis_kain, datanodetail, datanorincian, databeratjual } = req.body
        let berat, noroll0, kain2, warna2, k_spk, va_limit, jmlstok, v_nodetailupdatekain, v_norincianupdatekain

        if (vorderdibawah1kg > 0) {
            querystr = `select * from v_stokglobal where nama_kain='${jenis_kain}' and jenis_warna='${warna}' and berat = '${berat_asal}' and no_roll <> '${noroll}'`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                response.ok(onres.rows, 200, res)
            })
        } else {
            v_nodetailupdatekain = datanodetail.toString()
            v_norincianupdatekain = datanorincian.toString()

            querystr = `select * from detail_order where no_detail='${v_nodetailupdatekain}`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows.length == 0) {
                    response.ok({ 'message': 'Ada pembatalan order oleh staff benang data akan otomatis di refresh' }, 201, res)
                }
            })

            querystr = `select jenis_kain,warna,kode_spk from detail_order where no_detail='${v_nodetailupdatekain}'`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                kain2 = onres.rows[0].jenis_kain
                warna2 = onres.rows[0].warna
                k_spk = onres.rows[0].kode_spk
                berat = databeratjual.toString()
                noroll0 = noroll

                querystr = `(SELECT no_lokasi,ppn.no_roll,kode_spk,  
                    ppn.berat-IFNULL(SUM(pps.beratkeluar),0)-IFNULL(ppr.beratretur,0)-IFNULL(ppo.beratorder,0) AS berat,  
                    IF(( (IFNULL(ppg.jmlkeluar,0) = 0) AND (SUBSTR(ppn.no_roll,1,1) = 'R') AND (IFNULL(ppp.jmlpecahan,0) = 0)),'ROLLAN','KGAN') AS status_kain  
                    FROM detail_penerimaanstok dpk JOIN perincian_penerimaanstok ppn ON dpk.no_detail=ppn.no_Detail  
                    LEFT JOIN                                                                              
                    (SELECT no_roll,IFNULL(SUM(berat),0) AS beratkeluar FROM perincian_pengeluaranstok GROUP BY no_roll) AS pps ON pps.no_roll=ppn.no_roll  
                    LEFT JOIN        
                    (SELECT no_roll,IFNULL(SUM(berat),0) AS beratretur FROM perincian_detailreturpenerimaanstok GROUP BY no_roll) AS ppr ON ppr.no_roll=ppn.no_roll  
                     LEFT JOIN              
                     (SELECT no_roll,IFNULL(COUNT(no_roll),0) AS jmlkeluar FROM perincian_pengeluaranstok GROUP BY no_roll) AS ppg ON ppg.no_roll=ppn.no_roll  
                    LEFT JOIN
                     (SELECT roll1 AS no_roll,IFNULL(COUNT(roll1),0) AS jmlpecahan FROM data_pecahroll GROUP BY roll1) AS ppp ON ppp.no_roll=ppn.no_roll   
                     LEFT JOIN
                     (SELECT no_roll,IFNULL(SUM(berat),0) AS beratorder FROM perincian_order where berat_ditimbang=0 GROUP BY no_roll) AS ppo ON ppo.no_roll=ppn.no_roll    
                     JOIN kain k USING(id_kain) JOIN warna w USING(id_Warna)
                      WHERE no_lokasi!='BS' AND  no_lokasi!='SEGEL' AND  no_lokasi!='CACAT' AND no_lokasi!='PERBAIKAN' and  no_lokasi!='TITIP' and no_lokasi!='H' and ppn.no_roll!='${noroll0}' and kode_spk='${k_spk}' and no_lokasi!='PERBAIKAN' and no_lokasi!='TITIP'  and nama_kain='${kain2}' and jenis_warna='${warna2}'  
                    GROUP BY no_roll    
                    HAVING status_kain='KGAN' and berat!=0 and berat >=floattostr(strtofloat(berat)-0.05)  order by berat asc limit 100 )`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    if (onres.rows.length > 0) {
                        response.ok(onres.rows, 200, res)
                    } else {
                        response.ok({ 'message': 'Stok untuk kain tersebut sudah habis' })
                    }
                })
            })
        }
    } catch (error) {
        response.ok({ 'message': tabel.GetError(error) }, 300, res)
    }
}

exports.btncetak_penimbangan2 = async (req, res) => {
    try {
        let { idkaryawan } = req.params

        querystr = `select * from cetak_barcodetimbangan where id_karyawan='${idkaryawan}'  order by no desc limit 10`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            response.ok(onres.rows, 200, res)
        })
    } catch (error) {
        response.ok({ 'message': tabel.GetError(error) }, 300, res)
    }
}

exports.Edit1KeyDown_penimbangan2 = async (req, res) => {
    try {
        let { noroll, vnoorder, idkaryawan, edit1, vnamacust, datanorincian, datanodetail } = req.body
        let no, vnodetail, vno, vborder, vkain, vwarna, beratasal, llokasitujuan, vlokasidibawah1kg, k, t, tes, tipekain, tplastik, noorder, lorder, lnama, label1, label2, label8, border

        querystr = `SELECT * FROM v_penimbangan2 WHERE no_roll='${noroll}' AND no_order='${vnoorder}';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length == 0) {
                response.ok({ 'message': `No Roll tidak terdaftar di list order ${vnoorder} !` }, 201, res)
            } else {
                no = onres.rows[0].norincian
                vnodetail = onres.rows[0].no_detail
                vno = no
                vborder = onres.rows[0].beratjual
                vkain = onres.rows[0].jenis_kain
                vwarna = onres.rows[0].warna

                querystr = `SELECT nama FROM a_hold_order LEFT JOIN user USING(id_user) WHERE no_order='${vnoorder}'`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    let respon = ''
                    if (onres.rows.length != 0) {
                        respon = `Order ${vnoorder} sedang di edit oleh admin ${onres.rows[0].nama}`
                    }
                    response.ok({ 'message': respon }, 200, res)
                })

                querystr = `select * from penjualan_kainstok_temp where no_pengeluaran='${vnoorder}'`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    let respon = ''
                    if (onres.rows.length > 0) {
                        querystr = `select * from pergantian_roll where no_rollpengganti='${noroll}' and no_order='${vnoorder}'`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then(async onres => {
                            if (onres.rows.length == 0) {
                                querystr = `select * from perincian_pengeluaranstok_temp join detail_pengeluaranstok_temp using(no_detail) where no_roll='${noroll}' and no_pengeluaran='${vnoorder}'`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                    if (onres.rows.length == 0) {
                                        respon = 'Silahkan melakukan cetak faktur terlebih dahulu'
                                    }
                                })
                            }
                        })
                    }
                    response.ok({ 'message': respon }, respon == '' ? 201 : 200, res)
                })

                querystr = `select * from n_cycle_potong where no_order='${vnoorder}' and no_roll='${noroll}'`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    if (onres.rows.length == 0) {
                        querystr = `select berat_asal from v_stokglobal_transfer where no_roll='${noroll}'`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then(async onres => {
                            beratasal = onres.rows[0].berat_asal
                        })

                        querystr = `INSERT INTO n_cycle_potong (no_order,no_roll,berat_scan,tanggal_scan,id_user_scan)
                        VALUES('${vnoorder}','${noroll}','${beratasal}',NOW(),'${idkaryawan}');`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then()
                    }
                })

                querystr = `select no_lokasi from n_lokasiorder_dibawah1kg where no_order='${vnoorder}'`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    if (onres.rows.length == 0) {
                        if (vlokasidibawah1kg == '') {
                            llokasitujuan = ''
                            vlokasidibawah1kg = ''
                        }
                    } else {
                        llokasitujuan = `Lokasi Tujuan : ${onres.rows[0].no_lokasi}`
                        vlokasidibawah1kg = onres.rows[0].no_lokasi
                    }
                })

                querystr = `select * from perincian_pengeluaranstok where no_roll='${noroll}'`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    k = onres.rows.length
                })

                querystr = `select * from data_pecahroll where roll1='${noroll}'`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    t = onres.rows.length
                })

                if (k == 0 && t == 0 && tes == 'R') {
                    if (tipekain == 'BODY') {
                        tplastik = '0.15'
                    } else {
                        tplastik = '0.10'
                    }
                } else {
                    querystr = `SELECT IFNULL(berat_asal,'kosong') AS berat_asal,IFNULL(berat,'kosong') AS berat,IFNULL(b_order,'kosong') asberat_order,IFNULL(sts,'kosong') AS sts,IFNULL(kode,'kosong') AS kode FROM v_stokglobal_transfer WHERE no_roll='${edit1}';`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        let respon = ''
                        if (onres.rows[0].berat_asal == 'kosong') {
                            respon = 'Stok habis!'
                        } else {
                            querystr = `select no_order from a_orderdibawah1kg where no_order='${noorder}'`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                if (onres.rows.length == 0) {
                                    lorder = `No Order : ${noorder}`
                                    lnama = `Nama : ${vnamacust}`
                                    label1 = `Jenis Kain : ${vkain}`
                                    label2 = `Warna : ${vwarna}`

                                    vcariperincian = datanorincian
                                    vcaridetail = datanodetail

                                    querystr = `SELECT v.no_Roll, berat_asal FROM v_penimbangan2 v JOIN v_stokglobal_transfer USING(no_Roll)  WHERE LEFT(v.no_roll,1)='R' AND v.no_roll NOT IN (SELECT roll_induk FROM data_pecahroll JOIN kain_catatan ON no_roll=roll2 
                                    WHERE status_kain='SEGEL') AND v.no_roll='${noroll}';`
                                    queryvalue = []
                                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                        if (onres.rows.length > 0) {
                                            label8 = 'Kain belum potong gsegel'
                                        } else {
                                            if (noroll.substr(0, 1) == 'A') {
                                                label8 = ''
                                            } else {
                                                label8 = 'Kain sudah potong segel'
                                            }
                                        }
                                    })

                                    if (tipekain == 'RIB' || tipekain == 'RIBF' || tipekain == 'RIBS' || tipekain == 'KRAH' || tipekain == 'MANSET' && border >= 5) {
                                        tplastik = '0.10'
                                    } else {
                                        tplastik = '0'
                                    }
                                }
                            })
                        }
                        response.ok({ 'message': respon, no, vnodetail, vno, vborder, vkain, vwarna, beratasal, llokasitujuan, vlokasidibawah1kg, k, t, tes, tipekain, tplastik, noorder, lorder, lnama, label1, label2, label8, border }, respon == '' ? 200 : 201, res)
                    })
                }
            }
        })
    } catch (error) {
        response.ok({ 'message': tabel.GetError(error) }, 300, res)
    }
}

exports.ubahnetto = async (req, res) => {
    try {
        const props = req.body
        const page = 'penimbangan2'
        const myFunc = new HandleFunctionChangeNetto(props, page)
        return response.ok({ pesan: await myFunc.ubahNetto() }, 200, res)
    } catch (e) {
        console.log(e)
        response.ok({ "message": tabel.GetError(e) }, 300, res)
        return
    }
}