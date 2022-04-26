const { expect } = require('chai');
const Harness = require('cht-conf-test-harness');
const harness = new Harness({
  subject: 'patient_id2'
});

describe('Target: wra-referred-for-fp', () => {

  before(async () => {
    return await harness.start();
  });

  after(async () => {
    return await harness.stop();
  });

  beforeEach(async () => {
    await harness.clear();
  });

  afterEach(() => {
    expect(harness.consoleErrors).to.be.empty;
  });

  it('should compute wra-referred-for-fp', async () => {
    const t = await harness.getTargets({ type: 'wra-referred-for-fp' });
    expect(t[0].value).to.include({ total: 0 });

    const monthly_screening = await harness.fillForm('over_5_screening',
      [],
      [],
      ['no', 'none'],
      ['no', '3'],
      ['no', 'none'],
      ['no'],
      ['no', 'no', 'no', '3', 'yes'],
      ['no'],
      ['no']
    );
    expect(monthly_screening.errors).to.be.empty;

    const t2 = await harness.getTargets({ type: 'wra-referred-for-fp' });
    expect(t2[0]).to.nested.include({ 'value.pass': 1, 'value.total': 1});
  });

});
