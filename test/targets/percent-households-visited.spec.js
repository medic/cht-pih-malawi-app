const { expect } = require('chai');
const Harness = require('cht-conf-test-harness');
const { under_5_screening, over_5_screening } = require('../form-inputs');
const harness = new Harness();

describe('Target: percent-households-visited', () => {

  before(async () => await harness.start());

  after(async () => await harness.stop());

  beforeEach(async () => await harness.clear());

  it('should compute percent-households-visited', async () => {

    const t = await harness.getTargets({ type: 'percent-households-visited' });
    expect(t[0]).to.nested.include({
      'value.pass': 0,
      'value.total': 1,
      'value.percent': 0
    });

    const monthly_screening_1 = await harness.fillForm(
      'under_5_screening',
      ...under_5_screening.immunization_visit
    );
    expect(monthly_screening_1.errors).to.be.empty;

    harness.subject = 'patient_id2';
    const monthly_screening_2 = await harness.fillForm(
      'over_5_screening',
      ...over_5_screening.simple
    );
    expect(monthly_screening_2.errors).to.be.empty;

    const t2 = await harness.getTargets({ type: 'percent-households-visited' });
    expect(t2[0]).to.nested.include({
      'value.pass': 1,
      'value.total': 1,
      'value.percent': 100
    });

  });

});
