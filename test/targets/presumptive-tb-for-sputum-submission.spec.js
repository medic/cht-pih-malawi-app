const { expect } = require('chai');
const Harness = require('cht-conf-test-harness');
const harness = new Harness();

describe('Target: presumptive-tb-for-sputum-submission', () => {

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

  it('should compute presumptive-tb-for-sputum-submission', async () => {
    const t = await harness.getTargets({ type: 'presumptive-tb-for-sputum-submission' });
    expect(t[0].value).to.include({ total: 0 });

    const sputum_collection = await harness.fillForm(
      'sputum_collection',
      ['1', '1']
    );
    expect(sputum_collection.errors).to.be.empty;

    const t2 = await harness.getTargets({ type: 'presumptive-tb-for-sputum-submission' });
    expect(t2[0]).to.nested.include({ 'value.pass': 1, 'value.total': 1});
  });

});
