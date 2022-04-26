const { expect } = require('chai');
const { spot_check } = require('../form-inputs');
const Harness = require('cht-conf-test-harness');
const harness = new Harness();

describe('Target: count-chws-supervised-by-schws-this-quarter', () => {

  before(async () => await harness.start());

  after(async () => await harness.stop());

  beforeEach(async () => await harness.clear());

  it('should compute count-chws-supervised-by-schws-this-quarter', async () => {

    const supervision_target = await harness.getTargets({ type: 'count-chws-supervised-by-schws-this-quarter' });
    expect(supervision_target[0].value).to.include({ total: 0 });

    const spot_check_report = await harness.fillForm('spot_check', spot_check.needs_mentorship);
    expect(spot_check_report.errors).to.be.empty;

    const supervision_target2 = await harness.getTargets({ type: 'count-chws-supervised-by-schws-this-quarter' });
    expect(supervision_target2[0]).to.nested.include({
      'value.pass': 1,
      'value.total': 1
    });
  });

});
