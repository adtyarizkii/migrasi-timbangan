const response = require('../res/res');
const tabel = require('../conn/tabel');

let querystr = '';
let queryvalue = '';

exports.hasil_foto_bs = async (req, res) => {
    let alamat, nama, nm;
    let { noroll } = req.body;
    try {
        querystr = `SELECT nama FROM alamat_fhoto WHERE kategori='KAINBS';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length == 0) {
                response.ok({ "message": "Alamat foto kain bs tidak terdaftar, silahkan hubungi bagian IT" }, 201, res)
            } else {
               alamat = onres.rows[0].nama

               querystr = `SELECT IFNULL(MAX(nama),'kosong') AS data FROM n_fhotobs WHERE no_roll='${noroll}';`
               queryvalue = []
               await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows.length == 0) {
                    nama = noroll + 'F1'
                } else {
                    if (onres.rows[0].data == 'kosong') {
                        nama = noroll + 'F1'
                    } else {
                        nm = onres.rows[0].data
                        nm = nm + 'F' + 1
                        nm = nm + 1
                        nama = noroll + 'F' + nm
                    }
                }
               })
               response.ok({
                alamat_foto: alamat,
                nama_file: nama
               }, 201, res)
            }
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.insert_hasil_foto_bs = async (req, res) => {
    try {
        let { noroll, idkaryawan } = req.body;
        let alamat, nama, nm;
        querystr = `SELECT nama FROM alamat_fhoto WHERE kategori='KAINBS';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length == 0) {
                response.ok({ "message": "Alamat foto kain bs tidak terdaftar, silahkan hubungi bagian IT" }, 201, res)
            } else {
               alamat = onres.rows[0].nama

               querystr = `SELECT IFNULL(MAX(nama),'kosong') AS data FROM n_fhotobs WHERE no_roll='${noroll}';`
               queryvalue = []
               await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows.length == 0) {
                    nama = noroll + 'F1'
                } else {
                    if (onres.rows[0].data == 'kosong') {
                        nama = noroll + 'F1'
                    } else {
                        nm = onres.rows[0].data
                        nm = nm + 'F' + 1
                        nm = nm + 1
                        nama = noroll + 'F' + nm
                    }
                }
               })
            }
        })

        querystr = `INSERT INTO n_fhotobs(tanggal,no_roll,nama,STATUS,id_user)
        VALUES(NOW(),'${noroll}','${nama}',0,'${idkaryawan}');`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then()

        response.ok({'message': 'sukses'}, 200, res)
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}