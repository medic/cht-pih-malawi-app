const { expect } = require('chai');
const Harness = require('cht-conf-test-harness');

const harness = new Harness();

describe('monthly-follow ups', async () => {

  before(async () => { return await harness.start(); });
  after(async () => { return await harness.stop(); });
  beforeEach(async () => {
    await harness.clear();
    await harness.setNow('2000-01-01');
  });
  afterEach(() => {
    expect(harness.consoleErrors).to.be.empty;
  });

  const MONTHLY_TASK_TITLE = 'task.title.monthly_follow_up';

  it('#207 - monthly follow-up task should appear for child under five', async () => {
    await harness.setNow('2000-01-01');

    const patientResult = await harness.fillContactForm('person', ['Baby Elijah', 'male', 'under_5', '1999-01-01', ['eid'], 'no']);
    expect(patientResult.errors).to.be.empty;
    harness.subject = patientResult.contacts[0];

    // enroll in art
    const result = await harness.fillForm('treatment_enrolment', ['art', 'no']);
    expect(result.errors).to.be.empty;

    // monthly follow-up should start one year after
    await harness.setNow('2001-01-01');
    const firstMonthlyFollowup = await harness.getTasks({ title: MONTHLY_TASK_TITLE });
    expect(firstMonthlyFollowup).to.have.property('length', 1);

    const monthlyResult = await harness.loadAction(firstMonthlyFollowup[0], ['in_person'], [], ['yes', 'no'], ['none'], ['yes', 'no']);
    expect(monthlyResult.errors).to.be.empty;
    expect(await harness.getTasks()).to.be.empty;

    await harness.setNow('2001-01-30');
    expect(await harness.getTasks()).to.be.empty;

    // continues month for month afterward
    await harness.setNow('2001-02-01');
    const monthAfterFollowup = await harness.getTasks({ title: MONTHLY_TASK_TITLE });
    expect(monthAfterFollowup).to.have.property('length', 1);

    await harness.setNow('2002-01-01');
    const yearAfterFollowup = await harness.getTasks();
    expect(yearAfterFollowup).to.have.property('length', 1);

    // monthly ART follow-ups should ever end
    await harness.setNow('2005-01-02');
    expect(yearAfterFollowup).to.have.property('length', 1);
  });

});
