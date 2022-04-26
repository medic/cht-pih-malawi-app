const { expect } = require('chai');
const Harness = require('cht-conf-test-harness');
const { over_5_screening } = require('../form-inputs');
const harness = new Harness({
  subject: 'patient_id2'
});

describe('TB screening form', () => {

  before(async () => await harness.start());
  after(async () => await harness.stop());

  it('is generated from over_5_screening', async () => {
    const o5_screening = await harness.fillForm('over_5_screening', ...over_5_screening.simple);
    expect(o5_screening.errors).to.be.empty;

    expect(o5_screening).to.have.property('additionalDocs');
    expect(o5_screening.additionalDocs).to.be.an('array');
    expect(o5_screening.additionalDocs).to.have.lengthOf.at.least(4);
    expect(o5_screening.additionalDocs[0]).to.deep.include({form: 'tb_screening'});

  });

});
