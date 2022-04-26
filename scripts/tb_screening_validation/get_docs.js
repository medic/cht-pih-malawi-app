const fs = require('fs');
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

const db = new PouchDB(SERVER_URL, { fetch });

let tbs = fs.readFileSync('tb_screenings.json', { encoding: 'utf8' });

let tb_reports = JSON.parse(tbs);

const CHUNK = 50000;

for (let i = 0; i < tb_reports.length; i += CHUNK){
  const chunk = tb_reports.slice(i, i + CHUNK);
  let dx = chunk.map(d => new Object({ id: d }));

  const options = {
    docs: dx,
    include_docs: true
  };

  db.bulkGet(options)
  .then(response => {
    response.results.map(r => {
      const doc = r.docs[0].ok;
      fs.writeFileSync(`fetched_docs/${doc._id}.doc.json`, stringifySafe(doc) + '\n');
    });
  })
  .catch(e => console.log(e));
}
