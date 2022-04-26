const { expect } = require('chai');
const Harness = require('cht-conf-test-harness');

const harness = new Harness();

describe('delivery workflow', async () => {

  before(async () => { return await harness.start(); });
  after(async () => { return await harness.stop(); });
  beforeEach(async () => { return await harness.clear(); });
  afterEach(() => { expect(harness.consoleErrors).to.be.empty; });

  it('should trigger delivery check task', async () => {

    await harness.setNow('2020-04-02');
    const result = await harness.fillForm('pregnancy', ['yes'], ['yes', '2020-04-01', '0'], ['none'], ['chw']);
    expect(result.errors).to.be.empty;

    result.report.fields.edd = '2020-12-31';

    await harness.setNow('2020-12-31');
    const tasks = await harness.getTasks();

    expect(tasks).to.have.property('length', 1);
    const dc_result = await harness.loadAction(tasks[0], ['no', 'miscarried', '2020-05-31']);
    expect(dc_result.errors).to.be.empty;

    const after_check_tasks = await harness.getTasks();
    expect(after_check_tasks).to.be.empty;
  });

});
