const { expect } = require('chai');
const Harness = require('cht-conf-test-harness');
const harness = new Harness();

const {
  over_5_screening,
  delivery,
  referral_follow_up,
  contact
} = require('../form-inputs');

describe('ART', async () => {

  before(async () => await harness.start());
  after(async () => await harness.stop());
  beforeEach(async () => await harness.clear());

  it('art treatment enrollment triggers daily referral follow up', async () => {
    await harness.setNow('2000-01-01');

    const patientResult = await harness.fillContactForm('person', ['Baby Elijah', 'male', 'under_5', '1999-01-01', ['eid'], 'no']);
    expect(patientResult.errors).to.be.empty;
    harness.subject = patientResult.contacts[0];

    const result = await harness.fillForm('treatment_enrolment', ['art', 'no']);
    expect(result.errors).to.be.empty;

    const dailyFollowup = await harness.getTasks({ title: 'task.title.daily_referral_follow_up' });
    expect(dailyFollowup).to.have.property('length', 1);

    const dailyResult = await harness.loadAction(dailyFollowup[0], ['in_person'], [], ['yes', 'no', '2010-01-01'], ['none']);
    expect(dailyResult.errors).to.be.empty;
    expect(await harness.getTasks()).to.be.empty;

    await harness.flush(1);
    expect(await harness.getTasks()).to.be.empty;
  });

  it('Contact in ART treatment >1 year should get monthly followups', async () => {
    await harness.setNow('2010-01-01');

    const patientResult = await harness.fillContactForm('person', ['Test', 'female', 'over_5', 'yes', '1979-01-01', '', '', 'art', 'no', '2', '']);
    expect(patientResult.errors).to.be.empty;

    const monthlyFollowup = await harness.getTasks({
      title: 'task.title.monthly_follow_up',
      ownedBySubject: false
    });
    expect(monthlyFollowup).to.have.property('length', 1);

    const monthlyResult = await harness.loadAction(monthlyFollowup[0], [], [], ['yes', 'no'], ['none']);
    expect(monthlyResult.errors).to.be.empty;
    expect(await harness.getTasks()).to.be.empty;
  });

  it('EID referral follow up should be triggered for newborn', async () => {
    await harness.setNow('2010-01-01');

    const patientResult = await harness.fillContactForm('person', contact.over_5_female_art);
    expect(patientResult.errors).to.be.empty;


    harness.subject = patientResult.contacts[0]._id;
    const result = await harness.fillForm('over_5_screening', ...over_5_screening.pregnant_no_anc_vist_art);
    expect(result.errors).to.be.empty;

    await harness.setNow('2010-09-01');

    const result2 = await harness.fillForm('delivery', ...delivery.eid('2010-08-31'));
    expect(result2.errors).to.be.empty;

    harness.subject = result2.additionalDocs[0]._id;
    await harness.setNow('2010-09-14');

    const tasks = await harness.getTasks({
      title: 'task.title.eid_screening'
    });
    expect(tasks).to.have.property('length', 1);

    const eid_result = await harness.loadAction(tasks[0], ...referral_follow_up.eid);
    expect(eid_result.errors).to.be.empty;

    const tasks2 = await harness.getTasks({
      title: 'task.title.eid_screening'
    });
    expect(tasks2).to.be.empty;
  });

  it('Triggers HIV testing referral task for patient who has never tested for HIV', async () => {
    harness.subject = 'patient_id2';
    const result = await harness.fillForm('over_5_screening', ...over_5_screening.hiv_never_tested);
    expect(result.errors).to.be.empty;

    harness.flush(7);
    const tasks = await harness.getTasks({
      title: 'task.title.hiv_testing_referral_follow_up'
    });
    expect(tasks).to.have.property('length', 1);
  });

  it('Triggers HIV testing referral task for patient who has last tested for HIV more than 4 months ago', async () => {
    harness.subject = 'patient_id2';
    const result = await harness.fillForm('over_5_screening', ...over_5_screening.hiv_tested_4_months_ago);
    expect(result.errors).to.be.empty;

    harness.flush(7);
    const tasks = await harness.getTasks({
      title: 'task.title.hiv_testing_referral_follow_up'
    });
    expect(tasks).to.have.property('length', 1);
  });

  it('Clears HIV testing referral task upon completion', async () => {
    harness.subject = 'patient_id2';
    const result = await harness.fillForm('over_5_screening', ...over_5_screening.hiv_tested_4_months_ago);
    expect(result.errors).to.be.empty;

    harness.flush(7);
    const tasks = await harness.getTasks({
      title: 'task.title.hiv_testing_referral_follow_up'
    });
    expect(tasks).to.have.property('length', 1);

    const referral_result = await harness.loadAction(tasks[0], ...referral_follow_up.hiv_test);
    expect(referral_result.errors).to.be.empty;

    const tasks2 = await harness.getTasks({
      title: 'task.title.hiv_testing_referral_follow_up'
    });
    expect(tasks2).to.be.empty;
  });
});
