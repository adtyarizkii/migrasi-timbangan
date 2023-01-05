'use strict';
const response = require('../res/res')
const tabel = require('../conn/tabel');

let querystr = '';
let queryvalue = '';


exports.list_batal_penimbangan = async (req, res) => {
    try {
        querystr = `SELECT p.no, no_roll,nama_kain,jenis_warna FROM pembatalan_penimbangan p JOIN perincian_penerimaanstok USING(no_roll) JOIN detail_penerimaanstok USING(no_detail)
        JOIN kain USING(id_kain) JOIN warna USING(id_warna)
        WHERE p.status=0;`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            response.ok(onres.rows, 200, res)
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.btn_list_batal_penimbangan = async (req, res) => {
    try {
        let { noroll, jkn2, wrn2, idkaryawan, no } = req.body
        let berat, kodeverifikasi
        querystr = `select * from perincian_penerimaanstok where no_roll='${noroll}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            berat = onres.rows[0].berat
            kodeverifikasi = onres.rows[0].kode
        })

        querystr = `INSERT INTO cetak_barcodetimbangan 
        VALUES(0,'${noroll}','${berat}',0,'${idkaryawan}','${jkn2}','${wrn2}','CETAK ULANG','${kodeverifikasi}');`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then()

        querystr = `update pembatalan_penimbangan set status=1 where no='${no}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then()
        
        querystr = `select max(no)  as no from cetak_barcodetimbangan`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            no = onres.rows[0].no
        })
        
        querystr = `select *,concat(berat,'' Kg'') as brt from cetak_barcodetimbangan where no='${no}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            response.ok(onres.rows, 200, res)
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}


exports.frxReportpecahanGetValue_listbatalpenimbangan = async (req, res) => {
    try {
        let {noroll} = req.body
        let varname, value, rollinduk, rollpecah

        if (noroll.toUpperCase().substr(0, 1) == 'R') {
            rollinduk = noroll
            rollpecah = ''
        } else {
            querystr = `SELECT * FROM data_pecahroll WHERE roll2='${noroll}';`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                rollinduk = onres.rows[0].roll_induk
                rollpecah = noroll
            })
        }

        if (varname == 'rollinduk') {
            value = rollinduk
        }

        if (varname == 'trollpecah') {
            if (rollpecah == '') {
                value = ''
            }else{
                value = 'Roll Pecahan'
            }
        }

        if (varname == 'rollpecah') {
            value = rollpecah
        }

        querystr = `SELECT * FROM n_stok WHERE no_roll='${noroll}';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (varname == 'nodata') {
                value = onres.rows[0].kode_spk
            }
        })

        response.ok({'message': varname, value, rollinduk, rollpecah}, 200, res)
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}