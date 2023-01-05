const response = require('../res/res');
const tabel = require('../conn/tabel');

let querystr = '';
let queryvalue = '';

exports.history_cutting_loss = async (req, res) => {
    try {
        querystr = `SELECT n.no_roll,n.jenis_kain,berat_roll2 AS berat,tanggal_roll2 AS tanggal_netto,nama
        FROM n_stok n JOIN n_kain_cuttingloss nk USING(no_roll)
        JOIN (SELECT no_roll,nama 
        FROM penjualan_kainstok JOIN detail_pengeluaranstok USING(no_pengeluaran) JOIN perincian_pengeluaranstok USING(no_detail) JOIN user USING(id_user)
        WHERE penjualan_melalui='UBAH NETTO') AS v USING(no_roll)
        JOIN (SELECT * FROM n_stokopnametimbang WHERE jenis_transaksi='PENETTOAN') nt ON n.no_roll=roll1
         ORDER BY tanggal_roll2,no_roll`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            response.ok(onres.rows, 200, res)
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}
