const url = require('url');
const fs = require('fs');
const rpn = require('request-promise-native');
const jsonStringifySafe = require('json-stringify-safe');
const PouchDB = require('pouchdb-core');
PouchDB.plugin(require('pouchdb-adapter-http'));
PouchDB.plugin(require('pouchdb-find'));
PouchDB.plugin(require('pouchdb-mapreduce'));

const { SERVER_URL } = process.env;

const stringifySafe = (obj) => jsonStringifySafe(obj, null, 2, () => undefined);

const fetch = (url, opts) => {
  return PouchDB.fetch(url, opts);
};

const db = new PouchDB(CLONE_URL, { fetch });

const options = {
  key: ['tb_screening'],
  include_docs: false,
  reduce: false
};

let tbs_reports = [];

let tbs = db.query('medic-client/reports_by_form', options)
.then(response => {
  console.log('Fetched rows:', response.rows.length);
  return response.rows;
})
.then(docs => {
  docs.map(d => tbs_reports.push(d.id));
  fs.writeFileSync('tb_screenings.json', JSON.stringify(tbs_reports), 'utf8');
  return tbs_reports;
})
.catch(e => console.log(e));
