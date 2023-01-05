const response = require("../../res/res");
const { queryDB, GetError } = require("../../conn/tabel");

const getDataKonstanta = async (props) => {
    return new Promise(async (resolve, reject) => {
        try {
            querystr = `select data from konstanta where jenis=?`
            queryvalue = [props.jenis]
            let data = await queryDB(querystr, queryvalue).then()
            data = data.rows[0]?.data || undefined

            resolve(data)
        } catch (e) {
            reject(e)
        }
    })
}


module.exports = {
    getDataKonstanta,
}