const { expect } = require('chai');
const Harness = require('cht-conf-test-harness');
const inputs = require('../form-inputs');
const harness = new Harness({
  subject: 'patient_id2'
});

describe('NCD workflow', async () => {

  before(async () => await harness.start());
  after(async () => await harness.stop());
  beforeEach(async () => await harness.clear());

  it('NCD screening with symptom triggers referral follow up task', async () => {
    const over_5_screening = await harness.fillForm(
      'over_5_screening',
      ...inputs.over_5_screening.ncd_symptom
    );
    expect(over_5_screening.errors).to.be.empty;

    await harness.flush(7);

    const tasks = await harness.getTasks();
    expect(tasks).to.have.property('length', 1);
    expect(tasks[0].emission.title).to.equal('task.title.ncd_referral_follow_up');

    const referral_completion = await harness.loadAction(tasks[0],
      ...inputs.referral_follow_up.nothing_confirmed
    );
    expect(referral_completion.errors).to.be.empty;

    const tasks_after_referral = await harness.getTasks();
    expect(tasks_after_referral).to.be.empty;
  });

  it('NCD confirmed via referral triggers monthly followup task', async () => {
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

    const referral_completion = await harness.loadAction(
      tasks[0],
      ...inputs.referral_follow_up.ncd_asthma_no_emr
    );
    expect(referral_completion.errors).to.be.empty;

    const monthly_followup_task = await harness.getTasks();
    expect(monthly_followup_task).to.have.property('length', 1);
    expect(monthly_followup_task[0].emission.title).to.equal('task.title.monthly_follow_up');

    const followup_completion = await harness.loadAction(
      monthly_followup_task[0],
      ...inputs.monthly_follow_up.simple
    );
    expect(followup_completion.errors).to.be.empty;

    const tasks_after_monthly_followup = await harness.getTasks();
    expect(tasks_after_monthly_followup).to.be.empty;
  });

  it('NCD confirmed via monthly screening triggers monthly followup task', async () =>{
    await harness.setNow('2021-01-31');
    const over_5_screening = await harness.fillForm(
      'over_5_screening',
      ...inputs.over_5_screening.ncd_asthma_no_emr
    );
    expect(over_5_screening.errors).to.be.empty;

    await harness.flush(1);

    const monthly_followup_task = await harness.getTasks();
    expect(monthly_followup_task).to.have.property('length', 1);
    expect(monthly_followup_task[0].emission.title).to.equal('task.title.monthly_follow_up');

    const followup_completion = await harness.loadAction(
      monthly_followup_task[0],
      ...inputs.monthly_follow_up.simple
    );
    expect(followup_completion.errors).to.be.empty;

    const tasks_after_monthly_followup = await harness.getTasks();
    expect(tasks_after_monthly_followup).to.be.empty;
  });

  it('NCD confirmed via treatment enrollment triggers monthly followup task', async () => {
    await harness.setNow('2021-01-31');
    const treatment_enrolment = await harness.fillForm(
      'treatment_enrolment',
      ...inputs.treatment_enrollment.hypertension
    );
    expect(treatment_enrolment.errors).to.be.empty;

    await harness.flush(1);

    const monthly_followup_task = await harness.getTasks();
    expect(monthly_followup_task).to.have.property('length', 1);
    expect(monthly_followup_task[0].emission.title).to.equal('task.title.monthly_follow_up');

    const followup_completion = await harness.loadAction(
      monthly_followup_task[0],
      ...inputs.monthly_follow_up.simple
    );
    expect(followup_completion.errors).to.be.empty;

    const tasks_after_monthly_followup = await harness.getTasks();
    expect(tasks_after_monthly_followup).to.be.empty;
  });

  it('NCD reported in person registration triggers monthly followup task', async () => {
    await harness.setNow('2021-01-31');
    const patientResult = await harness.fillContactForm('person', inputs.contact.over_5);
    expect(patientResult.errors).to.be.empty;

    await harness.flush(1);

    const monthly_followup_task = await harness.getTasks({ ownedBySubject: false });
    expect(monthly_followup_task).to.have.property('length', 1);
    expect(monthly_followup_task[0].emission.title).to.equal('task.title.monthly_follow_up');

    const followup_completion = await harness.loadAction(
      monthly_followup_task[0],
      ...inputs.monthly_follow_up.simple
    );
    expect(followup_completion.errors).to.be.empty;

    const tasks_after_monthly_followup = await harness.getTasks();
    expect(tasks_after_monthly_followup).to.be.empty;
  });
});
