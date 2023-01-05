'use strict';
const response = require('../res/res')
const tabel = require('../conn/tabel');

let querystr = '';
let queryvalue = '';

async function starttransaction() {
  await queryDB('START TRANSACTION', '')
      .then(async () => { })
}

async function commit() {
  await queryDB('COMMIT', '')
      .then(async () => { })
}

async function rollback() {
  await queryDB('ROLLBACK', '')
      .then(async () => { })
}

async function select_customer() {
  try {

    querystr = `SELECT nama FROM customer;`
    queryvalue = [];
    let data = [];
    await tabel.queryDB(querystr, queryvalue).then(async onres => {
      data = onres;
    });
  
    return data;
  } catch (e) {
    return tabel.GetError(e);
  }
}

async function select_kain() {
  try {

    querystr = `select nama_kain from kain order by nama_kain;`
    queryvalue = [];
    let data = [];
    await tabel.queryDB(querystr, queryvalue).then(async onres => {
      data = onres;
    });
  
    return data;
  } catch (e) {
    return tabel.GetError(e);
  }
}

async function select_warna() {
  try {

    querystr = `select jenis_warna from warna order by jenis_warna;`
    queryvalue = [];
    let data = [];
    await tabel.queryDB(querystr, queryvalue).then(async onres => {
      data = onres;
    });
  
    return data;
  } catch (e) {
    return tabel.GetError(e);
  }
}

async function select_konstanta_kalibrasitimbangan() {
  try {

    querystr = `select data from konstanta where jenis='KALIBRASI TIMBANGAN';`
    queryvalue = [];
    let data = [];
    await tabel.queryDB(querystr, queryvalue).then(async onres => {
      if (onres.rows.length == 0) {
        data = `Konstanta Kalibrasi Timbangan tidak terdaftar, silahkan hubungi bagian IT!`
      } else {
        data = onres;
      }
    });
  
    return data;
  } catch (e) {
    return tabel.GetError(e);
  }
}




module.exports = {
  starttransaction,
  commit,
  rollback,
  select_customer,
  select_kain,
  select_warna,
  select_konstanta_kalibrasitimbangan
}