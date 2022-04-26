const { expect } = require('chai');
const fetch = require('node-fetch');

const USERNAME = 'admin';
const PASSWORD = 'pass';
const HOSTNAME = 'http://localhost:5988';
const basicAuthHeader = ['Authorization', 'Basic ' + Buffer.from(USERNAME + ':' + PASSWORD).toString('base64')];
const fetchJson = async (url, path, options) => (await fetch(`${url}/${path}`, options)).json();

const CHT_USERS = [
  'admin',
  'medic',
  'gateway',
  'medic-api',
  'medic-sentinel',
  'horticulturalist'
];
const PREFIX = 'org.couchdb.user:';

(async () => {
  const allUserDbDocs = await fetchJson(HOSTNAME, '/_users/_all_docs?include_docs=true', { headers: [ basicAuthHeader ] });
  const userDocsInUsersDb = allUserDbDocs.rows.filter(row => {
    return !row.id.startsWith('_design/') &&
    !CHT_USERS.includes(row.id.slice(PREFIX.length))
  });
  const userDocIds = userDocsInUsersDb.map(user => user.doc._id);
  const userDocsInMedicDb = await fetchDocsFromKeys(userDocIds);

  const facilityIds = userDocsInUsersDb.map(user => user.doc.facility_id);
  const facilityDocs = await fetchDocsFromKeys(facilityIds);

  const contactIds = Object.values(userDocsInMedicDb).map(user => user.doc.contact_id);
  const contactDocs = await fetchDocsFromKeys(contactIds);

  expect(userDocsInUsersDb.length).to.eq(userDocIds.length, 'Expect all user docs in _users to have a corresponding doc in medic db.');
  for (let i = 0; i < userDocsInUsersDb.length; ++i) {
    const username = userDocsInUsersDb[i].id;
    if (!Object.keys(userDocsInMedicDb).includes(username)) {
      console.log('No user doc in Medic DB', `for user ${username}`);
      continue;
    }

    const userDocInMedicDb = userDocsInMedicDb[username].doc;
    const { facility_id, contact_id } = userDocInMedicDb;

    if (!Object.keys(facilityDocs).includes(facility_id)) {
      console.log(`Facility document does not exist for user ${username}`, ':', facility_id);
      continue;
    }

    if (!Object.keys(contactDocs).includes(contact_id)) {
      console.log(`Contact document does not exist for user ${username}`, ':', contact_id);
      continue;
    }

    const facilityDoc = facilityDocs[userDocInMedicDb.facility_id].doc;
    const contactDoc = contactDocs[userDocInMedicDb.contact_id].doc;

    if (facilityDoc.contact_type === 'schw_region') {
      logIfDifferent(contactDoc.role, 'schw', `Chw user does not set role in contact doc ${username} with ${contact_id}`);

      const oneExpectedRole = [ 'supervisor' ];
      if (oneExpectedRole.every(role => !userDocInMedicDb.roles.includes(role))) {
        console.log(`Chw user does not include one of the expected roles ${oneExpectedRole}`, username, JSON.stringify(userDocInMedicDb.roles));
      }
    } else if (facilityDoc.contact_type === 'chw_area') {
      const expectedRoles = [ 'district_admin' ];
      logUnorderedArrayDiff(userDocInMedicDb.roles, expectedRoles, `Supervisor user does not include expected roles ${username}`);
      logIfDifferent(contactDoc.role, 'chw', `Supervisor user does not set role in contact doc. ${username} with ${contact_id}`);
    } else if (facilityDoc.contact_type === 'site') {
      // TODO:
    } else {
      console.log(`User is not a child of a health_clinic or a district_hospital`, username);
    }
  }

  console.log(`${userDocsInUsersDb.length} total users`);
  const notActive = Object.values(contactDocs).filter(d => !d.doc.is_active).map(d => d.id);
  console.log(`${notActive.length} in-active users`);
})();

const logUnorderedArrayDiff = (actual, expected, message) => {
  if (!Array.isArray(actual) || !Array.isArray(expected)) {
    console.log(message, ':', 'Value is not an array');
    return;
  }

  if (expected.some(oneA => !actual.includes(oneA))) {
    console.log(message, ':', JSON.stringify(actual), 'vs', JSON.stringify(expected));
  }
};

const logIfDifferent = (actual, expected, message) => {
  if (expected !== actual) {
    console.log(message, ':', actual, 'vs', expected);
  }
}

const logIfSame = (actual, expected, message) => {
  if (expected === actual) {
    console.log(message, ':', actual, 'vs', expected);
  }
}

const fetchDocsFromKeys = async keys => {
  const raw = await fetchJson(HOSTNAME, '/medic/_all_docs?include_docs=true', {
    method: 'POST',
    headers: [
      [ 'Content-Type', 'application/json'],
      basicAuthHeader
    ],
    body: JSON.stringify({ keys }),
  });

  return raw.rows.reduce((agg, curr) => {
    if (!curr.doc) return agg;
    return Object.assign(agg, { [curr.id]: curr });
  }, {});
};
