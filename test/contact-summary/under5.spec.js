const { expect } = require('chai');
const TestHarness = require('cht-conf-test-harness');
const harness = new TestHarness();

describe('contact summary - under 5', () => {
  before(async () => await harness.start());
  after(async () => await harness.stop());
  beforeEach(async () => await harness.clear());
  afterEach(() => { expect(harness.consoleErrors).to.be.empty; });

  it('empty contact', async () => {
    const result = await harness.getContactSummary({}, []);
    expect(result).to.deep.eq({
      cards: [],
      fields: [],
      context: { last_tb_results: '' },
    });
  });

  it('shows malnutrition field for under 5 in a treatment program', async () => {
    // TODO: switch to integration pattern
    const summary = await harness.getContactSummary(
      {type: 'contact', contact_type: 'person', _id: 'k', date_of_birth: '2020-01-01'},
      [
        {_id: 'r', type: 'data_record', form: 'referral_follow_up', reported_date: 123456, fields: { eid: { enrolled_in_eid: 'yes', eid_id: 'abc' }}},
      ],
      []
    );
    expect(summary.cards[1].fields.find( f => f.label === 'contact.profile.malnutrition_program')).to.have.property('value');
    expect(summary.cards[1].fields.find( f => f.label === 'contact.profile.malnutrition_program').value).to.equal('contact.profile.not-enrolled');
  });

});
