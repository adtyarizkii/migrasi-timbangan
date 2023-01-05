const response = require('../res/res');
const tabel = require('../conn/tabel');

let querystr = '';
let queryvalue = '';

exports.laporan_bs = async (req, res) => {
    let t2, wnotin, tipe, wmin, cekmasuk;
    let { hari , tipekain, idKaryawan, tgl } = req.body
    try {
        const now = new Date();
        const yyyy = now.getFullYear();
        let mm = now.getMonth() + 1;
        let dd = now.getDate();

    
        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;
        

        if (hari == 'SEKARANG') {
            t2 = `${yyyy}-${mm}-${dd}`
        } else {
            t2 = tgl
        }

        if (tipekain.toUpperCase().includes('1M') > 0 && tipekain.toUpperCase().includes('BS') > 0) {
            tipe = 'BS'
        } else if (tipekain.toUpperCase().includes('1M') > 0 && tipekain.toUpperCase().includes('SEGEL') > 0) {
            tipe = 'SEGEL'
        } else {
            tipe = tipekain
        }

        if (tipekain == 'SAMPLE') {
            wnotin = 'AND no_roll NOT IN (SELECT no_roll FROM n_detail_kainsample)'
        } else {
            wnotin = 'AND no_roll NOT IN (SELECT no_roll FROM n_detail_kainbssegel)'
        }

        if (tipekain.includes('>') > 0) {
            wmin = 'AND no_roll in (select no_roll from n_kainbssegel_meter WHERE berat >= berat_master)'
        } else if (tipekain.includes('<') > 0) {
            wmin = 'AND no_roll in (select no_roll from n_kainbssegel_meter WHERE berat < berat_master)'
        } else {
            wmin = 'AND no_roll not in (select no_roll from n_kainbssegel_meter)';
        }

        if (cekmasuk == 'SAMPLE') {
            querystr = `SELECT tgl_terima,pp.no_roll,berat_terima,status_kain,CONCAT(nama_kain,' - ',jenis_warna) AS kn FROM perincian_penerimaanstok pp JOIN kain_catatan kc USING(no_roll) 
            JOIN detail_penerimaanstok dp USING(no_Detail) JOIN kain k USING(id_kain) JOIN warna w USING(id_Warna) JOIN data_pecahroll ON pp.no_roll=roll2 
            WHERE LOWER(no_lokasi) ='sample' AND id_user='${idKaryawan}' AND status_kain='${tipe}'
            AND SUBSTR(no_roll,1,1)=(SELECT kode_roll FROM data_cabang LIMIT 1)  AND CAST(tgl_terima AS DATE) >= (SELECT DATA FROM konstanta WHERE jenis='TANGGAL BS SEGEL') AND CAST(tgl_terima AS DATE) < CURDATE() 
            AND kc.catatan <> 'SISA POTONG' ${wnotin} ${wmin}`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                response.ok(onres.rows, 200, res)
            })
        } else if (cekmasuk == 'BELUM') {
            querystr = `SELECT tgl_terima,pp.no_roll,berat_terima,status_kain,CONCAT(nama_kain,' - ',jenis_warna) AS kn FROM perincian_penerimaanstok pp JOIN kain_catatan kc USING(no_roll) 
            JOIN detail_penerimaanstok dp USING(no_Detail) JOIN kain k USING(id_kain) JOIN warna w USING(id_Warna) JOIN data_pecahroll ON pp.no_roll=roll2 
            WHERE LOWER(no_lokasi) !='bs-retur' AND id_user='${idKaryawan}' and status_kain='${tipe}'
            AND SUBSTR(no_roll,1,1)=(SELECT kode_roll FROM data_cabang LIMIT 1)  AND CAST(tgl_terima AS DATE) >= (SELECT DATA FROM konstanta WHERE jenis='TANGGAL BS SEGEL') AND CAST(tgl_terima AS DATE) < CURDATE() 
            AND kc.catatan <> 'SISA POTONG' ${wnotin} ${wmin}`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                response.ok(onres.rows, 200, res)
            })      
        } else {
                querystr = `SELECT tgl_terima,pp.no_roll,berat_terima,status_kain,CONCAT(nama_kain,' - ',jenis_warna) AS kn FROM perincian_penerimaanstok pp JOIN kain_catatan kc USING(no_roll) 
                JOIN detail_penerimaanstok dp USING(no_Detail) JOIN kain k USING(id_kain) JOIN warna w USING(id_Warna) JOIN data_pecahroll ON pp.no_roll=roll2 
                WHERE LOWER(no_lokasi) !='bs-retur' AND id_user='${idKaryawan}' AND status_kain='${tipe}' 
                AND SUBSTR(no_roll,1,1)=(SELECT kode_roll FROM data_cabang LIMIT 1)  AND DATE_FORMAT(tgl_terima,'%Y-%m-%d')='${t2}' AND kc.catatan <> 'SISA POTONG' ${wnotin} ${wmin}`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                response.ok(onres.rows, 200, res)
            })      
        }
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.btn_laporan_bs = async (req, res) => {
    try {
        let { thari, ttgl, ttipe, idKaryawan, vkode } = req.body;
        let tgl, total, nokain

        const now = new Date();
        const yyyy = now.getFullYear();
        let mm = now.getMonth() + 1;
        let dd = now.getDate();
        // console.log(`HARI INI ADALAH TANGGAL : ${yyyy}-${mm}-${dd}`);
    
        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;

        if (thari == 'SEKARANG') {
            tgl = `${yyyy}-${mm}-${dd}`
        } else {
            tgl = ttgl
        }

        querystr = `SELECT tgl_terima,pp.no_roll,berat_terima,status_kain,CONCAT(nama_kain,' - ',jenis_warna) AS kn FROM perincian_penerimaanstok pp JOIN kain_catatan USING(no_roll)
        JOIN detail_penerimaanstok dp USING(no_Detail) JOIN kain k USING(id_kain) JOIN warna w USING(id_Warna)
        WHERE status_kain!='BAGUS' AND SUBSTR(no_roll,1,1)='A'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length == 0) {
                response.ok({ "message": "Tidak ada data yang bisa di cetak" }, 201, res)
            } else {
                querystr = `START TRANSACTION`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then()

                total = onres.rows[0].berat_terima

                if (ttipe == 'SAMPLE') {
                    querystr = `INSERT INTO n_kainsample VALUES(0,'${tgl}','${total}','${idKaryawan}','${vkode}',NOW());`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then()

                    querystr = `select max(no_sample) as nokain from n_kainsample`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        nokain = onres.rows[0].nokain
                    })

                    querystr = `INSERT INTO n_detail_kainsample 
                    VALUES(0,'${nokain}','${onres.rows[0].no_roll}','${onres.rows[0].berat_terima}')`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then()

                    querystr = `COMMIT`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then()

                    querystr = `SELECT *,kode_sample AS kode,no_sample AS no,'SAMPLE' AS tipe,CONCAT(total,' Kg') AS brt,CONCAT('SM',YEAR(tanggal),SUBSTR(tanggal,6,2),SUBSTR(tanggal,9,2))AS kode2, 
                    IFNULL(CONCAT((SELECT berat FROM n_timbangulang_kainsample WHERE no_sample=nk.no_sample ORDER BY tanggal DESC LIMIT 1),' Kg'),CONCAT(total,' Kg')) AS timbang_ulang 
                    FROM n_kainsample nk JOIN user USING(id_user) WHERE kode_sample='${vkode}'`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        response.ok(onres.rows, 200, res)
                    })
                } else {
                    querystr = `insert into n_kainbssegel values(0,'${tgl}','${ttipe}','${total}','${idKaryawan}','${vkode}')`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then()

                    querystr = `select max(no) as nokain from n_kainbssegel`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        nokain = onres.rows[0].nokain
                    })

                    querystr = `INSERT INTO n_detail_kainbssegel 
                    VALUES(0,'${nokain}','${onres.rows[0].no_roll}','${onres.rows[0].berat_terima}')`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then()

                    querystr = `COMMIT`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then()

                    querystr = `SELECT *,CONCAT(total,' Kg') AS brt,CONCAT(IF(tipe = 'SEGEL','SG',tipe),YEAR(tanggal),SUBSTR(tanggal,6,2),SUBSTR(tanggal,9,2))AS kode2, 
                    IFNULL(CONCAT((SELECT berat FROM n_timbangulang_kainbssegel WHERE no_kainbssegel=nk.no ORDER BY tanggal DESC LIMIT 1),' Kg'),CONCAT(total,' Kg')) AS timbang_ulang 
                    FROM n_kainbssegel nk JOIN user USING(id_user) WHERE kode='${vkode}'`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        response.ok(onres.rows, 200, res)
                    })
                }
            }
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.cekkeluar_laporanbs = async (req,res) => {
    try {
        let { tipe, vkode } = req.body
        let no
        
        if (tipe == 'SAMPLE') {
            querystr = `SELECT no_sample FROM n_kainsample WHERE kode_sample='${vkode}';`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows.length != 0) {
                    no = onres.rows[0].no_sample

                    querystr = `select * from n_timbangulang_kainsample where no_sample='${no}';`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        if (onres.rows.length == 0) {
                            querystr = `delete from n_kainsample where no_sample='${no}';`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then()
                        }
                        response.ok(onres.rows, 200, res)
                    })
                }
            })
        } else {
            querystr = `SELECT no FROM n_kainbssegel WHERE kode='${vkode}';`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows.length != 0) {
                    no = onres.rows[0].no

                    querystr = `select * from n_timbangulang_kainbssegel where no_kainbssegel='${no}';`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        if (onres.rows.length == 0) {
                            querystr = `delete from n_kainbssegel where no='${no}';`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then()
                        }
                        response.ok(onres.rows, 200, res)
                    })
                }
            })
        }

    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.timbangulang_laporanbs = async (req, res) => {
    try {
        let { tipe, qcetakno, btimbang, vkode } = req.body

        querystr = `START TRANSACTION`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then()

        if (tipe == 'SAMPLE') {
            querystr = `INSERT INTO n_timbangulang_kainsample VALUES(0,'${qcetakno}',NOW(),'${btimbang}');`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then()

            querystr = `COMMIT`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then()

            querystr = `SELECT *,kode_sample AS kode,no_sample AS no,'SAMPLE' AS tipe,CONCAT(total,' Kg') AS brt,CONCAT('SM',YEAR(tanggal),SUBSTR(tanggal,6,2),SUBSTR(tanggal,9,2))AS kode2, 
            IFNULL(CONCAT((SELECT berat FROM n_timbangulang_kainsample WHERE no_sample=nk.no_sample ORDER BY tanggal DESC LIMIT 1),' Kg'),CONCAT(total,' Kg')) AS timbang_ulang 
            FROM n_kainsample nk JOIN user USING(id_user) WHERE kode_sample='${vkode}';`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then( async onres => {
                response.ok(onres.rows, 200, res)
            })
        } else {
            querystr = `INSERT INTO n_timbangulang_kainbssegel VALUES(0,'${qcetakno}',NOW(),'${btimbang}');`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then()

            querystr = `COMMIT`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then()

            querystr = `SELECT *,CONCAT(total,' Kg') AS brt,CONCAT(IF(tipe = 'SEGEL','SG',tipe),YEAR(tanggal),SUBSTR(tanggal,6,2),SUBSTR(tanggal,9,2))AS kode2, 
            IFNULL(CONCAT((SELECT berat FROM n_timbangulang_kainbssegel WHERE no_kainbssegel=nk.no ORDER BY tanggal DESC LIMIT 1),' Kg'),CONCAT(total,' Kg')) AS timbang_ulang 
            FROM n_kainbssegel nk JOIN user USING(id_user) WHERE kode='${vkode}';`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                response.ok(onres.rows, 200, res)
            })
        }
    } catch (error) {
        querystr = `ROLLBACK`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then()

        response.ok({ "message": "Gagal timbang ulang",  "Error": tabel.GetError(error) }, 300, res)
    }
}

exports.generatekode = async (req, res) => {
    try {
        const { tipe } = req.query
        querystr = `CALL generatekode(?,@out_msg);
        SELECT @out_msg AS pesan;`
        queryvalue = [tipe]
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