'use strict';
const response = require('../res/res');
const tabel = require('../conn/tabel');

let querystr = '';
let queryvalue = '';

exports.master_timbangan = async (req, res) => {
    try {
        querystr = `select id_timbangan,timbangan,ip_address,if(is_active=1,'Yes','No') as is_active,if(is_used=1,'Yes','No') as is_used from n_master_penimbangan where is_active=1 order by timbangan`
        queryvalue = []
        await tabel.queryDB(querystr, queryvalue).then(async onres => {
            response.ok(onres.rows, 200, res)
        })
    } catch (error) {
        response.ok({ "message": tabel.GetError(error) }, 300, res)
    }
}
