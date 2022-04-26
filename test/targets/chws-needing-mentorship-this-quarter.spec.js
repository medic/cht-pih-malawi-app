const { expect } = require('chai');
const { spot_check } = require('../form-inputs');
const Harness = require('cht-conf-test-harness');
const harness = new Harness();

describe('Target: chws-needing-mentorship-this-quarter', () => {

  before(async () => await harness.start());

  after(async () => await harness.stop());

  beforeEach(async () => await harness.clear());

  it('should compute chws-needing-mentorship-this-quarter', async () => {

    const mentorship_target = await harness.getTargets({ type: 'chws-needing-mentorship-this-quarter' });
    expect(mentorship_target[0].value).to.include({ total: 0 });

    const spot_check_0 = await harness.fillForm('spot_check', spot_check.needs_mentorship);
    expect(spot_check_0.errors).to.be.empty;

    const spot_check_1 = await harness.fillForm('spot_check', spot_check.needs_mentorship);
    expect(spot_check_1.errors).to.be.empty;

    const mentorship_target2 = await harness.getTargets({ type: 'chws-needing-mentorship-this-quarter' });
    expect(mentorship_target2[0]).to.nested.include({
      'value.pass': 1,
      'value.total': 1
    });
  });

});
