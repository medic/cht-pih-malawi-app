const { expect } = require('chai');
const Harness = require('cht-conf-test-harness');
const harness = new Harness();

describe('Target: presumptive-tb-for-sputum-collection', () => {

  before(async () => await harness.start());

  after(async () => await harness.stop());

  beforeEach(async () => await harness.clear());

  afterEach(() => {
    expect(harness.consoleErrors).to.be.empty;
  });

  it('should compute presumptive-tb-for-sputum-collection', async () => {
    const t = await harness.getTargets({ type: 'presumptive-tb-for-sputum-collection' });
    expect(t[0].value).to.include({ total: 0 });

    const tb_screening = await harness.fillForm('tb_screening',
      ['fever']
    );
    expect(tb_screening.errors).to.be.empty;

    const t2 = await harness.getTargets({ type: 'presumptive-tb-for-sputum-collection' });

    expect(t2[0]).to.nested.include({ 'value.pass': 1, 'value.total': 1});
  });

});
