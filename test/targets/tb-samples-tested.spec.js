const { expect } = require('chai');
const Harness = require('cht-conf-test-harness');
const harness = new Harness();

describe('Target: tb-samples-tested', () => {

  before(async () => await harness.start());

  after(async () => await harness.stop());

  beforeEach(async () => await harness.clear());

  it('should compute tb-samples-tested', async () => {

    const [target] = await harness.getTargets({ type: 'tb-samples-tested' });
    expect(target.value).to.include({ total: 0 });

    const tb_results = await harness.fillForm('tb_results', ['negative']);
    expect(tb_results.errors).to.be.empty;

    const [target2] = await harness.getTargets({ type: 'tb-samples-tested' });
    expect(target2).to.nested.include({
      'value.pass': 1,
      'value.total': 1
    });
  });

});
