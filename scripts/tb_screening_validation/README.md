These are helper scripts for validating report documents as detailed in issue #456.

#### Usage

1. Create an environment variable called `SERVER_URL` with a URL pointing to the instance including credentials and path to the couch database i.e.
`export SERVER_URL=https://<username>:<password>@pih-malawi.dev.medicmobile.org/medic`
1. Run `node get_ids.js` to fetch report id's. The id's will be saved in the `tb_screenings.json` file.
1. Run `node get_docs.js` to fetch documents into the fetched_docs folder.
1. Run `node check.js` to analyse report documents and remove errors. Updated documents will be saved in the upload_docs folder.
