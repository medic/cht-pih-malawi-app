const { expect } = require('chai');
const Harness = require('cht-conf-test-harness');
const {
  over_5_screening,
  referral_follow_up,
  sputum_collection,
  tbResultsTaskScenarios
 } = require('../form-inputs');
const harness = new Harness({
  subject: 'patient_id2'
});

describe('TB workflow', () => {

  before(async () => await harness.start());
  after(async () => await harness.stop());
  afterEach(async () => await harness.clear());

  it('TB screening with symptoms triggers sputum referral task', async () => {
    const screening = await harness.fillForm('over_5_screening', ...over_5_screening.tb_symptoms);
    expect(screening.errors).to.be.empty;

    await harness.flush(2);

    harness.user = 'schw_id';
    const tasks = await harness.getTasks({
      title: 'task.title.sputum-collection',
      ownedBySubject: false
    });
    expect(tasks).to.have.property('length', 1);

    const sputum = await harness.loadAction(
      tasks[0],
      sputum_collection.sample
    );
    expect(sputum.errors).to.be.empty;

    const tasksAfterCollection = await harness.getTasks();
    expect(tasksAfterCollection).to.be.empty;
  });

  it('TB results w/ negative result triggers TB result notification task', async () => {
    harness.user = {_id: 'ss_id2'};
    const results = await harness.fillForm('tb_results', ['negative']);
    expect(results.errors).to.be.empty;

    harness.user = 'schw_id';
    const tasks = await harness.getTasks({
      title: 'task.title.tb-results-notification',
      ownedBySubject: false
    });
    expect(tasks).to.have.property('length', 1);

    const register = await harness.loadAction(
      tasks[0],
      []
    );
    expect(register.errors).to.be.empty;

    const tasksAfterUpdate = await harness.getTasks();
    expect(tasksAfterUpdate).to.be.empty;
  });

  it('TB results w/ positive result triggers TB result notification task', async () => {
    harness.user = {_id: 'ss_id2'};
    const results = await harness.fillForm('tb_results', ['positive']);
    expect(results.errors).to.be.empty;

    harness.user = 'schw_id';
    const tasks = await harness.getTasks({
      title: 'task.title.tb-results-notification',
      ownedBySubject: false
    });
    expect(tasks).to.have.property('length', 1);

    const register = await harness.loadAction(
      tasks[0],
      []
    );
    expect(register.errors).to.be.empty;

    const tasksAfterUpdate = await harness.getTasks();
    expect(tasksAfterUpdate).to.be.empty;
  });

  it('TB results w/ rejected samples triggers TB result notification task', async () => {
    harness.user = {_id: 'ss_id2'};
    const results = await harness.fillForm('tb_results', ['rejected']);
    expect(results.errors).to.be.empty;

    harness.user = 'schw_id';
    const tasks = await harness.getTasks({
      title: 'task.title.tb-results-notification',
      ownedBySubject: false
    });
    expect(tasks).to.have.property('length', 1);

    const register = await harness.loadAction(
      tasks[0],
      []
    );
    expect(register.errors).to.be.empty;

    const tasksAfterUpdate = await harness.getTasks();
    expect(tasksAfterUpdate).to.be.empty;

  });


  it('TB results w/ positive result triggers TB results task', async () => {
    harness.user = {_id: 'ss_id2'};
    const results = await harness.fillForm('tb_results', ['positive']);
    expect(results.errors).to.be.empty;

    await harness.flush(2);

    harness.user = 'chw_id';
    const tasks = await harness.getTasks({
      title: 'task.title.tb_results',
      ownedBySubject: false
    });
    expect(tasks).to.have.property('length', 1);

    const resultsTask = await harness.loadAction(
      tasks[0],
      ...tbResultsTaskScenarios.notReferred
    );
    expect(resultsTask.errors).to.be.empty;

    const tasksAfterUpdate = await harness.getTasks();
    expect(tasksAfterUpdate).to.be.empty;

  });

  it('TB results w/ positive result triggers TB referral task', async () => {
    harness.user = {_id: 'ss_id2'};
    const results = await harness.fillForm('tb_results', ['positive']);
    expect(results.errors).to.be.empty;

    await harness.flush(2);

    harness.user = 'chw_id';
    const tasks = await harness.getTasks({
      title: 'task.title.tb_results',
      ownedBySubject: false
    });
    expect(tasks).to.have.property('length', 1);

    const resultsTask = await harness.loadAction(
      tasks[0],
      ...tbResultsTaskScenarios.referred
    );
    expect(resultsTask.errors).to.be.empty;

    await harness.flush(2);

    const referralTask = await harness.getTasks({ title: 'task.title.tb_referral_follow_up' });
    expect(referralTask).to.have.property('length', 1);

    const tbReferral = await harness.loadAction(referralTask[0], ...referral_follow_up.tb_no_treatment);
    expect(tbReferral.errors).to.be.empty;

    const tasksAfterReferral = await harness.getTasks();
    expect(tasksAfterReferral).to.be.empty;
  });

  it('TB results w/ negative result triggers TB results task', async () => {
    harness.user = {_id: 'ss_id2'};
    const results = await harness.fillForm('tb_results', ['negative']);
    expect(results.errors).to.be.empty;

    await harness.flush(2);

    harness.user = 'chw_id';
    const tasks = await harness.getTasks({
      title: 'task.title.tb_results',
      ownedBySubject: false
    });
    expect(tasks).to.have.property('length', 1);

    const resultsTask = await harness.loadAction(
      tasks[0],
      []
    );
    expect(resultsTask.errors).to.be.empty;

    const tasksAfterUpdate = await harness.getTasks();
    expect(tasksAfterUpdate).to.be.empty;

  });

  it('TB results w/ rejected result triggers TB results task', async () => {
    harness.user = {_id: 'ss_id2'};
    const results = await harness.fillForm('tb_results', ['rejected']);
    expect(results.errors).to.be.empty;

    await harness.flush(2);

    harness.user = 'chw_id';
    const tasks = await harness.getTasks({
      title: 'task.title.tb_results',
      ownedBySubject: false
    });
    expect(tasks).to.have.property('length', 1);

    const resultsTask = await harness.loadAction(
      tasks[0],
      []
    );
    expect(resultsTask.errors).to.be.empty;

    const tasksAfterUpdate = await harness.getTasks();
    expect(tasksAfterUpdate).to.be.empty;

  });

});
