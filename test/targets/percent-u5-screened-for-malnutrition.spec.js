const { expect } = require('chai');
const Harness = require('cht-conf-test-harness');
const harness = new Harness();

describe('Target: percent-u5-screened-for-malnutrition', () => {

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

  it('should compute percent-u5-screened-for-malnutrition', async () => {
    const t = await harness.getTargets({ type: 'percent-u5-screened-for-malnutrition' });
    expect(t[0].value).to.include({ total: 0 });

    const under_5_screening = await harness.fillForm(
      'under_5_screening',
      [],
      [],
      ['no', '14', 'none'],
      ['none'],
      [],
      ['no'],
      ['not_started'],
      [],
      ['no'],
      ['no']
    );
    expect(under_5_screening.errors).to.be.empty;

    const t2 = await harness.getTargets({ type: 'percent-u5-screened-for-malnutrition' });
    expect(t2[0]).to.nested.include({
      'value.pass': 1,
      'value.total': 1,
      'value.percent': 100
    });
  });

});
