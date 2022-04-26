const { expect } = require('chai');
const Harness = require('cht-conf-test-harness');
const harness = new Harness();

describe('Target: children-under-5', () => {

  before(async () => {
    return await harness.start();
  });

  after(async () => {
    return await harness.stop();
  });

  beforeEach(async () => {
    return await harness.clear();
  });

  afterEach(() => {
    expect(harness.consoleErrors).to.be.empty;
  });

  it('should compute children-under-5', async () => {
    const t = await harness.getTargets({ type: 'children-under-5' });
    expect(t[0]).to.nested.include({ 'value.pass': 1, 'value.total': 1});

    const patientResult = await harness.fillContactForm('person',
      [
        'PDSNDSJADJAJ',
        'male',
        'under_5',
        (new Date()).toISOString().slice(0, 10),
        'none'
      ]
    );
    expect(patientResult.errors).to.be.empty;

    const t2 = await harness.getTargets({ type: 'children-under-5' });
    expect(t2[0]).to.nested.include({ 'value.pass': 2, 'value.total': 2});
  });

});
