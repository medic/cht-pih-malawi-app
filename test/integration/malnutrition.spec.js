const { expect } = require('chai')
                      .use(require('chai-like'))
                      .use(require('chai-things'));
const TestRunner = require('cht-conf-test-harness');
const harness = new TestRunner();

const { 
  under_5_screening,
  referral_follow_up,
  monthly_follow_up,
  contact
} = require('../form-inputs');

const { now } = require('../../shared');
const { DateTime, Duration} = require('luxon');

describe('Nutrition worklow', () => {

  before(async () => await harness.start());

  after(async () => await harness.stop());

  beforeEach(async () => await harness.clear());

  it('should raise malnutrition-referral-follow-up task', async () => {
    const patientResult = await harness.fillContactForm('person', contact.under_5);
    expect(patientResult.errors).to.be.empty;

    const u5screeningResult = await harness.fillForm('under_5_screening', ...under_5_screening.malnutrition_symptoms);
    expect(u5screeningResult.errors).to.be.empty;

    const tasks_today = await harness.getTasks();
    expect(tasks_today).to.be.empty;

    await harness.flush(3);

    const tasks_in_3_days = await harness.getTasks({ title: 'task.title.malnutrition_referral_follow_up' });
    expect(tasks_in_3_days).to.have.property('length', 1);

    const referral_followup = await harness.loadAction(
      tasks_in_3_days[0],
      ...referral_follow_up.malnutrition
    );
    expect(referral_followup.errors).to.be.empty;
    expect(await harness.getTasks()).to.be.empty;
  });

  it('#479 - malnutrition treatment exit should not trigger monthly followup', async () => {
    const patientResult = await harness.fillContactForm('person', contact.under_5);
    expect(patientResult.errors).to.be.empty;

    harness.subject = patientResult.contacts[0]._id;

    const u5screeningResult = await harness.fillForm('under_5_screening', ...under_5_screening.malnutrition_enrollment);
    expect(u5screeningResult.errors).to.be.empty;

    const firstOfNextMonth = DateTime.fromJSDate(now).plus(Duration.fromObject({ months: 1})).startOf('month');
  
    await harness.setNow(firstOfNextMonth);

    const monthlyTask = await harness.getTasks({ title: 'task.title.monthly_follow_up' });
    expect(monthlyTask).to.have.property('length', 1);

    const monthlyFollowup = await harness.loadAction(
      monthlyTask[0],
      ...monthly_follow_up.cured
    );
    expect(monthlyFollowup.errors).to.be.empty;

    const twoMonthsLater = DateTime.fromJSDate(now).plus(Duration.fromObject({ months: 2})).startOf('month');
    await harness.setNow(twoMonthsLater);
    expect(await harness.getTasks()).to.be.empty;
  });

});
