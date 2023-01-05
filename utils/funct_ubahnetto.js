const { queryDB } = require('../conn/tabel')

class HandleFunctionChangeNetto {
    constructor(props, page) {
        this.page = page
        this.beratAwal = props.beratAwal
        this.bert = props.bert
        this.nomor_roll = props.nomor_roll
        this.tp_plastik = props.tp_plastik
        this.id_karyawan = props.id_karyawan
    }
    async ubahNetto() {
        let querystr, queryvalue
        if (!this.id_karyawan && this.id_karyawan.length === 0
            || !this.nomor_roll && this.nomor_roll.length === 0
            || !this.tp_plastik && this.tp_plastik.length === 0
            || !this.beratAwal && this.beratAwal.length === 0
        ) {
            return 'Data tidak boleh ada yang kosong !'
        }
        querystr = `CALL ubahnetto(?, ?, ?, ?,?, ?, @out_msg);
        SELECT @out_msg AS pesan;`
        queryvalue = [parseInt(this.bert), parseInt(this.beratAwal), parseInt(this.tp_plastik),  this.page, this.id_karyawan, this.nomor_roll]
        const onres = await queryDB(querystr, queryvalue)
        return onres.rows[1][0].pesan
    }
}

module.exports = HandleFunctionChangeNetto