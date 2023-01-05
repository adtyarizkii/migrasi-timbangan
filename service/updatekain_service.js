'use strict';
const response = require('../res/res');
const tabel = require('../conn/tabel');

let querystr = '';
let queryvalue = '';

exports.update_kain = async (req, res) => {
    let { no_roll3, kode } = req.body;
    let nama_kain, warna, basli, border, beratfix, bookingblmscan;
    try {
        querystr = `SELECT * FROM perincian_penerimaanstok
        WHERE no_roll='${no_roll3}' AND kode='${kode}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length == 0) {
                response.ok({ "message": "Kode verifikasi salah!" }, 201, res)
            } else {
                querystr = `SELECT nama_kain,jenis_warna,berat_asal,b_order,berat FROM v_stokglobal_transfer 
                WHERE no_roll='${no_roll3}';`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    if (onres.rows.length == 0) {
                        response.ok({ "message": "Kain tidak terdaftar di sistem!" }, 201, res)
                    } else {
                        nama_kain = onres.rows[0].nama_kain
                        warna = onres.rows[0].jenis_warna

                        basli = onres.rows[0].berat_asal
                        border = onres.rows[0].b_order
                        beratfix = onres.rows[0].berat

                        querystr = `SELECT jenis_kain,warna,IFNULL(SUM(berat_ataujmlroll),0) AS jmlroll 
                        FROM detail_order LEFT JOIN perincian_order po USING(no_Detail) 
                        WHERE jenis_kain='${nama_kain}' AND warna='${warna}'
                        AND po.no_detail IS NULL GROUP BY jenis_kain,warna;`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then(async onres => {
                            if (onres.rows.length > 0) {
                                bookingblmscan = onres.rows[0].jmlroll
                                response.ok(onres.rows, 200, res)
                            } else {
                                bookingblmscan = 0

                                response.ok({
                                    nama_kain: nama_kain,
                                    warna: warna,
                                    berat_asal: basli,
                                    b_order: border,
                                    berat: beratfix,
                                    jmlroll: bookingblmscan
                                }, 200, res)
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

exports.Button19Click_updatekain = async (req, res) => {
    try {
        let { edit8, tverifikasi, noor, vnorincianupdatekain, edit9, cbalasan, qstokberat } = req.body
        let kain2, warna2, kn, wr, norrr, noorder4, kodespk, vsts2, jnskn, b1, b2, idKaryawan
        if (edit8 == '') {
            response.ok({'message': 'Silahkan isi no roll yang baru'}, 201, res)
        } else {
            querystr = `select * from perincian_penerimaanstok where no_roll='${noor}' and kode='${tverifikasi}'`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows.length == 0) {
                    response.ok({'message': 'Kode verifikasi salah!!'}, 201, res)            
                } else {
                    querystr = `select no_order,jenis_kain,warna,kode_spk from detail_order join perincian_order po using(no_Detail) where po.no='${vnorincianupdatekain}'`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        kain2 = onres.rows[0].jenis_kain
                        warna2 = onres.rows[0].warna
                        noorder4 = onres.rows[0].no_order
                    })

                    querystr = `select nama_kain,jenis_warna,kode_spk,sts,jenis_kain from v_stokglobal_transfer where no_roll='${noor}' and berat > 0 `
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        if (onres.rows.length == 0) {
                            response.ok({'message': 'Stok untuk kain tersebut menurut sistem - silahkan cari kain yang lain!'}, 201, res)
                        } else {
                            kn = onres.rows[0].nama_kain
                            wr = onres.rows[0].jenis_warna
                            kodespk = onres.rows[0].kode_spk
                            vsts2 = onres.rows[0].sts
                            jnskn = onres.rows[0].jenis_kain

                            querystr = `SELECT  nama_kain,jenis_Warna,kode_spk, IFNULL(COUNT(vs.no_roll),0)-IFNULL(bk.jmlroll,0) AS stok_sementara
                            FROM v_stokglobal_transfer vs LEFT JOIN perincian_order po USING(no_roll)  LEFT JOIN (SELECT jenis_kain,warna,SUM(berat_ataujmlroll) AS jmlroll FROM order_pembelian JOIN detail_order USING(no_order) LEFT JOIN 
                            perincian_order po USING(no_Detail) WHERE po.no_detail IS NULL AND (status_order = 'SIAP CETAK FAKTUR SEMENTARA' OR status_order = 'MENUNGGU PICKING')   GROUP BY jenis_kain,warna ) AS bk ON CONCAT(bk.jenis_kain,bk.warna)=CONCAT(vs.nama_kain,vs.jenis_warna) 
                            WHERE po.no_roll IS NULL
                            AND  sts='ROLLAN'  AND nama_kain='${kn}' AND jenis_warna='${wr}' AND kode_spk='${kodespk}' AND vs.no_lokasi!='H' AND vs.no_lokasi!='TITIP' GROUP BY nama_kain,jenis_Warna,kode_spk HAVING stok_sementara > 0;`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then(async onress => {
                                if (onress.rows.length == 0 && vsts2 == 'ROLLAN' && jnskn == 'BODY') {
                                    response.ok({'message': 'No Roll tersebut tidak bisa di ambil karena sudah di pesan oleh admin!'})
                                } else {
                                    if (kain2 == kn && warna2 == wr) {
                                        b1 = parseFloat(edit9)
                                        b2 = qstokberat

                                        querystr = `START TRANSACTION`
                                        queryvalue = []
                                        await tabel.queryDB(querystr, queryvalue).then()

                                        querystr = `update perincian_order set no_roll='${noor}' where no='${vnorincianupdatekain}'`
                                        queryvalue = []
                                        await tabel.queryDB(querystr, queryvalue).then()

                                        querystr = `insert into pergantian_roll values(0,'${noorder4}',now(),'${idKaryawan}','${noor}','${cbalasan}','','','','${idKaryawan}')`
                                        queryvalue = []
                                        await tabel.queryDB(querystr, queryvalue).then()

                                        querystr = `COMMIT`
                                        queryvalue = []
                                        await tabel.queryDB(querystr, queryvalue).then()

                                        response.ok({'message': "Data berhasil di update"}, 200, res)
                                    } else {
                                        response.ok({"message": "ada kesalahan rekomendasi kain silahkan ulangi lagi"}, 201, res)
                                    }
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

exports.Button1Click_updatekain = async (req, res) => {
    try {
        let { edit7 ,edit9 } = req.body
        let kain2, warna2, k_spk, va_limit, tipekn, norr, jmlstok, qstok, qroll
        
        querystr = `select jenis_kain,warna,kode_spk,tipe_kain from detail_order do join kain k on k.nama_kain=do.jenis_kain where no_detail='${vnodetailupdatekain}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            kain2 = onres.rows[0].jenis_kain
            warna2 = onres.rows[0].warna
            k_spk = onres.rows[0].kode_spk
            tipekn = onres.rows[0].tipe_kain
        })

        querystr = `SELECT  nama_kain,jenis_Warna, IFNULL(COUNT(vs.no_roll),0)-IFNULL(bk.jmlroll,0) AS stok_sementara 
        FROM v_stokglobal_transfer vs LEFT JOIN perincian_order po USING(no_roll)
        LEFT JOIN (SELECT jenis_kain,warna,SUM(berat_ataujmlroll) AS jmlroll FROM order_pembelian JOIN detail_order USING(no_order) LEFT JOIN
        perincian_order po USING(no_Detail) WHERE po.no_detail IS NULL AND (status_order = 'SIAP CETAK FAKTUR SEMENTARA' OR status_order = 'MENUNGGU PICKING')  
        GROUP BY jenis_kain,warna ) AS bk ON CONCAT(bk.jenis_kain,bk.warna)=CONCAT(vs.nama_kain,vs.jenis_warna) WHERE po.no_roll IS NULL
        AND  sts='ROLLAN'  AND nama_kain='${kain2}' AND jenis_warna='${warna2}' AND vs.no_lokasi!='H' AND vs.no_lokasi!='TITIP' GROUP BY nama_kain,jenis_Warna HAVING stok_sementara > 0;`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length > 0) {
                jmlstok = onres.rows[0].stok_sementara
                va_limit = '150'
            } else {
                jmlstok = 0
                va_limit = '0'
            }
        })

        querystr = `SELECT * FROM v_stokglobal_transfer WHERE sts='ROLLAN' AND  nama_kain='${kain2}' AND jenis_warna='${warna2}' AND berat >= '${edit9}' AND b_order > 0 AND no_roll!='${edit7}';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length > 0) {
                norr = onres.rows[0].no_roll

                querystr = `SELECT no_lokasi,ppn.no_roll,kode_spk,  ppn.berat-IFNULL(SUM(pps.beratkeluar),0)-IFNULL(ppr.beratretur,0)-IFNULL(ppo.beratorder,0) 
                AS berat,  IF(( (IFNULL(ppg.jmlkeluar,0) = 0) AND (SUBSTR(ppn.no_roll,1,1) = 'R') AND (IFNULL(ppp.jmlpecahan,0) = 0)),'ROLLAN','KGAN') 
                AS status_kain  FROM detail_penerimaanstok dpk JOIN perincian_penerimaanstok ppn ON dpk.no_detail=ppn.no_Detail
                LEFT JOIN (SELECT no_roll,IFNULL(SUM(berat),0) AS beratkeluar FROM perincian_pengeluaranstok GROUP BY no_roll) 
                AS pps ON pps.no_roll=ppn.no_roll  LEFT JOIN (SELECT no_roll,IFNULL(SUM(berat),0) AS beratretur 
                FROM perincian_detailreturpenerimaanstok GROUP BY no_roll) AS ppr ON ppr.no_roll=ppn.no_roll
                LEFT JOIN (SELECT no_roll,IFNULL(COUNT(no_roll),0) AS jmlkeluar FROM perincian_pengeluaranstok GROUP BY no_roll) AS ppg ON ppg.no_roll=ppn.no_roll 
                LEFT JOIN (SELECT roll1 AS no_roll,IFNULL(COUNT(roll1),0) AS jmlpecahan FROM data_pecahroll GROUP BY roll1) AS ppp ON ppp.no_roll=ppn.no_roll    
                LEFT JOIN (SELECT no_roll,IFNULL(SUM(berat),0) AS beratorder FROM perincian_order WHERE berat_ditimbang=0 GROUP BY no_roll) AS ppo ON ppo.no_roll=ppn.no_roll     
                JOIN kain k USING(id_kain) JOIN warna w USING(id_Warna)   WHERE no_lokasi!='BS' AND  no_lokasi!='SEGEL' AND  no_lokasi!='CACAT' AND no_lokasi!='PERBAIKAN' 
                AND  no_lokasi!='TITIP' AND no_lokasi!='H'  AND ppn.no_roll!='${edit7}' AND no_lokasi!='PERBAIKAN' AND no_lokasi!='TITIP'  AND nama_kain='${kain2}' AND jenis_warna='${warna2}'  GROUP BY no_roll 
                HAVING status_kain='KGAN' AND berat >='${parseFloat(edit9) - 0.05}' AND berat!=0  ORDER BY berat ASC LIMIT 100`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    qstok = onres.rows
                })

                querystr = `SELECT no_lokasi,ppn.no_roll,kode_spk,  ppn.berat-IFNULL(SUM(pps.beratkeluar),0)-IFNULL(ppr.beratretur,0)-IFNULL(ppo.beratorder,0) AS berat,  IF(( (IFNULL(ppg.jmlkeluar,0) = 0) AND (SUBSTR(ppn.no_roll,1,1) = 'R') AND (IFNULL(ppp.jmlpecahan,0) = 0)),'ROLLAN','KGAN') AS status_kain  FROM detail_penerimaanstok dpk JOIN perincian_penerimaanstok ppn ON dpk.no_detail=ppn.no_Detail  
                LEFT JOIN(SELECT no_roll,IFNULL(SUM(berat),0) AS beratkeluar FROM perincian_pengeluaranstok GROUP BY no_roll) AS pps ON pps.no_roll=ppn.no_roll  LEFT JOIN                                      
                (SELECT no_roll,IFNULL(SUM(berat),0) AS beratretur FROM perincian_detailreturpenerimaanstok GROUP BY no_roll) AS ppr ON ppr.no_roll=ppn.no_roll   LEFT JOIN (SELECT no_roll,IFNULL(COUNT(no_roll),0) AS jmlkeluar FROM perincian_pengeluaranstok GROUP BY no_roll) AS ppg ON ppg.no_roll=ppn.no_roll  
                LEFT JOIN (SELECT roll1 AS no_roll,IFNULL(COUNT(roll1),0) AS jmlpecahan FROM data_pecahroll GROUP BY roll1) AS ppp ON ppp.no_roll=ppn.no_roll    LEFT JOIN                            
                (SELECT no_roll,IFNULL(SUM(berat), 0) AS beratorder FROM perincian_order JOIN detail_order dr USING(no_Detail) JOIN order_pembelian USING(no_order) WHERE status_order='SIAP KIRIM'             
                OR status_order='MENUNGGU PICKING' OR status_order='SIAP CETAK FAKTUR SEMENTARA'  GROUP BY no_roll) AS ppo ON ppo.no_roll=ppn.no_roll     JOIN kain k USING(id_kain) JOIN warna w USING(id_Warna) 
                WHERE  no_lokasi!='BS' AND  no_lokasi!='SEGEL' AND  no_lokasi!='CACAT' AND no_lokasi!='PERBAIKAN' AND  no_lokasi!='TITIP' AND no_lokasi!='H'  AND ppn.no_roll='${norr}' AND no_lokasi!='PERBAIKAN' AND SUBSTR(no_lokasi,1,2)!='B_' AND    no_lokasi!='TITIP' AND nama_kain='${kain2}' AND jenis_warna='${warna2}'  GROUP BY no_roll 
                HAVING berat >0 AND status_kain='ROLLAN'  ORDER BY berat ASC;`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    qroll = onres.rows
                })
            } else {
                
                querystr = `SELECT no_lokasi,ppn.no_roll,kode_spk,  ppn.berat-IFNULL(SUM(pps.beratkeluar),0)-IFNULL(ppr.beratretur,0)-IFNULL(ppo.beratorder,0) AS berat,  IF(( (IFNULL(ppg.jmlkeluar,0) = 0) AND (SUBSTR(ppn.no_roll,1,1) = 'R') AND (IFNULL(ppp.jmlpecahan,0) = 0)),'ROLLAN','KGAN') AS status_kain  FROM detail_penerimaanstok dpk JOIN perincian_penerimaanstok ppn ON dpk.no_detail=ppn.no_Detail  
                LEFT JOIN (SELECT no_roll,IFNULL(SUM(berat),0) AS beratkeluar FROM perincian_pengeluaranstok GROUP BY no_roll) AS pps ON pps.no_roll=ppn.no_roll  LEFT JOIN 
                (SELECT no_roll,IFNULL(SUM(berat),0) AS beratretur FROM perincian_detailreturpenerimaanstok GROUP BY no_roll) AS ppr ON ppr.no_roll=ppn.no_roll   LEFT JOIN (SELECT no_roll,IFNULL(COUNT(no_roll),0) AS jmlkeluar FROM perincian_pengeluaranstok GROUP BY no_roll) AS ppg ON ppg.no_roll=ppn.no_roll  
                LEFT JOIN (SELECT roll1 AS no_roll,IFNULL(COUNT(roll1),0) AS jmlpecahan FROM data_pecahroll GROUP BY roll1) AS ppp ON ppp.no_roll=ppn.no_roll    LEFT JOIN
                (SELECT no_roll,IFNULL(SUM(berat),0) AS beratorder FROM perincian_order WHERE berat_ditimbang=0 GROUP BY no_roll) AS ppo ON ppo.no_roll=ppn.no_roll     JOIN kain k USING(id_kain) JOIN warna w USING(id_Warna)   WHERE   no_lokasi!='BS' AND  no_lokasi!='SEGEL' AND  no_lokasi!='CACAT' AND no_lokasi!='PERBAIKAN' AND  no_lokasi!='TITIP' AND no_lokasi!='H'  AND ppn.no_roll!='${edit7}' AND no_lokasi!='PERBAIKAN' AND no_lokasi!='TITIP'  
                AND nama_kain='${kain2}' AND jenis_warna='${warna2}'  GROUP BY no_roll
                HAVING status_kain='KGAN' AND berat >= '${parseFloat(edit9) - 0.05}' AND berat!=0  ORDER BY berat ASC LIMIT 100`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    qstok = onres.rows
                })

                querystr = `SELECT no_lokasi,ppn.no_roll,kode_spk,  ppn.berat-IFNULL(SUM(pps.beratkeluar),0)-IFNULL(ppr.beratretur,0)-IFNULL(ppo.beratorder,0) AS berat,  IF(( (IFNULL(ppg.jmlkeluar,0) = 0) AND (SUBSTR(ppn.no_roll,1,1) = 'R') AND (IFNULL(ppp.jmlpecahan,0) = 0)),'ROLLAN','KGAN') AS status_kain  FROM detail_penerimaanstok dpk JOIN perincian_penerimaanstok ppn ON dpk.no_detail=ppn.no_Detail
                LEFT JOIN (SELECT no_roll,IFNULL(SUM(berat),0) AS beratkeluar FROM perincian_pengeluaranstok GROUP BY no_roll) AS pps ON pps.no_roll=ppn.no_roll  
                LEFT JOIN (SELECT no_roll,IFNULL(SUM(berat),0) AS beratretur FROM perincian_detailreturpenerimaanstok GROUP BY no_roll) AS ppr ON ppr.no_roll=ppn.no_roll 
                LEFT JOIN (SELECT no_roll,IFNULL(COUNT(no_roll),0) AS jmlkeluar FROM perincian_pengeluaranstok GROUP BY no_roll) AS ppg ON ppg.no_roll=ppn.no_roll
                LEFT JOIN (SELECT roll1 AS no_roll,IFNULL(COUNT(roll1),0) AS jmlpecahan FROM data_pecahroll GROUP BY roll1) AS ppp ON ppp.no_roll=ppn.no_roll
                LEFT JOIN (SELECT no_roll,IFNULL(SUM(berat), 0) AS beratorder FROM perincian_order JOIN detail_order dr USING(no_Detail) JOIN order_pembelian USING(no_order) WHERE status_order='SIAP KIRIM'
                OR status_order='MENUNGGU PICKING' OR status_order='SIAP CETAK FAKTUR SEMENTARA'  GROUP BY no_roll) AS ppo ON ppo.no_roll=ppn.no_roll    JOIN kain k USING(id_kain) JOIN warna w USING(id_Warna)
                WHERE no_lokasi!='BS' AND  no_lokasi!='SEGEL' AND  no_lokasi!='CACAT' AND no_lokasi!='PERBAIKAN' AND  no_lokasi!='TITIP' AND no_lokasi!='H' AND ppn.no_roll!='${edit7}' AND no_lokasi!='PERBAIKAN' AND SUBSTR(no_lokasi,1,2)!='B_' AND no_lokasi!='TITIP' AND nama_kain='${kain2}' AND jenis_warna='${warna2}' GROUP BY no_roll
                HAVING berat >0 AND status_kain='ROLLAN'  ORDER BY berat ASC LIMIT '${va_limit}'`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    qroll = onres.rows
                })
            }

            if (qstok.length > 0) {
                // do something
            } else {
                response.ok({'message': 'Stok untuk kain tersebut sudah habis'})
            }
        })
        
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.Button2Click_updatekain = async (req, res) => {
    try {
        let { vnodetailupdatekain, edit7, edit9 } = req.body
        let kain2, warna2, k_spk, va_limit, tipekn, norr, jmlstok, qstok, qroll

        querystr = `select jenis_kain,warna,kode_spk,tipe_kain from detail_order do join kain k on k.nama_kain=do.jenis_kain where no_detail='${vnodetailupdatekain}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            kain2 = onres.rows[0].jenis_kain
            warna2 = onres.rows[0].warna
            k_spk = onres.rows[0].kode_spk
            tipekn = onres.rows[0].tipe_kain

            querystr = `SELECT nama_kain,jenis_Warna,kode_spk, IFNULL(COUNT(vs.no_roll),0)-IFNULL(bk.jmlroll,0)  AS stok_sementara 
            FROM v_stokglobal_transfer vs LEFT JOIN perincian_order po USING(no_roll) 
            LEFT JOIN (SELECT jenis_kain,warna,SUM(berat_ataujmlroll) AS jmlroll FROM order_pembelian JOIN detail_order USING(no_order) 
            LEFT JOIN perincian_order po USING(no_Detail) WHERE po.no_detail IS NULL 
            AND (status_order = 'SIAP CETAK FAKTUR SEMENTARA' OR status_order = 'MENUNGGU PICKING')   GROUP BY jenis_kain,warna ) AS bk ON 
            CONCAT(bk.jenis_kain,bk.warna)=CONCAT(vs.nama_kain,vs.jenis_warna) WHERE po.no_roll IS NULL
            AND  sts='ROLLAN'  AND nama_kain='${kain2}' AND jenis_warna='${warna2}' AND kode_spk='${k_spk}'
            AND vs.no_lokasi!='H' AND vs.no_lokasi!='TITIP' GROUP BY nama_kain,jenis_Warna,kode_spk HAVING stok_sementara > 0;`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows.length > 0) {
                    jmlstok = onres.rows[0].stok_sementara
                    va_limit = '100'
                } else {
                    jmlstok = 0
                    va_limit - '0'
                }
            })

            querystr = `select * from v_stokglobal_transfer where sts='ROLLAN' and  nama_kain='${kain2}' and jenis_warna='${warna2}' and berat >='${edit9}' and b_order > 0 and no_roll!='${edit7}'`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres1 => {
                if (onres1.rows.length > 0) {
                    norr = onres1.rows[0].no_roll

                    querystr = `(SELECT no_lokasi,ppn.no_roll,kode_spk,  ppn.berat-IFNULL(SUM(pps.beratkeluar),0)-IFNULL(ppr.beratretur,0)-IFNULL(ppo.beratorder,0) AS berat,  
                    IF(( (IFNULL(ppg.jmlkeluar,0) = 0) AND (SUBSTR(ppn.no_roll,1,1) = 'R') AND (IFNULL(ppp.jmlpecahan,0) = 0)),'ROLLAN','KGAN') 
                    AS status_kain  FROM detail_penerimaanstok dpk JOIN perincian_penerimaanstok ppn ON dpk.no_detail=ppn.no_Detail
                    LEFT JOIN (SELECT no_roll,IFNULL(SUM(berat),0) AS beratkeluar FROM perincian_pengeluaranstok GROUP BY no_roll) AS pps ON pps.no_roll=ppn.no_roll
                    LEFT JOIN (SELECT no_roll,IFNULL(SUM(berat),0) AS beratretur FROM perincian_detailreturpenerimaanstok GROUP BY no_roll) AS ppr ON ppr.no_roll=ppn.no_roll  
                    LEFT JOIN (SELECT no_roll,IFNULL(COUNT(no_roll),0) AS jmlkeluar FROM perincian_pengeluaranstok GROUP BY no_roll) AS ppg ON ppg.no_roll=ppn.no_roll
                    LEFT JOIN (SELECT roll1 AS no_roll,IFNULL(COUNT(roll1),0) AS jmlpecahan FROM data_pecahroll GROUP BY roll1) AS ppp ON ppp.no_roll=ppn.no_roll 
                    LEFT JOIN (SELECT no_roll,IFNULL(SUM(berat),0) AS beratorder FROM perincian_order WHERE berat_ditimbang=0 GROUP BY no_roll) AS ppo ON ppo.no_roll=ppn.no_roll 
                    JOIN kain k USING(id_kain) JOIN warna w USING(id_Warna) WHERE no_lokasi!='BS' AND  no_lokasi!='SEGEL' AND  no_lokasi!='CACAT' 
                    AND no_lokasi!='PERBAIKAN' AND  no_lokasi!='TITIP' AND no_lokasi!='H' AND kode_spk='${k_spk}' AND ppn.no_roll!='${edit7}'
                    AND nama_kain='${kain2}' AND jenis_warna='${warna2}'  GROUP BY no_roll 
                    HAVING status_kain='KGAN' AND berat >='${parseFloat(edit9) - 0.05}' AND berat!=0  ORDER BY berat ASC LIMIT 100 )`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        qstok = onres.rows
                    })

                    querystr = `SELECT no_lokasi,ppn.no_roll,kode_spk,  ppn.berat-IFNULL(SUM(pps.beratkeluar),0)-IFNULL(ppr.beratretur,0)-IFNULL(ppo.beratorder,0) 
                    AS berat,  IF(( (IFNULL(ppg.jmlkeluar,0) = 0) AND (SUBSTR(ppn.no_roll,1,1) = 'R') AND (IFNULL(ppp.jmlpecahan,0) = 0)),'ROLLAN','KGAN') 
                    AS status_kain  FROM detail_penerimaanstok dpk JOIN perincian_penerimaanstok ppn ON dpk.no_detail=ppn.no_Detail
                    LEFT JOIN (SELECT no_roll,IFNULL(SUM(berat),0) AS beratkeluar FROM perincian_pengeluaranstok GROUP BY no_roll) AS pps ON pps.no_roll=ppn.no_roll
                    LEFT JOIN (SELECT no_roll,IFNULL(SUM(berat),0) AS beratretur FROM perincian_detailreturpenerimaanstok GROUP BY no_roll) AS ppr ON ppr.no_roll=ppn.no_roll   
                    LEFT JOIN (SELECT no_roll,IFNULL(COUNT(no_roll),0) AS jmlkeluar FROM perincian_pengeluaranstok GROUP BY no_roll) AS ppg ON ppg.no_roll=ppn.no_roll
                    LEFT JOIN (SELECT roll1 AS no_roll,IFNULL(COUNT(roll1),0) AS jmlpecahan FROM data_pecahroll GROUP BY roll1) AS ppp ON ppp.no_roll=ppn.no_roll    
                    LEFT JOIN (SELECT no_roll,IFNULL(SUM(berat), 0) AS beratorder FROM perincian_order JOIN detail_order dr USING(no_Detail) JOIN order_pembelian 
                    USING(no_order) WHERE status_order='SIAP KIRIM' OR status_order='MENUNGGU PICKING' OR status_order='SIAP CETAK FAKTUR SEMENTARA'  GROUP BY no_roll) 
                    AS ppo ON ppo.no_roll=ppn.no_roll JOIN kain k USING(id_kain) JOIN warna w USING(id_Warna)
                    WHERE no_lokasi!='BS' AND  no_lokasi!='SEGEL' AND  no_lokasi!='CACAT' AND no_lokasi!='PERBAIKAN' AND  no_lokasi!='TITIP' AND no_lokasi!='H' 
                    AND kode_spk='${k_spk}' AND ppn.no_roll='${norr}' AND SUBSTR(no_lokasi,1,2)!='B_' AND  nama_kain='${kain2}' AND jenis_warna='${warna2}'  GROUP BY no_roll
                    HAVING berat >0 AND status_kain='ROLLAN'  ORDER BY berat ASC;`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        qroll = onres.rows
                    })
                } else {
                    
                    querystr = `(SELECT no_lokasi,ppn.no_roll,kode_spk,  ppn.berat-IFNULL(SUM(pps.beratkeluar),0)-IFNULL(ppr.beratretur,0)-IFNULL(ppo.beratorder,0) AS berat,  
                    IF(( (IFNULL(ppg.jmlkeluar,0) = 0) AND (SUBSTR(ppn.no_roll,1,1) = 'R') AND (IFNULL(ppp.jmlpecahan,0) = 0)),'ROLLAN','KGAN') AS status_kain  
                    FROM detail_penerimaanstok dpk JOIN perincian_penerimaanstok ppn ON dpk.no_detail=ppn.no_Detail
                    LEFT JOIN (SELECT no_roll,IFNULL(SUM(berat),0) AS beratkeluar FROM perincian_pengeluaranstok GROUP BY no_roll) AS pps ON pps.no_roll=ppn.no_roll  
                    LEFT JOIN (SELECT no_roll,IFNULL(COUNT(no_roll),0) AS jmlkeluar FROM perincian_pengeluaranstok GROUP BY no_roll) AS ppg ON ppg.no_roll=ppn.no_roll
                    LEFT JOIN (SELECT roll1 AS no_roll,IFNULL(COUNT(roll1),0) AS jmlpecahan FROM data_pecahroll GROUP BY roll1) AS ppp ON ppp.no_roll=ppn.no_roll    
                    LEFT JOIN (SELECT no_roll,IFNULL(SUM(berat),0) AS beratorder FROM perincian_order WHERE berat_ditimbang=0 GROUP BY no_roll) AS ppo ON ppo.no_roll=ppn.no_roll 
                    JOIN kain k USING(id_kain) JOIN warna w USING(id_Warna)   WHERE  no_lokasi!='BS' AND  no_lokasi!='SEGEL' AND  no_lokasi!='CACAT' AND no_lokasi!='PERBAIKAN' 
                    AND  no_lokasi!='TITIP' AND no_lokasi!='H' AND kode_spk='${k_spk}' AND ppn.no_roll!='${edit7}' AND no_lokasi!='PERBAIKAN' AND no_lokasi!='TITIP'
                    AND nama_kain='${kain2}' AND jenis_warna='${warna2}'  GROUP BY no_roll
                    HAVING status_kain='KGAN' AND berat >='${parseFloat(edit9) - 0.05}' AND berat!=0  ORDER BY berat ASC LIMIT 100 );`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        qstok = onres.rows
                    })

                    querystr = `SELECT no_lokasi,ppn.no_roll,kode_spk,  ppn.berat-IFNULL(SUM(pps.beratkeluar),0)-IFNULL(ppr.beratretur,0)-IFNULL(ppo.beratorder,0) AS berat,  
                    IF(( (IFNULL(ppg.jmlkeluar,0) = 0) AND (SUBSTR(ppn.no_roll,1,1) = 'R') AND (IFNULL(ppp.jmlpecahan,0) = 0)),'ROLLAN','KGAN') AS status_kain  
                    FROM detail_penerimaanstok dpk JOIN perincian_penerimaanstok ppn ON dpk.no_detail=ppn.no_Detail
                    LEFT JOIN (SELECT no_roll,IFNULL(SUM(berat),0) AS beratkeluar FROM perincian_pengeluaranstok GROUP BY no_roll) AS pps ON pps.no_roll=ppn.no_roll  
                    LEFT JOIN (SELECT no_roll,IFNULL(SUM(berat),0) AS beratretur FROM perincian_detailreturpenerimaanstok GROUP BY no_roll) AS ppr ON ppr.no_roll=ppn.no_roll
                    LEFT JOIN (SELECT no_roll,IFNULL(COUNT(no_roll),0) AS jmlkeluar FROM perincian_pengeluaranstok GROUP BY no_roll) AS ppg ON ppg.no_roll=ppn.no_roll
                    LEFT JOIN (SELECT roll1 AS no_roll,IFNULL(COUNT(roll1),0) AS jmlpecahan FROM data_pecahroll GROUP BY roll1) AS ppp ON ppp.no_roll=ppn.no_roll
                    LEFT JOIN (SELECT no_roll,IFNULL(SUM(berat), 0) AS beratorder FROM perincian_order JOIN detail_order dr USING(no_Detail) JOIN order_pembelian USING(no_order) WHERE status_order='SIAP KIRIM'             
                    OR status_order='MENUNGGU PICKING' OR status_order='SIAP CETAK FAKTUR SEMENTARA'  GROUP BY no_roll) AS ppo ON ppo.no_roll=ppn.no_roll JOIN kain k USING(id_kain) JOIN warna w USING(id_Warna)
                    WHERE   no_lokasi!='BS' AND  no_lokasi!='SEGEL' AND no_lokasi!='CACAT' AND no_lokasi!='PERBAIKAN' AND  no_lokasi!='TITIP' AND no_lokasi!='H' AND kode_spk='${k_spk}' 
                    AND ppn.no_roll!='${edit7}' AND no_lokasi!='PERBAIKAN' AND SUBSTR(no_lokasi,1,2)!='B_' AND    no_lokasi!='TITIP' AND nama_kain='${kain2}' AND jenis_warna='${warna2}'  GROUP BY no_roll  
                    HAVING berat >0 AND status_kain='ROLLAN'  ORDER BY berat ASC LIMIT '${va_limit}';`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        qroll = onres.rows
                    })
                }
            })
            if (qstok.length > 0) {
                // do something
            } else {
                response.ok({'message': 'Stok untuk kain tersebut sudah habis'})
            }
        })

    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.Button41Click_updatekain = async (req, res) => {
    try {
        queryvalue = []
        let { vnodetailupdatekain, edit7, edit9 } = req.body
        let kain2, warna2, k_spk, va_limit, tipekn, norr, jmlstok, qstok, qroll
        
        querystr = `select jenis_kain,warna,kode_spk,tipe_kain from detail_order do join kain k on k.nama_kain=do.jenis_kain where no_detail='${vnodetailupdatekain}'`
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            kain2 = onres.rows[0].jenis_kain
            warna2 = onres.rows[0].warna
            k_spk = onres.rows[0].kode_spk
            tipekn = onres.rows[0].tipe_kain

            querystr = `SELECT  nama_kain,jenis_Warna, IFNULL(COUNT(vs.no_roll),0)-IFNULL(bk.jmlroll,0) AS stok_sementara 
            FROM v_stokglobal_transfer vs LEFT JOIN perincian_order po USING(no_roll)  
            LEFT JOIN (SELECT jenis_kain,warna,SUM(berat_ataujmlroll) AS jmlroll FROM order_pembelian JOIN detail_order USING(no_order) 
            LEFT JOIN perincian_order po USING(no_Detail) WHERE po.no_detail IS NULL AND (status_order = 'SIAP CETAK FAKTUR SEMENTARA' 
            OR status_order = 'MENUNGGU PICKING'  )  GROUP BY jenis_kain,warna ) AS bk 
            ON  CONCAT(bk.jenis_kain,bk.warna)=CONCAT(vs.nama_kain,vs.jenis_warna) WHERE po.no_roll IS NULL 
            AND  sts='ROLLAN'  AND nama_kain='${kain2}' AND jenis_warna='${warna2}' AND vs.no_lokasi!='H' 
            AND vs.no_lokasi!='TITIP' GROUP BY nama_kain,jenis_Warna HAVING stok_sementara > 0;`
            await tabel.queryDB(querystr, queryvalue).then(async onres1 => {
                if (onres1.rows.length > 0) {
                    jmlstok = onres1.rows[0].stok_sementara
                    va_limit = '100'

                    querystr = `SELECT no_lokasi,ppn.no_roll,kode_spk,gramasi,lebar,  ppn.berat-IFNULL(SUM(pps.beratkeluar),0)-IFNULL(ppr.beratretur,0)-IFNULL(ppo.beratorder,0) AS berat,  
                    IF(( (IFNULL(ppg.jmlkeluar,0) = 0) AND (SUBSTR(ppn.no_roll,1,1) = 'R') AND (IFNULL(ppp.jmlpecahan,0) = 0)),'ROLLAN','KGAN') AS status_kain  
                    FROM detail_penerimaanstok dpk JOIN perincian_penerimaanstok ppn ON dpk.no_detail=ppn.no_Detail
                    LEFT JOIN (SELECT no_roll,IFNULL(SUM(berat),0) AS beratkeluar FROM perincian_pengeluaranstok GROUP BY no_roll) AS pps ON pps.no_roll=ppn.no_roll  
                    LEFT JOIN (SELECT no_roll,IFNULL(SUM(berat),0) AS beratretur FROM perincian_detailreturpenerimaanstok GROUP BY no_roll) AS ppr ON ppr.no_roll=ppn.no_roll   
                    LEFT JOIN (SELECT no_roll,IFNULL(COUNT(no_roll),0) AS jmlkeluar FROM perincian_pengeluaranstok GROUP BY no_roll) AS ppg ON ppg.no_roll=ppn.no_roll  
                    LEFT JOIN (SELECT roll1 AS no_roll,IFNULL(COUNT(roll1),0) AS jmlpecahan FROM data_pecahroll GROUP BY roll1) AS ppp ON ppp.no_roll=ppn.no_roll    
                    LEFT JOIN (SELECT no_roll,IFNULL(SUM(berat),0) AS beratorder FROM perincian_order JOIN detail_order dr USING(no_Detail) JOIN order_pembelian o USING(no_order) 
                    WHERE  (status_order<>'SELESAI'  AND status_order<>'SELESAI FAKTUR') GROUP BY no_roll) AS ppo ON ppo.no_roll=ppn.no_roll 
                    JOIN kain k USING(id_kain) JOIN warna w USING(id_Warna)   WHERE   no_lokasi!='BS' AND  no_lokasi!='SEGEL' AND  no_lokasi!='CACAT' AND no_lokasi!='PERBAIKAN' 
                    AND  no_lokasi!='TITIP' AND no_lokasi!='H' AND ppn.no_roll!='${edit7}' AND no_lokasi!='PERBAIKAN' AND no_lokasi!='TITIP' AND nama_kain='${kain2}' AND jenis_warna='${warna2}'  GROUP BY no_roll
                    HAVING status_kain='KGAN' AND berat >= '${parseFloat(edit9) - 0.05}' AND berat!=0  ORDER BY berat ASC`
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        qstok = onres.rows
                    })

                    querystr = `SELECT no_lokasi,ppn.no_roll,kode_spk,gramasi,lebar,  ppn.berat-IFNULL(SUM(pps.beratkeluar),0)-IFNULL(ppr.beratretur,0)-IFNULL(ppo.beratorder,0) AS berat,  
                    IF(( (IFNULL(ppg.jmlkeluar,0) = 0) AND (SUBSTR(ppn.no_roll,1,1) = 'R') AND (IFNULL(ppp.jmlpecahan,0) = 0)),'ROLLAN','KGAN') AS status_kain  FROM detail_penerimaanstok dpk JOIN perincian_penerimaanstok ppn ON dpk.no_detail=ppn.no_Detail
                    LEFT JOIN (SELECT no_roll,IFNULL(SUM(berat),0) AS beratkeluar FROM perincian_pengeluaranstok GROUP BY no_roll) AS pps ON pps.no_roll=ppn.no_roll 
                    LEFT JOIN (SELECT no_roll,IFNULL(SUM(berat),0) AS beratretur FROM perincian_detailreturpenerimaanstok GROUP BY no_roll) AS ppr ON ppr.no_roll=ppn.no_roll   
                    LEFT JOIN (SELECT no_roll,IFNULL(COUNT(no_roll),0) AS jmlkeluar FROM perincian_pengeluaranstok GROUP BY no_roll) AS ppg ON ppg.no_roll=ppn.no_roll
                    LEFT JOIN (SELECT roll1 AS no_roll,IFNULL(COUNT(roll1),0) AS jmlpecahan FROM data_pecahroll GROUP BY roll1) AS ppp ON ppp.no_roll=ppn.no_roll    
                    LEFT JOIN (SELECT no_roll,IFNULL(SUM(berat), 0) AS beratorder FROM perincian_order JOIN detail_order dr USING(no_Detail) JOIN order_pembelian USING(no_order) WHERE status_order='SIAP KIRIM'
                    OR status_order='MENUNGGU PICKING' OR status_order='SIAP CETAK FAKTUR SEMENTARA'  GROUP BY no_roll) AS ppo ON ppo.no_roll=ppn.no_roll    JOIN kain k USING(id_kain) JOIN warna w USING(id_Warna)   
                    WHERE  no_lokasi!='BS' AND  no_lokasi!='SEGEL' AND  no_lokasi!='CACAT' AND no_lokasi!='PERBAIKAN' AND  no_lokasi!='TITIP' AND no_lokasi!='H'  AND no_lokasi!='PERBAIKAN' AND    no_lokasi!='TITIP' AND nama_kain='${kain2}' AND jenis_warna='${warna2}' GROUP BY no_roll
                    HAVING berat >0 AND status_kain='ROLLAN'  ORDER BY berat ASC  LIMIT '${va_limit}'`
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        qroll = onres.rows
                    })
                } else {
                    jmlstok = 0
                    
                    querystr = `SELECT no_lokasi,ppn.no_roll,kode_spk,gramasi,lebar,  ppn.berat-IFNULL(SUM(pps.beratkeluar),0)-IFNULL(ppr.beratretur,0)-IFNULL(ppo.beratorder,0) AS berat,
                    IF(( (IFNULL(ppg.jmlkeluar,0) = 0) AND (SUBSTR(ppn.no_roll,1,1) = 'R') AND (IFNULL(ppp.jmlpecahan,0) = 0)),'ROLLAN','KGAN') AS status_kain
                    FROM detail_penerimaanstok dpk JOIN perincian_penerimaanstok ppn ON dpk.no_detail=ppn.no_Detail
                    LEFT JOIN (SELECT no_roll,IFNULL(SUM(berat),0) AS beratkeluar FROM perincian_pengeluaranstok GROUP BY no_roll) AS pps ON pps.no_roll=ppn.no_roll
                    LEFT JOIN (SELECT no_roll,IFNULL(SUM(berat),0) AS beratretur FROM perincian_detailreturpenerimaanstok GROUP BY no_roll) AS ppr ON ppr.no_roll=ppn.no_roll
                    LEFT JOIN (SELECT no_roll,IFNULL(COUNT(no_roll),0) AS jmlkeluar FROM perincian_pengeluaranstok GROUP BY no_roll) AS ppg ON ppg.no_roll=ppn.no_roll
                    LEFT JOIN (SELECT roll1 AS no_roll,IFNULL(COUNT(roll1),0) AS jmlpecahan FROM data_pecahroll GROUP BY roll1) AS ppp ON ppp.no_roll=ppn.no_roll
                    LEFT JOIN (SELECT no_roll,IFNULL(SUM(berat),0) AS beratorder FROM perincian_order JOIN detail_order dr USING(no_Detail) JOIN order_pembelian o
                    USING(no_order) where  (status_order<>'SELESAI'  and status_order<>'SELESAI FAKTUR') GROUP BY no_roll) AS ppo ON ppo.no_roll=ppn.no_roll
                    JOIN kain k USING(id_kain) JOIN warna w USING(id_Warna)   WHERE   no_lokasi!='BS' AND  no_lokasi!='SEGEL' AND  no_lokasi!='CACAT'
                    AND no_lokasi!='PERBAIKAN' and  no_lokasi!='TITIP' and no_lokasi!='H' and ppn.no_roll!='${edit7}' and no_lokasi!='PERBAIKAN'
                    and no_lokasi!='TITIP' and nama_kain='${kain2}' and jenis_warna='${warna2}'  GROUP BY no_roll
                    HAVING status_kain='KGAN' and berat >= '${parseFloat(edit9) - 0.05}' and berat!=0  order by berat asc`
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        qstok = onres.rows
                    })
                }

                if (qstok.length > 0) {
                    // do something
                } else {
                    response.ok({'message': 'Stok untuk kain tersebut sudah habis'}, 200, res)
                }
            })
        })

    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.Button43Click_updatekain = async (req, res) => {
    try {
        let { vnodetailupdatekain,edit7,edit9 } = req.body
        let kain2, warna2, k_spk, va_limit, tipekn, norr, jmlstok, qstok, qroll

        querystr = `select jenis_kain,warna,kode_spk,tipe_kain from detail_order do join kain k on k.nama_kain=do.jenis_kain where no_detail='${vnodetailupdatekain}'`
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            kain2 = onres.rows[0].jenis_kain
            warna2 = onres.rows[0].warna
            k_spk = onres.rows[0].kode_spk
            tipekn = onres.rows[0].tipe_kain

            querystr = `SELECT  nama_kain,jenis_Warna,  IFNULL(COUNT(vs.no_roll),0)-IFNULL(bk.jmlroll,0) AS stok_sementara FROM v_stokglobal_transfer vs 
            LEFT JOIN perincian_order po USING(no_roll)  LEFT JOIN (SELECT jenis_kain,warna,SUM(berat_ataujmlroll) AS jmlroll 
            FROM order_pembelian JOIN detail_order USING(no_order) 
            LEFT JOIN perincian_order po USING(no_Detail) WHERE po.no_detail IS NULL AND (status_order = 'SIAP CETAK FAKTUR SEMENTARA' 
            OR status_order = 'MENUNGGU PICKING')  GROUP BY jenis_kain,warna ) AS bk ON 
            CONCAT(bk.jenis_kain,bk.warna)=CONCAT(vs.nama_kain,vs.jenis_warna) WHERE po.no_roll IS NULL
            AND  sts='ROLLAN'  AND nama_kain='${kain2}' AND jenis_warna='${warna2}' AND vs.no_lokasi!='H'
            AND vs.no_lokasi!='TITIP' GROUP BY nama_kain,jenis_Warna HAVING stok_sementara > 0;`
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows.length > 0) {
                    jmlstok = onres.rows[0].stok_sementara
                    va_limit = '150'
                } else {
                    jmlstok = 0
                    va_limit = '0'
                }
            })

            querystr = `(SELECT no_lokasi,ppn.no_roll,kode_spk,  ppn.berat-IFNULL(SUM(pps.beratkeluar),0)-IFNULL(ppr.beratretur,0)-
            IFNULL(ppo.beratorder,0) AS berat,  IF(( (IFNULL(ppg.jmlkeluar,0) = 0) AND (SUBSTR(ppn.no_roll,1,1) = 'R') 
            AND (IFNULL(ppp.jmlpecahan,0) = 0)),'ROLLAN','KGAN') AS status_kain  FROM detail_penerimaanstok dpk 
            JOIN perincian_penerimaanstok ppn ON dpk.no_detail=ppn.no_Detail
            LEFT JOIN (SELECT no_roll,IFNULL(SUM(berat),0) AS beratkeluar FROM perincian_pengeluaranstok GROUP BY no_roll) 
            AS pps ON pps.no_roll=ppn.no_roll  LEFT JOIN (SELECT no_roll,IFNULL(SUM(berat),0) AS beratretur 
            FROM perincian_detailreturpenerimaanstok GROUP BY no_roll) AS ppr ON ppr.no_roll=ppn.no_roll   LEFT JOIN
            (SELECT no_roll,IFNULL(COUNT(no_roll),0) AS jmlkeluar FROM perincian_pengeluaranstok GROUP BY no_roll) AS ppg ON ppg.no_roll=ppn.no_roll
            LEFT JOIN (SELECT roll1 AS no_roll,IFNULL(COUNT(roll1),0) AS jmlpecahan FROM data_pecahroll GROUP BY roll1) 
            AS ppp ON ppp.no_roll=ppn.no_roll 
            LEFT JOIN (SELECT no_roll,IFNULL(SUM(berat),0) AS beratorder FROM perincian_order WHERE berat_ditimbang=0 
            GROUP BY no_roll) AS ppo ON ppo.no_roll=ppn.no_roll     JOIN kain k USING(id_kain) JOIN warna w USING(id_Warna)   
            WHERE no_lokasi!='BS' AND  no_lokasi!='SEGEL' AND  no_lokasi!='CACAT' AND no_lokasi!='PERBAIKAN' AND  
            no_lokasi!='TITIP' AND no_lokasi!='H'  AND ppn.no_roll!='${edit7}' AND no_lokasi!='PERBAIKAN' 
            AND no_lokasi!='TITIP'  AND nama_kain='${kain2}' AND jenis_warna='${warna2}'  GROUP BY no_roll
            HAVING status_kain='KGAN' AND berat <= '${parseFloat(edit9)}' AND berat!=0  ORDER BY berat DESC LIMIT 100 )`
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                qstok = onres.rows
            })

            querystr = `SELECT no_lokasi,ppn.no_roll,kode_spk, ppn.berat-IFNULL(SUM(pps.beratkeluar),0)-IFNULL(ppr.beratretur,0)-
            IFNULL(ppo.beratorder,0) AS berat, IF(( (IFNULL(ppg.jmlkeluar,0) = 0) AND (SUBSTR(ppn.no_roll,1,1) = 'R') AND 
            (IFNULL(ppp.jmlpecahan,0) = 0)),'ROLLAN','KGAN') AS status_kain  FROM detail_penerimaanstok dpk 
            JOIN perincian_penerimaanstok ppn ON dpk.no_detail=ppn.no_Detail 
            LEFT JOIN (SELECT no_roll,IFNULL(SUM(berat),0) AS beratkeluar FROM perincian_pengeluaranstok GROUP BY no_roll) 
            AS pps ON pps.no_roll=ppn.no_roll LEFT JOIN (SELECT no_roll,IFNULL(SUM(berat),0) AS beratretur 
            FROM perincian_detailreturpenerimaanstok GROUP BY no_roll) AS ppr ON ppr.no_roll=ppn.no_roll   
            LEFT JOIN (SELECT no_roll,IFNULL(COUNT(no_roll),0) AS jmlkeluar FROM perincian_pengeluaranstok GROUP BY no_roll) AS ppg ON ppg.no_roll=ppn.no_roll
            LEFT JOIN (SELECT roll1 AS no_roll,IFNULL(COUNT(roll1),0) AS jmlpecahan FROM data_pecahroll GROUP BY roll1) AS ppp ON ppp.no_roll=ppn.no_roll    LEFT JOIN 
            (SELECT no_roll,IFNULL(SUM(berat), 0) AS beratorder FROM perincian_order JOIN detail_order dr USING(no_Detail) 
            JOIN order_pembelian USING(no_order) WHERE status_order='SIAP KIRIM' OR status_order='MENUNGGU PICKING' 
            OR status_order='SIAP CETAK FAKTUR SEMENTARA'  GROUP BY no_roll) AS ppo ON ppo.no_roll=ppn.no_roll 
            JOIN kain k USING(id_kain) JOIN warna w USING(id_Warna)
            WHERE  no_lokasi!='BS' AND  no_lokasi!='SEGEL' AND  no_lokasi!='CACAT' AND no_lokasi!='PERBAIKAN' 
            AND  no_lokasi!='TITIP' AND no_lokasi!='H' AND ppn.no_roll!='${edit7}' AND no_lokasi!='PERBAIKAN' 
            AND SUBSTR(no_lokasi,1,2)!='B_' AND no_lokasi!='TITIP' AND nama_kain='${kain2}' AND jenis_warna='${warna2}'  
            GROUP BY no_roll HAVING berat > 0 AND status_kain='ROLLAN'  ORDER BY berat ASC LIMIT 'va_limit'`
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                qroll = onres.rows
            })

            if (qstok.length > 0) {
                // do something
            } else {
                response.ok({'message':'Stok untuk kain tersebut sudah habis'}, 200, res)
            }
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}