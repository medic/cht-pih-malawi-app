const { expect } = require('chai');
const TestHarness = require('cht-conf-test-harness');
const harness = new TestHarness();
describe('contact summary testing', () => {

  before(async () => { return await harness.start(); });
  after(async () => { return await harness.stop(); });
  beforeEach(async () => {
    return await harness.clear();
  });
  afterEach(() => { expect(harness.consoleErrors).to.be.empty; });

  it('empty contact', async () => {
    const result = await harness.getContactSummary({}, []);
    expect(result).to.deep.eq({
      cards: [],
      fields: [],
      context: { last_tb_results: '' },
    });
  });

  it('Get ART treatment program ID', async () => {
    const result = await harness.fillContactForm('person', ['name', 'male', 'over_5', 'no', '35', '0', undefined, undefined, 'none']);
    expect(result.errors).to.be.empty;

    const hiv_screening = await harness.fillForm(
      'hiv_screening',
      ['0'],
      []
    );
    expect(hiv_screening.errors).to.be.empty;

    await harness.flush(7);
    const tasks = await harness.getTasks();
    const referral_follow_up = await harness.loadAction(
      tasks[0],
      ['yes'],
      ['yes', 'positive', 'yes', 'yes', 'self', 'NNO', '1234'],
      ['no']
    );
    expect(referral_follow_up.errors).to.be.empty;

    const summary = await harness.getContactSummary();
    expect(summary.cards[1].fields[0].label).to.be.equal('contact.profile.art');
    expect(summary.cards[1].fields[0].value).to.be.equal('NNO 1234');
  });
});
