const response = require('../res/res');
const tabel = require('../conn/tabel');

let querystr = '';
let queryvalue = '';

exports.cutting_loss = async (req, res) => {
    try {
        querystr = `SELECT n.no_roll,n.berat,IF(v.no_roll IS NULL,'Belum Penettoan','Sudah Penettoan') AS sts,jenis_kain
        FROM n_stok n
        LEFT JOIN (SELECT no_roll FROM penjualan_kainstok JOIN detail_pengeluaranstok USING(no_pengeluaran) JOIN perincian_pengeluaranstok USING(no_detail)
        WHERE penjualan_melalui='UBAH NETTO') AS v USING(no_roll)
        WHERE jenis='CUTTING LOSS' ORDER BY sts,no_roll`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            response.ok(onres.rows, 200, res)
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}
