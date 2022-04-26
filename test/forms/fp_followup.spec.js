const { expect } = require('chai');
const Harness = require('cht-conf-test-harness');
const harness = new Harness({
  subject: 'patient_id2'
});

describe('FP follow up form', () => {

  before(async () => { return await harness.start(); });
  after(async () => { return await harness.stop(); });

  it('is generated from over_5_screening', async () => {
    await harness.setNow('2018-01-01');
    const initial_over_5_screening = await harness.fillForm('over_5_screening',
      [],
      [],
      ['no', 'none'],
      ['no', '3'],
      ['no', 'none'],
      ['no'],
      ['yes', 'pills', 'no', 'no'],
      ['no']
    );
    expect(initial_over_5_screening.errors).to.be.empty;

    await harness.flush(30);

    const over_5_screening = await harness.fillForm('over_5_screening',
      [],
      [],
      ['no', 'none'],
      ['no', '3'],
      ['no', 'none'],
      ['no'],
      ['yes', 'yes', 'depo_provera', '2018-09-30', 'no', 'no', 'no'],
      ['no']
    );
    expect(over_5_screening.errors).to.be.empty;

    expect(over_5_screening).to.have.property('additionalDocs');
    expect(over_5_screening.additionalDocs).to.be.an('array');
    expect(over_5_screening.additionalDocs).to.have.lengthOf.at.least(4);
    expect(over_5_screening.additionalDocs[2]).to.deep.include({form: 'fp_follow_up'});

  });

});
