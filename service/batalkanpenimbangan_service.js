const response = require('../res/res');
const tabel = require('../conn/tabel');

let querystr = '';
let queryvalue = '';

exports.batalkan_penimbangan = async (req, res) => {
    try {
        let { idkaryawan } = req.params

        querystr = `SELECT roll1 AS roll1,roll2 AS roll_pecahan,po.berat AS border, 
        po.berat_ditimbang AS b_timbang, no_order,dr.jenis_kain,dr.warna
        FROM detail_order dr JOIN group_penimbangan gp ON dr.no_Detail=gp.no_detailorder 
        JOIN perincian_order po ON po.no_detail=dr.no_Detail WHERE idkaryawan='${idkaryawan}' ORDER BY gp.no DESC;`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            response.ok(onres.rows, 200, res)
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.btn_batalkan_penimbangan = async (req, res) => {
    let { kode, no_roll, noroll2, berat1 } = req.body;
    let bplastik, nopengeluaran, nodetail, kodekoreksi;
    try {
        if ( kode == '' || kode == undefined) {
            response.ok({ "message": "Silahkan isi kode unik pada barcode!" }, 201, res)
        } else {
            querystr = `SELECT * FROM  perincian_penerimaanstok WHERE no_roll='${noroll2}' AND kode='${kode}'`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres =>{
                if (onres.rows.length == 0) {
                    response.ok({ "message": "Kode verifikasi atau no roll salah!" }, 201, res)
                } else {
                    querystr = `SELECT jenis_kain FROM detail_penerimaanstok JOIN perincian_penerimaanstok pp USING(no_Detail) WHERE no_roll='${no_roll}'`
                    queryvalue = []
                    await tabel.queryDB(querystr, queryvalue).then(async onres =>{
                        if (onres.rows[0].jenis_kain == 'BODY') {
                            bplastik = 0.16
                        } else {
                            bplastik = 0.12
                        }
                        console.log(bplastik);
                        querystr = `select * from perincian_pengeluaranstok where no_roll='${noroll2}' and berat > 0;`
                        queryvalue = []
                        await tabel.queryDB(querystr, queryvalue).then(async onres =>{
                            if (onres.rows.length > 0) {
                                response.ok({ "message": `Pecah roll tidak dapat dibatalkan karena sudah ada penjualan untuk no roll ${noroll2}` }, 201, res)
                            } else {
                                querystr = `START TRANSACTION`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then()
                                
                                querystr = `delete from perincian_penerimaanstok where no_roll='${noroll2}'`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then()

                                querystr = `delete from data_pecahroll where roll1='${no_roll}' and roll2='${noroll2}'`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then()
                                
                                querystr = `update perincian_penerimaanstok set berat=berat+'${berat1}' where no_roll='${no_roll}'`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then()
                                
                                querystr = `SELECT no_pengeluaran,no_detail FROM penjualan_kainstok pk JOIN detail_pengeluaranstok dp USING(no_pengeluaran) 
                                JOIN perincian_pengeluaranstok pps USING(no_detail) WHERE no_roll='${noroll2}' 
                                AND pk.penjualan_melalui='KOREKSI TIMBANGAN'`
                                queryvalue = []
                                await tabel.queryDB(querystr, queryvalue).then(async onres =>{
                                    if (onres.rows.length > 0) {
                                        nopengeluaran = onres.rows[0].no_pengeluaran
                                        nodetail = onres.rows[0].no_detail

                                        querystr = `delete from perincian_pengeluaranstok where no_roll='${noroll2}'`
                                        queryvalue = []
                                        await tabel.queryDB(querystr, queryvalue).then()
                                        
                                        querystr = `delete from detail_pengeluaranstok where no_detail='${nodetail}'`
                                        queryvalue = []
                                        await tabel.queryDB(querystr, queryvalue).then()

                                        querystr = `delete from penjualan_kainstok where no_pengeluaran='${nopengeluaran}'`
                                        queryvalue = []
                                        await tabel.queryDB(querystr, queryvalue).then()
                                        
                                        response.ok({ "message": "sukses"}, 200, res)
                                    } else {
                                        querystr = `SELECT no_pengeluaran,no_detail FROM penjualan_kainstok pk 
                                        JOIN detail_pengeluaranstok dp USING(no_pengeluaran) JOIN perincian_pengeluaranstok pps USING(no_detail) 
                                        WHERE no_roll='${no_roll}' AND pk.penjualan_melalui='UBAH NETTO'  AND tanggal=CURDATE()`
                                        queryvalue = []
                                        await tabel.queryDB(querystr, queryvalue).then(async onres =>{
                                            if (onres.rows.length > 0){
                                                nopengeluaran = onres.rows[0].no_pengeluaran

                                                querystr = `delete from penjualan_kainstok where no_pengeluaran='${nopengeluaran}'`
                                                queryvalue = []
                                                await tabel.queryDB(querystr, queryvalue).then()
                                                
                                                querystr = `UPDATE detail_order  SET dikerjakan='SIAP POTONG'
                                                WHERE no_detail=(SELECT no_detail FROM perincian_order WHERE no_roll='${noroll2}')`
                                                queryvalue = []
                                                await tabel.queryDB(querystr, queryvalue).then()
                                                
                                                querystr = `UPDATE perincian_order  SET berat_ditimbang=0,habis='',no_rolldisimpan='',no_roll='${no_roll}'  
                                                WHERE no_roll='${noroll2}'`
                                                queryvalue = []
                                                await tabel.queryDB(querystr, queryvalue).then()
                                                
                                                querystr = `UPDATE perincian_penerimaanstok SET STATUS=0  WHERE no_roll='${no_roll}';`
                                                queryvalue = []
                                                await tabel.queryDB(querystr, queryvalue).then()
                                                
                                                querystr = `SELECT * FROM group_penimbangan WHERE roll1='${no_roll}' AND roll2='${noroll2}';`
                                                queryvalue = []
                                                await tabel.queryDB(querystr, queryvalue).then(async onres =>{
                                                    kodekoreksi = onres.rows[0].kode_koreksi

                                                    if (kodekoreksi != '') {
                                                        querystr = `DELETE FROM penjualan_kainstok WHERE no_pengeluaran='${kodekoreksi}' AND penjualan_melalui='KOREKSI TIMBANGAN';`
                                                        queryvalue = []
                                                        await tabel.queryDB(querystr, queryvalue).then()
                                                    }
                                                })

                                                querystr = `delete from  group_penimbangan where roll1='${no_roll}' and roll2='${noroll2}'`
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
                    })
                }
                console.log(bplastik);
            })
        }
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.sp_btnbatalkanpenimbangan = async (req, res) => {
    try {
        let { kode, no_roll, noroll2, berat1 } = req.body;
        
        querystr = `CALL sp_batalkanpenimbangan('${kode}', '${no_roll}', '${noroll2}', '${berat1}');`
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            response.ok(onres.rows[0], 200, res)
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}