const response = require('../res/res');
const tabel = require('../conn/tabel');
const { getDataKonstanta } = require('./lib')

let querystr = '';
let queryvalue = '';

async function data_antrian(params) {
    return new Promise(async (resolve, reject) => {
        try {
            querystr = `SELECT va.*,IF((SELECT COUNT(no_roll) AS jml FROM detail_order JOIN perincian_order pr USING(no_Detail) 
        WHERE jenis_quantity='KGAN' AND pr.status=0 AND no_order=va.no_order)=0,'KOMPLIT', IF((SELECT COUNT(no_roll) AS jml FROM detail_order JOIN perincian_order pr USING(no_Detail) 
        WHERE jenis_quantity='KGAN' AND pr.status=1 AND no_order=va.no_order)>0,'PROSES','')) AS statusambil 
        FROM v_antrianpenimbanganfix va LEFT JOIN (SELECT no_order, COUNT(no_roll) AS jmlsisapotong FROM detail_order JOIN perincian_order pr USING(no_Detail)  
        WHERE jenis_quantity='KGAN' AND pr.status=1 AND berat_ditimbang=0 GROUP BY no_order ) AS p ON va.no_order=p.no_order `
            if (params && params != '') {
                let querystrr = ''
                querystrr = `select no_roll from perincian_penerimaanstok where no_roll='${params}'`
                await tabel.queryDB(querystrr, queryvalue).then(async onres1 => {
                    if (onres1.rows.length == 0) {
                        querystr = querystr + `WHERE nama LIKE '%${params}%'`
                    } else {
                        querystr = `SELECT *, IF((SELECT COUNT(no_roll) AS jml FROM detail_order d JOIN perincian_order pr USING(no_Detail)  WHERE jenis_quantity='KGAN' AND pr.status=0 AND no_order=va.no_order)=0,'KOMPLIT',      
                        IF((SELECT COUNT(no_roll) AS jml FROM detail_order JOIN perincian_order pr USING(no_Detail) WHERE jenis_quantity='KGAN' AND pr.status=1 AND no_order=va.no_order)>0,'PROSES','')) AS statusambil 
                        FROM v_antrianpenimbanganfix va LEFT JOIN (SELECT no_order, COUNT(no_roll) AS jmlsisapotong FROM detail_order JOIN perincian_order pr USING(no_Detail) WHERE jenis_quantity='KGAN' AND pr.status=1 AND berat_ditimbang=0 GROUP BY no_order )
                        AS p ON va.no_order=p.no_order WHERE va.no_order IN (SELECT no_order FROM detail_order JOIN perincian_order USING (no_detail) `
                        querystr = querystr + `WHERE no_roll='${params}')`
                    }
                    // console.log(querystr);
                })
            }
            queryvalue = []
            const data = await tabel.queryDB(querystr, queryvalue).then(onres => onres.rows)
            resolve(data)
        } catch (e) {
            reject(e)
        }
    })
}

async function getDataSampleBSSEGELBelumSelesai(props) {
    return new Promise(async (resolve, reject) => {
        try {
            let message = ``, cekmasuk = ``
            querystr = `SELECT tgl_terima,pp.no_roll,berat_terima,status_kain,CONCAT(nama_kain,' - ',jenis_warna) AS kn FROM perincian_penerimaanstok pp JOIN kain_catatan kc USING(no_roll)
            JOIN detail_penerimaanstok dp USING(no_Detail) JOIN kain k USING(id_kain) JOIN warna w USING(id_Warna) JOIN data_pecahroll ON pp.no_roll=roll2 
            WHERE LOWER(no_lokasi) !='bs-retur' AND LOWER(no_lokasi) !='sample' AND  id_user='${props.idkaryawan}' 
            AND SUBSTR(no_roll,1,1)=(SELECT kode_roll FROM data_cabang LIMIT 1)  AND CAST(tgl_terima AS DATE)=CURDATE() AND kc.catatan <> 'SISA POTONG' AND no_roll NOT IN (SELECT no_roll FROM n_detail_kainbssegel);`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows.length > 0) {
                    message = `Silahkan timbang ulang kain bs segel terlebih dahulu!`
                    cekmasuk = ''
                } else {
                    querystr = `SELECT tgl_terima,pp.no_roll,berat_terima,status_kain,CONCAT(nama_kain,' - ',jenis_warna) AS kn FROM perincian_penerimaanstok pp JOIN kain_catatan kc USING(no_roll)
                    JOIN detail_penerimaanstok dp USING(no_Detail) JOIN kain k USING(id_kain) JOIN warna w USING(id_Warna) JOIN data_pecahroll ON pp.no_roll=roll2 
                    WHERE  LOWER(no_lokasi) ='sample' AND  id_user='${props.idkaryawan}'
                    AND SUBSTR(no_roll,1,1)=(SELECT kode_roll FROM data_cabang LIMIT 1)  AND CAST(tgl_terima AS DATE)=CURDATE() AND kc.catatan <> 'SISA POTONG' AND no_roll NOT IN (SELECT no_roll FROM n_detail_kainsample);`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        if (onres.rows.length > 0) {
                            message = `Silahkan timbang ulang kain sample terlebih dahulu!`
                            cekmasuk = 'sample'
                        }
                    })
                }
            })

            resolve({ message, cekmasuk })
        } catch (e) {
            reject(e)
        }
    })
}

exports.antrian_penimbangan = async (req, res) => {
    try {
        const data = await data_antrian()

        response.ok(data, 200, res)
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.search_antrian_penimbangan = async (req, res) => {
    let { search } = req.params;
    let no_order;
    try {
        const data = await data_antrian(search)
        if (data.length == 1) {
            no_order = data[0].no_order
            querystr = `SELECT nama FROM a_hold_order LEFT JOIN user USING(id_user) WHERE no_order='${no_order}';`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue)
                .then(async onres => {
                    if (onres.rows.length != 0) {
                        response.ok({ "message": `Order ${no_order} sedang di edit oleh Admin ${onres.rows[0].nama}` }, 201, res)
                    } else {
                        response.ok(data, 200, res)
                    }
                })
        } else if (data.length > 1) {
            // setfocus
            response.ok(data, 200, res)
        } else {
            response.ok({ "message": "Kain tersebut tidak terdaftar di list order mana pun" }, 201, res)
        }
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.antrian_penimbangan_qdata = async (req, res) => {
    try {
        querystr = `SELECT * FROM v_penimbangan2 ORDER BY berat_ditimbang ASC;`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue)
            .then(async onres => {
                response.ok(onres.rows, 200, res)
            })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}


exports.form_show = async (req, res) => {
    try {
        const vip = req.body.vip || req.socket.remoteAddress.split(':')[3]
        console.log(vip)
        let videntiktimbang, vnilaiidentiktimbang, vmaxLoopKarungBSSEGEL, vnilaiIdentikTimbangUlang, vidtimbangan, vtimbangan

        // videntiktimbang = parseInt(await getDataKonstanta({ "jenis": "IDENTIK TIMBANG" })) || 10
        // vnilaiidentiktimbang = parseFloat(await getDataKonstanta({ "jenis": "NILAI IDENTIK TIMBANG" })) || 0.05
        // vmaxLoopKarungBSSEGEL = parseInt(await getDataKonstanta({ "jenis": "MAX LOOP KARUNG BS SEGEL" })) || 10
        // vnilaiIdentikTimbangUlang = parseFloat(await getDataKonstanta({ "jenis": "NILAI IDENTIK TIMBANG ULANG" })) || 10

        // querystr = `select data from konstanta where jenis='IDENTIK TIMBANG';`
        // queryvalue = []
        // await tabel.queryDB(querystr, queryvalue)
        //     .then(async onres => {
        //         if (onres.rows.length == 0) {
        //             videntiktimbang = 10
        //         } else {
        //             videntiktimbang = parseInt(onres.rows[0].data)
        //         }
        //     })

        // querystr = `select data from konstanta where jenis='NILAI IDENTIK TIMBANG';`
        // queryvalue = []
        // await tabel.queryDB(querystr, queryvalue).then(async onres => {
        //     if (onres.rows.length == 0) {
        //         vnilaiidentiktimbang = 0.05
        //     } else {
        //         vnilaiidentiktimbang = parseFloat(onres.rows[0].data)
        //     }
        // })

        // querystr = `select data from konstanta where jenis='MAX LOOP KARUNG BS SEGEL';`
        // queryvalue = []
        // await tabel.queryDB(querystr, queryvalue).then(async onres => {
        //     if (onres.rows.length == 0) {
        //         vmaxLoopKarungBSSEGEL = 10
        //     } else {
        //         vmaxLoopKarungBSSEGEL = parseInt(onres.rows[0].data)
        //     }
        // })

        // querystr = `select data from konstanta where jenis='NILAI IDENTIK TIMBANG ULANG';`
        // queryvalue = []
        // await tabel.queryDB(querystr, queryvalue).then(async onres => {
        //     if (onres.rows.length == 0) {
        //         vnilaiIdentikTimbangUlang = 10
        //     } else {
        //         vnilaiIdentikTimbangUlang = parseFloat(onres.rows[0].data)
        //     }
        // })

        const promGetDataKonstantaIdentikTimbang = () => {
            return new Promise(async (resolve, reject) => {
                try {
                    videntiktimbang = parseInt(await getDataKonstanta({ "jenis": "IDENTIK TIMBANG" })) || 10
                    resolve("ok")
                } catch (e) {
                    reject(e)
                }
            })
        }
        const promGetDataKonstantaNilaiIdentikTimbang = () => {
            return new Promise(async (resolve, reject) => {
                try {
                    vnilaiidentiktimbang = parseFloat(await getDataKonstanta({ "jenis": "NILAI IDENTIK TIMBANG" })) || 0.05
                    resolve("ok")
                } catch (e) {
                    reject(e)
                }
            })
        }
        const promGetDataKonstantaMaxLoopKarungBSSEGEL = () => {
            return new Promise(async (resolve, reject) => {
                try {
                    vmaxLoopKarungBSSEGEL = parseInt(await getDataKonstanta({ "jenis": "MAX LOOP KARUNG BS SEGEL" })) || 10
                    resolve("ok")
                } catch (e) {
                    reject(e)
                }
            })
        }
        const promGetDataKonstantaNilaiIdentikTimbangUlang = () => {
            return new Promise(async (resolve, reject) => {
                try {
                    vnilaiIdentikTimbangUlang = parseFloat(await getDataKonstanta({ "jenis": "NILAI IDENTIK TIMBANG ULANG" })) || 10
                    resolve("ok")
                } catch (e) {
                    reject(e)
                }
            })
        }

        let respon = ``
        const promCekKalibrasi = () => {
            return new Promise(async (resolve, reject) => {
                try {
                    querystr = `SELECT id_timbangan,timbangan FROM n_master_penimbangan WHERE is_active=1 AND ip_address='${vip}';`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async onres => {
                        if (onres.rows.length > 0) {
                            vidtimbangan = onres.rows[0].id_timbangan
                            vtimbangan = onres.rows[0].timbangan

                            querystr = `SELECT id_timbangan FROM n_kalibrasi_penimbangan WHERE id_timbangan='${vidtimbangan}'
                AND DATE(tanggal) >= DATE_ADD(CURDATE(),INTERVAL - IFNULL((SELECT DATA FROM konstanta WHERE jenis='INTERVAL KALIBRASI TIMBANGAN'),7) DAY);`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                                if (onres.rows.length == 0) {
                                    respon = `Timbangan ${vtimbangan} belum dikalibrasi, silahkan lakukan kalibrasi timbangan!`
                                }
                            })
                        }
                    })
                    resolve("ok")
                } catch (e) {
                    reject(e)
                }
            })
        }

        await Promise.all([
            promGetDataKonstantaIdentikTimbang(),
            promGetDataKonstantaNilaiIdentikTimbang(),
            promGetDataKonstantaMaxLoopKarungBSSEGEL(),
            promGetDataKonstantaNilaiIdentikTimbangUlang(),
            promCekKalibrasi(),
        ])

        response.ok({ 'message': respon, videntiktimbang, vnilaiidentiktimbang, vnilaiIdentikTimbangUlang, vmaxLoopKarungBSSEGEL }, 200, res)
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.form_close = async (req, res) => {
    try {
        const { idkaryawan } = req.params
        // let cekmasuk = ''

        // querystr = `SELECT tgl_terima,pp.no_roll,berat_terima,status_kain,CONCAT(nama_kain,' - ',jenis_warna) AS kn FROM perincian_penerimaanstok pp JOIN kain_catatan kc USING(no_roll)
        // JOIN detail_penerimaanstok dp USING(no_Detail) JOIN kain k USING(id_kain) JOIN warna w USING(id_Warna) JOIN data_pecahroll ON pp.no_roll=roll2 
        // WHERE LOWER(no_lokasi) !='bs-retur' AND LOWER(no_lokasi) !='sample' AND  id_user='${idkaryawan}' 
        // AND SUBSTR(no_roll,1,1)=(SELECT kode_roll FROM data_cabang LIMIT 1)  AND CAST(tgl_terima AS DATE)=CURDATE() AND kc.catatan <> 'SISA POTONG' AND no_roll NOT IN (SELECT no_roll FROM n_detail_kainbssegel);`
        // queryvalue = []
        // await tabel.queryDB(querystr, queryvalue).then(async onres => {
        //     let respon = ``
        //     if (onres.rows.length > 0) {
        //         respon = `Silahkan timbang ulang kain bs segel terlebih dahulu!`
        //         cekmasuk = ''
        //     }
        //     response.ok({ 'message': respon }, 201, res)
        // })

        // querystr = `SELECT tgl_terima,pp.no_roll,berat_terima,status_kain,CONCAT(nama_kain,' - ',jenis_warna) AS kn FROM perincian_penerimaanstok pp JOIN kain_catatan kc USING(no_roll)
        // JOIN detail_penerimaanstok dp USING(no_Detail) JOIN kain k USING(id_kain) JOIN warna w USING(id_Warna) JOIN data_pecahroll ON pp.no_roll=roll2 
        // WHERE  LOWER(no_lokasi) ='sample' AND  id_user='${idkaryawan}'
        // AND SUBSTR(no_roll,1,1)=(SELECT kode_roll FROM data_cabang LIMIT 1)  AND CAST(tgl_terima AS DATE)=CURDATE() AND kc.catatan <> 'SISA POTONG' AND no_roll NOT IN (SELECT no_roll FROM n_detail_kainsample);`
        // queryvalue = []
        // await tabel.queryDB(querystr, queryvalue).then(async onres => {
        //     let respon = ``
        //     if (onres.rows.length > 0) {
        //         respon = `Silahkan timbang ulang kain sample terlebih dahulu!`
        //         cekmasuk = 'sample'
        //     }
        //     response.ok({ 'message': respon }, 201, res)
        // })

        const data = await getDataSampleBSSEGELBelumSelesai(idkaryawan)
        let status = data.message != '' ? 201 : 200

        response.ok({ 'message': data.message, 'cekmasuk': data.cekmasuk }, status, res)
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.btnlogout = async (req, res) => {
    try {
        let { idkaryawan } = req.params

        querystr = `UPDATE user SET status_login='FREE',ip_addres='' WHERE id_user='${idkaryawan}';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async function() { } )

        querystr = `UPDATE data_printer SET id_karyawan=0 WHERE id_karyawan='${idkaryawan}';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async function() { })

        response.ok({ "message": "sukses" }, 200, res)
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

async function pilihpenimbangan(masuklewat, noorder, idkaryawan) {
    return new Promise(async (resolve, reject) => {
        try {
            querystr = `SELECT * FROM v_antrianpenimbanganfix WHERE no_order='${noorder}';`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                let nama = ''
                if (onres.rows.length != 0) {
                    nama = onres.rows[0].karyawan
                }

                if (nama != '' && nama != idkaryawan) {
                    
                }
            })
            const data = await tabel.queryDB(querystr, queryvalue).then(onres => onres.rows)
            resolve(data)
        } catch (e) {
            reject(e)
        }
    })
}

exports.pilih_penimbangan = async (req, res) => {
    try {
        let { noorder } = req.params
        let nama, kn, wr, v_namakaryawan

        querystr = `SELECT *,
        IF((SELECT COUNT(no_roll) AS jml FROM detail_order JOIN perincian_order pr USING(no_Detail) WHERE jenis_quantity='KGAN' AND pr.status=0 AND no_order=va.no_order)=0,'KOMPLIT',
        IF((SELECT COUNT(no_roll) AS jml FROM detail_order JOIN perincian_order pr USING(no_Detail) WHERE jenis_quantity='KGAN' AND pr.status=1 AND no_order=va.no_order)>0,'PROSES','')) AS statusambil
        FROM v_antrianpenimbanganfix va 
        LEFT JOIN
        (SELECT no_order, COUNT(no_roll) AS jmlsisapotong FROM detail_order JOIN perincian_order pr USING(no_Detail) WHERE jenis_quantity='KGAN' AND pr.status=1 AND berat_ditimbang=0 GROUP BY no_order )
        AS p ON va.no_order=p.no_order`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            // let respon = ``
            if (onres.rows.length == 0) {
                // respon = `Tidak ada data penimbangan`
                response.ok({ 'message': `Tidak ada data penimbangan` }, 201, res)
            }
            // response.ok({ 'message': respon }, 201, res)
        })

        querystr = `SELECT * FROM v_antrianpenimbanganfix WHERE no_order='${noorder}';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length != 0) {
                nama = onres.rows[0].karyawan
            }

            if (nama != '' && nama != v_namakaryawan) {
                response.ok({ 'message': `Order ${noorder} sedang di kerjakan oleh : ${nama} silahkan pilih order yang masih kosong` }, 201, res)
            } else {

                // querystr = `SELECT vp.*, vs.berat_asal,IFNULL(a.keterangan,'') AS keterangan FROM v_penimbangan2 vp JOIN v_stokglobal vs USING(no_roll) 
                // LEFT JOIN a_batalhasiltimbang a ON no_roll=no_roll_asal
                // ORDER BY berat_ditimbang ASC;`
                // queryvalue = []
                // await tabel.queryDB(querystr, queryvalue).then(async onres => {
                //     if (onres.rows.length == 0) {
                        querystr = `select * from detail_order where dikerjakan='SIAP POTONG' and no_order='${noorder}';`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then(async onres => {
                            console.log(onres.rows.length);
                            console.log(onres.rows);
                            let respon = 'RES111'
                            if (onres.rows.length > 0) {
                                kn = onres.rows[0].jenis_kain
                                wr = onres.rows[0].warna
                                respon = `Stok untuk kain ${kn} warna ${wr} menurut stok sudah habis silahkan hub admin untuk edit order!`
                            }
                            response.ok({ 'message': respon }, 201, res)
                        })
                    // }
                // })

                querystr = `SELECT nama FROM a_hold_order LEFT JOIN user USING(id_user) WHERE no_order='${noorder}';`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    let respon = 'RES222'
                    if (onres.rows.length != 0) {
                        respon = `Order ${noorder} sedang di edit oleh Admin ${onres.rows[0].nama}`
                    }
                    response.ok({ 'message': respon }, 201, res)
                })
            }
        })

    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.grid5keydown = async (req, res) => {
    try {
        let { noorder } = req.params
        let vnoorder, llokasitujuan, vlokasidibawah1kg

        querystr = `SELECT no_order FROM a_orderdibawah1kg WHERE no_order='${noorder}';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length > 0) {
                querystr = `select no_lokasi from n_lokasiorder_dibawah1kg where no_order='${noorder}';`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    if (onres.rows.length == 0) {
                        vnoorder = noorder
                        llokasitujuan = ''
                        vlokasidibawah1kg = ''
                    } else {
                        llokasitujuan = `Lokasi Tujuan : ${onres.rows[0].no_lokasi}`
                        vlokasidibawah1kg = onres.rows[0].no_lokasi
                        // pilih_penimbangan('')
                    }
                })
            } else {
                // pilih_penimbangan('')
            }
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}
