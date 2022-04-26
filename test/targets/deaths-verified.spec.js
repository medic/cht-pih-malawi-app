const { expect } = require('chai');
const { death } = require('../form-inputs');
const Harness = require('cht-conf-test-harness');
const harness = new Harness();

describe('Target: deaths-verified', () => {

  before(async () => await harness.start());

  after(async () => await harness.stop());

  beforeEach(async () => await harness.clear());

  it('should compute deaths-verified', async () => {
    const t = await harness.getTargets({ type: 'deaths-verified' });
    expect(t[0].value).to.include({ total: 0 });

    const death_report = await harness.fillForm('death', death.no_treatment);
    expect(death_report.errors).to.be.empty;

    const t2 = await harness.getTargets({ type: 'deaths-verified' });
    expect(t2[0]).to.nested.include({
      'value.pass': 0,
      'value.total': 1,
      'value.percent': 0
    });

    const death_review = await harness.fillForm('death_review', death.review);
    expect(death_review.errors).to.be.empty;

    const t3 = await harness.getTargets({ type: 'deaths-verified' });
    expect(t3[0]).to.nested.include({
      'value.pass': 1,
      'value.total': 1,
      'value.percent': 100
    });

  });

});
