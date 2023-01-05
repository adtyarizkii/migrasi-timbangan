const response = require('../res/res');
const tabel = require('../conn/tabel');

let querystr = '';
let queryvalue = '';

exports.cetak_ulang_bssegel = async (req, res) => {
    try {
        querystr = `SELECT * FROM (SELECT no,tanggal,tipe,total,nk.id_user,CONCAT(total,' Kg') AS brt,nama, IFNULL(CONCAT((SELECT berat FROM n_timbangulang_kainbssegel WHERE no_kainbssegel=nk.no ORDER BY tanggal DESC LIMIT 1),' Kg'),CONCAT(total,' Kg')) AS timbang_ulang, kode,CONCAT(IF(tipe = 'SEGEL','SG',tipe),YEAR(tanggal),SUBSTR(tanggal,6,2),SUBSTR(tanggal,9,2))AS kode2 FROM n_kainbssegel nk JOIN user USING(id_user) UNION SELECT no_sample AS no,tanggal,'SAMPLE' tipe,total,nk.id_user,CONCAT(total,' Kg') AS brt,nama, IFNULL(CONCAT((SELECT berat FROM n_timbangulang_kainsample WHERE no_sample=nk.no_sample ORDER BY tanggal DESC LIMIT 1),' Kg'),CONCAT(total,' Kg')) AS timbang_ulang, kode_sample AS kode,CONCAT('SM',YEAR(tanggal),SUBSTR(tanggal,6,2),SUBSTR(tanggal,9,2))AS kode2 FROM n_kainsample nk JOIN user USING(id_user)) AS v`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length == 0) {
                response.ok({ "message": "Tidak ada data yang bisa di print ulang!" }, 201, res)
            } else {
                response.ok(onres.rows, 200, res)
            }
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.datarefresh_tcari = async (req, res) => {
    try {
        let { tcari } = req.body
        let uniquery, qcetak

        if (tcari == '' || tcari == undefined) {

            querystr = `SELECT  no ,tanggal,tipe,total,nk.id_user,nama,CONCAT(total,' Kg') AS brt,kode, 
            (SELECT berat FROM n_timbangulang_kainbssegel WHERE no_kainbssegel=nk.no ORDER BY tanggal DESC LIMIT 1) AS timbang_ulang    
             FROM n_kainbssegel nk JOIN  user  USING(id_user)                                                                                                                               
             UNION                                                                                                                   
             SELECT no_sample AS  no ,tanggal,'SAMPLE' AS tipe,total,nk.id_user,nama,CONCAT(total,' Kg') AS brt,kode_sample AS kode,  
            (SELECT berat FROM n_timbangulang_kainsample WHERE no_sample=nk.no_sample ORDER BY tanggal DESC LIMIT 1) AS timbang_ulang 
            FROM n_kainsample nk JOIN  user  USING(id_user)          
            ORDER BY tanggal DESC LIMIT 100;`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                uniquery = onres.rows
            })

            querystr = `SELECT * FROM (      
                SELECT  no ,tanggal,tipe,total,nk.id_user,CONCAT(total,' Kg') AS brt,nama,  
                IFNULL(CONCAT((SELECT berat FROM n_timbangulang_kainbssegel WHERE no_kainbssegel=nk.no ORDER BY tanggal DESC LIMIT 1),' Kg'),CONCAT(total,' Kg')) AS timbang_ulang, 
                kode,CONCAT(IF(tipe = 'SEGEL','SG',tipe),YEAR(tanggal),SUBSTR(tanggal,6,2),SUBSTR(tanggal,9,2))AS kode2                                       
                 FROM n_kainbssegel nk JOIN  user  USING(id_user) WHERE tanggal >= DATE_ADD(CURDATE(), INTERVAL - 1 MONTH)                                               
                UNION                                                                                                                                                         
                SELECT no_sample AS  no ,tanggal,'SAMPLE' tipe,total,nk.id_user,CONCAT(total,' Kg') AS brt,nama,                                                              
                IFNULL(CONCAT((SELECT berat FROM n_timbangulang_kainsample WHERE no_sample=nk.no_sample ORDER BY tanggal DESC LIMIT 1),' Kg'),CONCAT(total,' Kg')) AS timbang_ulang,  
                kode_sample AS kode,CONCAT('SM',YEAR(tanggal),SUBSTR(tanggal,6,2),SUBSTR(tanggal,9,2))AS kode2                                                                
                 FROM n_kainsample nk JOIN  user  USING(id_user) WHERE tanggal >= DATE_ADD(CURDATE(), INTERVAL - 1 MONTH) ) AS v                                       
                 ORDER BY tanggal DESC LIMIT 100`
            queryvalue = []
            await tabel.queryDB(querystr,queryvalue).then(async onres => {
                qcetak = onres.rows
            })

            response.ok({'UniQuery1': uniquery, 'qcetak': qcetak}, 200, res)
        } else {

            querystr = `SELECT  no ,tanggal,tipe,total,nk.id_user,nama,CONCAT(total,' Kg') AS brt,kode,
            (SELECT berat FROM n_timbangulang_kainbssegel WHERE no_kainbssegel=nk.no ORDER BY tanggal DESC LIMIT 1) AS timbang_ulang
             FROM n_kainbssegel nk JOIN  user  USING(id_user)                                                               
             WHERE kode ='${tcari}'                                                        
             UNION
             SELECT no_sample AS  no ,tanggal,'SAMPLE' AS tipe,total,nk.id_user,nama,CONCAT(total,' Kg') AS brt,kode_sample AS kode,
            (SELECT berat FROM n_timbangulang_kainsample WHERE no_sample=nk.no_sample ORDER BY tanggal DESC LIMIT 1) AS timbang_ulang 
            FROM n_kainsample nk JOIN  user  USING(id_user)    
             WHERE kode_sample ='${tcari}'  
            ORDER BY tanggal DESC LIMIT 100`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                uniquery = onres.rows
            })

            querystr = `SELECT * FROM (      
                SELECT no,tanggal,tipe,total,nk.id_user,CONCAT(total,' Kg') AS brt,nama,  
                IFNULL(CONCAT((SELECT berat FROM n_timbangulang_kainbssegel WHERE no_kainbssegel=nk.no ORDER BY tanggal DESC LIMIT 1),' Kg'),CONCAT(total,' Kg')) AS timbang_ulang, 
                kode,CONCAT(IF(tipe = 'SEGEL','SG',tipe),YEAR(tanggal),SUBSTR(tanggal,6,2),SUBSTR(tanggal,9,2))AS kode2                                                          
                 FROM n_kainbssegel nk JOIN user USING(id_user) WHERE kode ='${tcari}'                                               
                UNION                                                                                                                                                         
                SELECT no_sample AS no,tanggal,'SAMPLE' tipe,total,nk.id_user,CONCAT(total,' Kg') AS brt,nama,                                                              
                IFNULL(CONCAT((SELECT berat FROM n_timbangulang_kainsample WHERE no_sample=nk.no_sample ORDER BY tanggal DESC LIMIT 1),' Kg'),CONCAT(total,' Kg')) AS timbang_ulang,  
                kode_sample AS kode,CONCAT('SM',YEAR(tanggal),SUBSTR(tanggal,6,2),SUBSTR(tanggal,9,2))AS kode2                                                                
                 FROM n_kainsample nk JOIN user USING(id_user) WHERE kode_sample ='${tcari}' ) AS v                                       
                 ORDER BY tanggal DESC LIMIT 100`
            queryvalue = []
            await tabel.queryDB(querystr,queryvalue).then(async onres => {
                qcetak = onres.rows
            })

            response.ok({'UniQuery1': uniquery, 'qcetak': qcetak}, 200, res)
        }

    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.frxReport1GetValue = async (req, res) => {
    try {
        let { v_nodetail } = req.body
        let varname, value, jmltotal, jmldari, hasil
        
        querystr = `SELECT COUNT(no_detail) AS jml  FROM detail_order WHERE jenis_quantity='KGAN' AND no_order=(SELECT no_order FROM detail_order WHERE no_detail='${v_nodetail}');`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            jmltotal = onres.rows[0].jml
        })

        querystr = `SELECT COUNT(no_detail) AS jml  FROM detail_order  WHERE jenis_quantity='KGAN' AND dikerjakan='SIAP KIRIM' AND no_order=(SELECT no_order FROM detail_order WHERE no_detail='${v_nodetail}');`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            jmldari = onres.rows[0].jml
        })

        hasil = `${jmldari} Dari ${jmltotal}`

        if (varname == 'urutan') {
            value = hasil
        }

        response.ok({'message': varname, value, jmltotal, jmldari, hasil }, 200, res)
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}