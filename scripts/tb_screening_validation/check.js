const fs = require('fs');
const jsonStringifySafe = require('json-stringify-safe');

const stringifySafe = (obj) => jsonStringifySafe(obj, null, 2, () => undefined);

const fnames = fs.readdirSync('fetched_docs', { encoding: 'utf8' });

console.log('Items: ', fnames.length);

let count = 0;
let ne_count = 0;

let docs_to_rectify = [];

fnames.map(f => {
  const file_content = fs.readFileSync(`fetched_docs/${f}`, { encoding: 'utf8' });
  const doc = JSON.parse(file_content);
  if (doc.errors){
    if (doc.errors.length > 0){
      count += 1;
      docs_to_rectify.push(doc);
    }
  } else {
    ne_count += 1;
  }
});

console.log('Docs with errors: ', count);
console.log('Docs w/o error field: ', ne_count);

docs_to_rectify.map(doc => {
  doc.errors = [];
  fs.writeFileSync(
    `upload_docs/${doc._id}.doc.json`,
    stringifySafe(doc) + '\n'
  );
});
