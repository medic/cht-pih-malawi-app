const { expect } = require('chai');
const TestHarness = require('cht-conf-test-harness');
const inputs = require('../form-inputs');
const harness = new TestHarness({
  subject: 'patient_id2'
});

describe('contact summary - over 5', () => {

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

  it('#130 - crash from getTreatmentProgramId', async () => {
    const result = await harness.fillContactForm('person', ['name', 'male', 'over_5', 'no', '15', '0', undefined, undefined, 'none']);
    expect(result.errors).to.be.empty;
    result.contacts[0].art_id = undefined;

    harness.pushMockedDoc({
      _id: 'foo',
      type: 'data_record',
      form: 'referral_follow_up',
      fields: {
        patient_uuid: result.contacts[0]._id,
        hiv: { initiated_treatment: 'yes' },
      }
    });

    const summary = await harness.getContactSummary(result.contacts[0]);
    expect(summary.cards).to.have.property('length', 1);
    expect(summary.cards[0].fields.find(f => f.label === 'contact.profile.art')).to.include({ value: 'contact.profile.no-id' });
    expect(summary.fields.map(f => f.label)).to.have.members(['contact.age', 'contact.sex', 'contact.parent']);
  });

  it('condition card shows FP card', async () => {
    const summary = await harness.getContactSummary();
    expect(summary.cards[0].label).to.equal('contact.profile.fp');
    expect(summary.cards[0].fields.find( f => f.label === 'contact.profile.fp.method')).to.have.property('value');
    expect(summary.cards[0].fields.find( f => f.label === 'contact.profile.fp.method.expiry')).to.have.property('value');
    expect(summary.cards[0].fields[0].value).to.equal('contact.profile.not-on-fp');
    expect(summary.cards[0].fields[1].value).to.equal('contact.profile.not-applicable');
  });

  it('updates condition card with FP method', async () => {
    await harness.setNow('2017-01-01');
    const over_5_screening = await harness.fillForm('over_5_screening', ...inputs.over_5_screening.fp_subscription);
    expect(over_5_screening.errors).to.be.empty;

    const cs = await harness.getContactSummary();
    const fp_card = cs.cards.find(c => c.label === 'contact.profile.fp');

    expect(fp_card.fields.find(f => f.label === 'contact.profile.fp.method').value).to.equal('Intrauterine Device (IUCD)');
    expect(fp_card.fields.find(f => f.label === 'contact.profile.fp.method.expiry').value).to.equal('15/12/2017');
  });

  it('does not show malnutrition field for over 5 in a treatment program', async () => {
    const summary = await harness.getContactSummary(
      {type: 'contact', contact_type: 'person', _id: 'k', date_of_birth: '2010-01-01'},
      [
        {_id: 'r', type: 'data_record', form: 'tb_screening', reported_date: 123456, fields: { enrolled_tb: 'yes' }},
      ],
      []
    );
    expect(summary.cards[0].fields.find( f => f.label === 'contact.profile.malnutrition_program')).to.be.undefined;
  });

  it('updates treatment condition card when enrolled into TB program via tb_screening', async () => {
    const over_5_screening = await harness.fillForm('over_5_screening', ...inputs.over_5_screening.tb_program);
    expect(over_5_screening.errors).to.be.empty;

    const cs = await harness.getContactSummary();
    const treatment_card = cs.cards.find(c => c.label === 'contact.profile.treatment_program');

    const tb_program = treatment_card.fields.find(f => f.label === 'contact.profile.tb_program');
    expect(tb_program.value).to.equal('contact.profile.enrolled');
  });

  it('updates treatment condition card when enrolled into TB program via referral followup', async () => {
    harness.user = {_id: 'ss_id2'};
    const tb_results = await harness.fillForm('tb_results', ['positive']);
    expect(tb_results.errors).to.be.empty;

    await harness.flush(2);
    harness.user = 'chw_id';
    const tasks = await harness.getTasks({
      title: 'task.title.tb_results',
      ownedBySubject: false
    });
    expect(tasks).to.have.property('length', 1);

    const tb_results_task = await harness.loadAction(
      tasks[0],
      ['yes', 'chw']
    );
    expect(tb_results_task.errors).to.be.empty;

    await harness.flush(2);
    const referral_task = await harness.getTasks({ title: 'task.title.tb_referral_follow_up' });
    expect(referral_task).to.have.property('length', 1);

    const tb_referral = await harness.loadAction(
      referral_task[0],
      ['yes'],
      ['yes'],
      ['no']
    );
    expect(tb_referral.errors).to.be.empty;

    const cs = await harness.getContactSummary();
    const treatment_card = cs.cards.find(c => c.label === 'contact.profile.treatment_program');

    const tb_program = treatment_card.fields.find(f => f.label === 'contact.profile.tb_program');
    expect(tb_program.value).to.equal('contact.profile.enrolled');
  });

  it('NCD confirmed via monthly screening (without EMR ID)', async () => {
    await harness.setNow('2021-01-31');
    const over_5_screening = await harness.fillForm(
      'over_5_screening',
      ...inputs.over_5_screening.ncd_asthma_no_emr
    );
    expect(over_5_screening.errors).to.be.empty;

    const cs = await harness.getContactSummary();
    const treatment_card = cs.cards.find(c => c.label === 'contact.profile.treatment_program');
    expect(treatment_card.fields.find(f => f.label === 'contact.profile.ncd_label').value).to.equal('Asthma/chronic lung disease');
    expect(treatment_card.fields.find(f => f.label === 'contact.profile.ncd_id').value).to.equal('contact.profile.no-id');
  });

  it('NCD confirmed via monthly screening (with EMR ID)', async () => {
    await harness.setNow('2021-01-31');
    const over_5_screening = await harness.fillForm(
      'over_5_screening',
      ...inputs.over_5_screening.ncd_asthma_emr
    );
    expect(over_5_screening.errors).to.be.empty;

    const cs = await harness.getContactSummary();
    const treatment_card = cs.cards.find(c => c.label === 'contact.profile.treatment_program');
    expect(treatment_card.fields.find(f => f.label === 'contact.profile.ncd_label').value).to.equal('Asthma/chronic lung disease');
    expect(treatment_card.fields.find(f => f.label === 'contact.profile.ncd_id').value).to.equal('NNO 1234 CCC');
  });

  it('NCD confirmed via treatment enrollment (with EMR ID)', async () => {
    await harness.setNow('2021-01-31');
    const treatment_enrolment = await harness.fillForm(
      'treatment_enrolment',
      ...inputs.treatment_enrollment.hypertension
    );
    expect(treatment_enrolment.errors).to.be.empty;

    const cs = await harness.getContactSummary();
    const treatment_card = cs.cards.find(c => c.label === 'contact.profile.treatment_program');
    expect(treatment_card.fields.find(f => f.label === 'contact.profile.ncd_label').value).to.equal('Hypertension');
    expect(treatment_card.fields.find(f => f.label === 'contact.profile.ncd_id').value).to.equal('NNO 1234 CCC');
  });

  it('NCD confirmed via referral follow up (with EMR ID)', async () => {
    await harness.setNow('2021-01-31');
    const over_5_screening = await harness.fillForm(
      'over_5_screening',
      ...inputs.over_5_screening.ncd_symptom
    );
    expect(over_5_screening.errors).to.be.empty;

    await harness.flush(7);
    const tasks = await harness.getTasks();
    expect(tasks).to.have.property('length', 1);
    expect(tasks[0].emission.title).to.equal('task.title.ncd_referral_follow_up');

    await harness.flush(1);
    const referral_completion = await harness.loadAction(tasks[0],
      ...inputs.referral_follow_up.ncd_epilepsy_emr
    );
    expect(referral_completion.errors).to.be.empty;

    const cs = await harness.getContactSummary();
    const treatment_card = cs.cards.find(c => c.label === 'contact.profile.treatment_program');
    expect(treatment_card.fields.find(f => f.label === 'contact.profile.ncd_label').value).to.equal('Epilepsy');
    expect(treatment_card.fields.find(f => f.label === 'contact.profile.ncd_id').value).to.equal('NNO 1234 CCC');
  });

});
