const response = require('../res/res');
const tabel = require('../conn/tabel');

let querystr = '';
let queryvalue = '';

exports.cetak_barcode_penimbangan = async (req, res) => {
    try {
        let { idkaryawan } = req.params

        querystr = `select * from group_penimbangan where idkaryawan='${idkaryawan}' order by no desc limit 30;`
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

exports.btn_cetak_barcode_penimbangan = async (req, res) => {
    try {
        let { idkaryawan, no } = req.body

        querystr = `select * from group_penimbangan where idkaryawan='${idkaryawan}' order by no desc limit 30;`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length == 0) {
                return response.ok({ "message": "Tidak ada data yang bisa di print ulang!" }, 201, res)
            }
        })

        querystr = `SELECT * FROM group_penimbangan gp JOIN detail_order dr ON dr.no_Detail=gp.no_Detailorder 
        JOIN order_pembelian op USING(no_order) JOIN customer c USING(id_customer) 
        WHERE   gp.no='${no}';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then()

        response.ok({'message': 'Data berhasil di cetak ulang'}, 200, res)
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.frxReport1GetValue = async (req, res) => {
    try {
        let { noorder, roll2 } = req.body
        let jmltotal, jmldari, hasil, varname, value

        querystr = `SELECT COUNT(DISTINCT NO) AS total,IFNULL(((SELECT COUNT(DISTINCT NO) FROM detail_order JOIN group_penimbangan ON no_detail=no_detailorder 
        WHERE no_order='${noorder}' AND NO <= (SELECT NO FROM detail_order JOIN group_penimbangan ON no_detail=no_detailorder      
        WHERE no_order='${noorder}' AND roll2='${roll2}'))),0) AS dari FROM detail_order JOIN perincian_order USING(no_detail) 
        WHERE no_order='${noorder}' AND jenis_quantity='KGAN';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length > 0) {
                jmltotal = onres.rows[0].total
                jmldari = onres.rows[0].dari
            } else {
                jmltotal = 0
                jmldari = 0
            }

            hasil = `${jmldari} Dari ${jmltotal}`

            if (varname = 'urutan') {
                value = hasil
            }
            response.ok({'message': jmltotal, jmldari, hasil, varname, value}, 200, res)
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}