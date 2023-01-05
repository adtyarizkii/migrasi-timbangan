const response = require('../res/res');
const tabel = require('../conn/tabel');

let querystr = '';
let queryvalue = '';

const globalf = require('./utility_service')

exports.jual_kain = async (req, res) => {
    let { namacus, harga, no_pengeluaran, nosj, idKaryawan } = req.body;
    let idcustomer, tgl;
    const now = new Date();
    const yyyy = now.getFullYear();
    let mm = now.getMonth() + 1;
    let dd = now.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    // console.log('SEKARANG TANGGAL:', yyyy + '-' + mm + '-' + dd);
    try {
        querystr = `SELECT apr.*, ap.harga FROM a_penjualankainstok ap INNER JOIN a_perincian_penjualanstok apr USING(no_pengeluaran);`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (onres.rows.length == 0) {
                response.ok({ "message": "Transaksi belum bisa disimpan karena detail transaksi masih kosong!" }, 201, res)
            } else if (namacus == '' || namacus == undefined) {
                response.ok({ "message": "Customer harus diisi!" }, 201, res)
            } else if (harga == '' || harga == undefined) {
                response.ok({ "message": "Harga harus diisi!" }, 201, res)
            } else {
                querystr = `SELECT * FROM customer WHERE nama='${namacus}'`
                queryvalue = []
                await tabel.queryDB(querystr, queryvalue).then(async onres => {
                    if (onres.rows.length == 0) {
                        response.ok({ "message": "Customer tidak terdaftar di database" }, 201, res)
                    } else {
                        idcustomer = onres.rows[0].id_customer
                        tgl = yyyy + '-' + mm + '-' + dd
                        
                        if (nosj == '' || nosj == 0 || nosj == undefined) {
                            response.ok({ "message": "No sj tidak boleh kosong!" }, 201, res)
                        } else if (idcustomer == '' || idcustomer == 0 || idcustomer == undefined) {
                            response.ok({ "message": "ID Customer tidak boleh kosong!" }, 201, res)
                        } else if (no_pengeluaran == '' || no_pengeluaran == 0 || no_pengeluaran == undefined) {
                            response.ok({ "message": "No pengeluaran tidak boleh kosong!" }, 201, res)
                        } else {
                            querystr = `START TRANSACTION`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then()                                
                            
                            querystr = `UPDATE a_penjualankainstok SET no_sj='${nosj}',id_customer='${idcustomer}',tanggal='${tgl}',catatan='${idKaryawan}',id_user='43',jenis_kain='WARNA',STATUS=1, harga='${harga}' WHERE no_pengeluaran='${no_pengeluaran}'`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then()
                                
                            querystr = `COMMIT`
                            queryvalue = []
                            await tabel.queryDB(querystr, queryvalue).then()
                            
                            response.ok({ "message": "sukses"}, 200, res)
                            }
                        }
                })
            }
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.jual_kain_delete = async (req, res) => {
    try {
        let { id } = req.params;
        querystr = `delete from a_perincian_penjualanstok where no='${id}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then()
        response.ok({ "message": "Sukses" }, 200, res)
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.qfoot_jual_kain = async (req, res) => {
    try {
        let {nopengeluaran} = req.params
        querystr = `SELECT SUM(pp.berat) AS berat, COUNT(pp.no) AS jml FROM  a_penjualankainstok pk INNER JOIN a_perincian_penjualanstok pp USING(no_pengeluaran)
        WHERE no_pengeluaran='${nopengeluaran}'`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres =>{
            response.ok(onres.rows, 200, res)
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.customer_jualkain = async (req, res) => {
    try {
        let cus = await globalf.select_customer()
        // console.log(cus);

        response.ok(cus.rows, 200, res)
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.btnhapus_jualkain = async (req, res) => {
    try {
        let { nopengeluaran } = req.params

        querystr = `CALL sp_hapusjualkain('${nopengeluaran}');`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then()

        response.ok({'message': 'sukses'}, 200, res)
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.btnrefresh_jualkain = async (req, res) => {
    try {
        let { nopengeluaran } = req.params

        querystr = `SELECT apr.*, ap.harga FROM a_penjualankainstok ap INNER JOIN a_perincian_penjualanstok apr USING(no_pengeluaran)
        WHERE apr.no_pengeluaran='${nopengeluaran}';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then()
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.btntambahdetail_jualkain = async (req, res) => {
    try {
        let { namacus } = req.params

        if (namacus == '' || namacus == undefined) {
            response.ok({'message': 'Customer harus diisi!'}, 201, res)
        } else {
            querystr = `select * from customer where nama='${namacus}';`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows.length == 0) {
                    response.ok({'message': 'Customer tidak terdaftar di database'})
                } else {
                    response.ok(onres.rows, 200, res)
                }
            })
        }
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.frxReport1GetValue_jualkain = async (req, res) => {
    try {
        let { nopengeluaran, tanggal, namacus } = req.body
        let varname, value, lberat, jml, hrgsub, harga, hrg, kode_ver

        function formatDate(datx) {
            var d = new Date(datx),
                month = '' + (d.getMonth() + 1),
                day = d.getDate().toString(),
                year = d.getFullYear(),
                hours = d.getHours().toString(),
                minutes = d.getMinutes().toString(),
                secs = d.getSeconds().toString();
            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
            if (hours.length < 2) hours = '0' + hours;
            if (minutes.length < 2) minutes = '0' + minutes;
            if (secs.length < 2) secs = '0' + secs;
            return [day, month, year].join('-')
            // + ' ' + [hours, minutes, secs].join(':');
        }

        querystr = `select * from data_perusahaan where id_perusahaan='4';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (varname == 'toko') {
                value = onres.rows[0].nama
            }
            if (varname == 'alamat') {
                value = onres.rows[0].alamat
            }
            if (varname == 'telp') {
                value = onres.rows[0].telepon
            }
            if (varname == 'bank') {
                value = `Bank : ${onres.rows[0].bank}`
            }
            if (varname == 'an') {
                value = `An : ${onres.rows[0].atas_nama}`
            }
            if (varname == 'norek') {
                value = `No Rek : ${onres.rows[0].no_rekening}`
            }
            if (varname == 'nopenjualan') {
                value = `No Penjualan : ${nopengeluaran}`
            }
            if (varname == 'tgl') {
                value = `Tanggal : ${formatDate(tanggal)}`
            }
            if (varname == 'customer') {
                value = `Customer : ${namacus}`
            }
            if (varname == 'akhir') {
                value = '-- TERIMAKASIH --'
            }
            if (varname == 'eceran') {
                value = `${lberat} Kg (${jml})`
            }

            hrgsub = parseFloat(harga)

            if (varname == 'harga') {
                value = `Rp. ${hrgsub}`
            }

            hrg = parseFloat(harga) * parseFloat(lberat)

            if (varname == 'totalbayar') {
                value = `Rp. ${hrg}`
            }

            querystr = `select * from kode_verifikasipenjualan where no_penjualan='${nopengeluaran}'`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres => {
                if (onres.rows.length > 0) {
                    kode_ver = onres.rows[0].kode_verifikasi
                } else {
                    kode_ver = ''
                }
                if (varname == 'kode') {
                    value = kode_ver
                }
            })
        })
        response.ok({'message': varname, value, lberat, jml, hrgsub, harga, hrg, kode_ver}, 201, res)
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.frxReport2GetValue_jualkain = async (req, res) => {
    try {
        let { nopengeluaran, tanggal, namacus, catatan } = req.body
        let varname, value, lberat, jml, hrgsub, harga, hrg, kode_ver

        function formatDate(datx) {
            var d = new Date(datx),
                month = '' + (d.getMonth() + 1),
                day = d.getDate().toString(),
                year = d.getFullYear(),
                hours = d.getHours().toString(),
                minutes = d.getMinutes().toString(),
                secs = d.getSeconds().toString();
            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
            if (hours.length < 2) hours = '0' + hours;
            if (minutes.length < 2) minutes = '0' + minutes;
            if (secs.length < 2) secs = '0' + secs;
            return [day, month, year].join('-')
            // + ' ' + [hours, minutes, secs].join(':');
        }

        querystr = `select * from data_perusahaan where id_perusahaan='4';`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            if (varname == 'toko') {
                value = onres.rows[0].nama
            }
            if (varname == 'alamat') {
                value = onres.rows[0].alamat
            }
            if (varname == 'telp') {
                value = onres.rows[0].telepon
            }
            if (varname == 'bank') {
                value = `Bank : ${onres.rows[0].bank}`
            }
            if (varname == 'an') {
                value = `An : ${onres.rows[0].atas_nama}`
            }

            querystr = `select * from customer where nama='${namacus}';`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres2 => {
                if (varname == 'customer') {
                    value = `Kepada Yth, ${namacus}`
                }
                if (varname == 'telpcus') {
                    value = `No Telepon : ${onres2.rows[0].telepon}`
                }
                if (varname == 'alamatcus') {
                    value = `Alamat : ${onres2.rows[0].alamat}`
                }
                if (varname == 'keterangan') {
                    value = catatan
                }
                if (varname == 'nopenjualan') {
                    value = nopengeluaran
                }
                if (varname == 'tgl') {
                    value = `Tanggal : ${formatDate(tanggal)}`
                }
            })

            if (varname == 'alamatcus') {
                value = `Alamat : ${onres.rows[0].alamat}`
            }
            if (varname == 'eceran') {
                value = `${lberat} Kg (${jml})`
            }

            hrgsub = parseFloat(harga)

            if (varname == 'harga') {
                value = `Rp. ${hrgsub}`
            }

            hrg = parseFloat(harga) * parseFloat(lberat)

            if (varname == 'totalbayar') {
                value = `Rp. ${hrg}`
            }
            if (varname == 'akhir') {
                value = '-- TERIMAKASIH --'
            }

            querystr = `select * from kode_verifikasipenjualan where no_penjualan='${nopengeluaran}'`
            queryvalue = []
            await tabel.queryDB(querystr, queryvalue).then(async onres3 => {
                if (onres3.rows.length > 0) {
                    kode_ver = onres3.rows[0].kode_verifikasi
                } else {
                    kode_ver = ''
                }

                if (varname == 'kode') {
                    value = kode_ver
                }
            })
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}

exports.generate = async (req, res) => {
    try {
        const { no_pengeluaran } = req.params
        if(!no_pengeluaran){
            response.ok({pesan : 'no_pengeluaran tidak boleh ada yang kosong !'}, 200, res)
            return
        }
        querystr = `CALL generate(?, @out_msg);
        SELECT @out_msg AS pesan;`
        queryvalue = [no_pengeluaran]
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