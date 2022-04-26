const { expect } = require('chai');
const Harness = require('cht-conf-test-harness');
const harness = new Harness();

describe('Target: percent-pregnancies-registered-in-first-trimester', () => {

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

  it('should compute percent-pregnancies-registered-in-first-trimester', async () => {
    const t = await harness.getTargets({ type: 'percent-pregnancies-registered-in-first-trimester' });
    expect(t[0].value).to.include({ total: 0 });

    const fp_screening = await harness.fillForm('pregnancy',
      ['yes'],
      ['yes', new Date().toISOString().slice(0, 10), '0'],
      ['none'],
      ['chw']
    );
    expect(fp_screening.errors).to.be.empty;

    const t2 = await harness.getTargets({ type: 'percent-pregnancies-registered-in-first-trimester' });
    expect(t2[0]).to.nested.include({
      'value.pass': 1,
      'value.total': 1,
      'value.percent': 100
    });
  });

});
