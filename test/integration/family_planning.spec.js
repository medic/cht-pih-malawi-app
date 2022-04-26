const { expect } = require('chai');
const Harness = require('cht-conf-test-harness');
const harness = new Harness({
  subject: 'patient_id2'
});

describe('Family planning workflow', async () => {

  before(async () => await harness.start());
  after(async () => await harness.stop());
  beforeEach(async () => await harness.clear());

  it('fp_screening triggers pregnancy confirmation referral', async () => {
    const over_5_screening = await harness.fillForm('over_5_screening',
      [],
      [],
      ['no', 'none'],
      ['no', '3'],
      ['no', 'none'],
      ['no'],
      ['no', 'no', 'no', '3', 'yes'],
      ['no'],
      ['no']
    );
    expect(over_5_screening.errors).to.be.empty;

    const tasks = await harness.getTasks();
    expect(tasks).to.have.property('length', 1);
    expect(tasks[0].emission.title).to.equal('task.title.pregnancy_confirmation_referral_follow_up');

    const referral_completion = await harness.loadAction(tasks[0],
      ['yes'],
      ['no'],
      ['no', 'service_not_available'],
      ['no']
    );
    expect(referral_completion.errors).to.be.empty;

    const tasks_after_referral = await harness.getTasks();
    expect(tasks_after_referral).to.be.empty;
  });

  it('fp_screening triggers family planning referral', async () => {
    await harness.setNow('2017-01-01');
    const over_5_screening = await harness.fillForm('over_5_screening',
      [],
      [],
      ['no', 'none'],
      ['no', '3'],
      ['no', 'none'],
      ['no'],
      ['yes', 'iucd', '2017-12-15', 'no'], // compute this date
      ['no']
    );
    expect(over_5_screening.errors).to.be.empty;

    await harness.setNow('2017-12-01');

    const tasks = await harness.getTasks();
    expect(tasks).to.have.property('length', 1);
    expect(tasks[0].emission.title).to.equal('task.title.fp_expiry');

    const referral_completion = await harness.loadAction(tasks[0],
      ['yes'],
      ['yes', 'pills'],
      ['no']
    );
    expect(referral_completion.errors).to.be.empty;

    const tasks_after_referral = await harness.getTasks();
    expect(tasks_after_referral).to.be.empty;

  });

  it('fp_follow_up triggers family planning referral', async () => {
    await harness.setNow('2018-01-01');
    const over_5_screening = await harness.fillForm('over_5_screening',
      [],
      [],
      ['no', 'none'],
      ['no', '3'],
      ['no', 'none'],
      ['no'],
      ['yes', 'pills', 'no', 'no'],
      ['no']
    );
    expect(over_5_screening.errors).to.be.empty;

    await harness.flush(30);

    const next_over_5_screening = await harness.fillForm('over_5_screening',
      [],
      [],
      ['no', 'none'],
      ['no', '3'],
      ['no', 'none'],
      ['no'],
      ['yes', 'yes', 'depo_provera', '2018-09-30', 'no', 'no', 'no'],
      ['no']
    );
    expect(next_over_5_screening.errors).to.be.empty;

    await harness.setNow('2018-09-07');
    const tasks_in_future = await harness.getTasks();
    expect(tasks_in_future).to.have.property('length', 1);
    expect(tasks_in_future[0].emission.title).to.equal('task.title.fp_expiry');
  });

  it('referral_follow_up triggers family_planning referral', async () => {
    await harness.setNow('2018-07-08');

    const over_5_screening = await harness.fillForm('over_5_screening',
      [],
      [],
      ['no', 'none'],
      ['no', '3'],
      ['no', 'none'],
      ['no'],
      ['no', 'no', 'yes', '2018-06-01'],
      ['no']
    );
    expect(over_5_screening.errors).to.be.empty;

    const tasks = await harness.getTasks();
    expect(tasks).to.have.property('length', 1);
    expect(tasks[0].emission.title).to.equal('task.title.pregnancy_confirmation_referral_follow_up');

    harness.flush(1);

    const referral_completion = await harness.loadAction(tasks[0],
      ['yes'],
      ['no'],
      ['yes', 'iucd', '2018-11-30'],
      ['no']
    );
    expect(referral_completion.errors).to.be.empty;

    const tasks_after_referral = await harness.getTasks();
    expect(tasks_after_referral).to.be.empty;

    await harness.setNow('2018-11-15');

    const tasks_in_future = await harness.getTasks();
    expect(tasks_in_future).to.have.property('length', 1);
    expect(tasks_in_future[0].emission.title).to.equal('task.title.fp_expiry');
  });
});
