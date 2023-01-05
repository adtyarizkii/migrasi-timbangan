const response = require('../res/res');
const tabel = require('../conn/tabel');

let querystr = '';
let queryvalue = '';

exports.history_karung = async (req, res) => {
    try {
        querystr = `SELECT no_karung,CONCAT(berat_dibawah,'-',berat_diatas) AS kategori,SUM(berat) AS berat,no_lokasi,COUNT(no_roll) AS jml
        FROM n_kategori_karung n JOIN n_kategori_karung_detail USING(no_karung) WHERE STATUS> 0 GROUP BY no_karung`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            response.ok(onres.rows, 200, res)
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.history_karung2_qdata = async (req, res) => {
    try {
        querystr = `SELECT no_karung,CONCAT(berat_dibawah,'-',berat_diatas) AS kategori,SUM(berat) AS berat,no_lokasi,COUNT(no_roll) AS jml,kelompok,kelompok_warna,tipe,n.createdAt,nama
        FROM n_kategori_karung n JOIN n_kategori_karung_detail USING(no_karung) JOIN user u ON n.id_user=u.id_user WHERE STATUS> 0
        GROUP BY no_karung ORDER BY n.createdAt DESC`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            response.ok(onres.rows, 200, res)
        })

    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.history_karung2_qplastik = async (req, res) => {
    try {
        let { nokarung } = req.params
        querystr = `select * from n_kategori_karung where no_karung =${nokarung}`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            response.ok(onres.rows, 200, res)
        })
        
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}