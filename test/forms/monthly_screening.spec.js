const { expect } = require('chai');
const Harness = require('cht-conf-test-harness');
const { DateTime, Duration } = require('luxon');

const NOW = DateTime.local();
const harness = new Harness();

describe('Monthly screening forms', () => {

  before(async () => { return await harness.start(); });
  after(async () => { return await harness.stop(); });

  it('under_5_screening can be loaded', async () => {
    await harness.loadForm('under_5_screening');
    expect(harness.state.pageContent).to.include('id="under_5_screening"');
  });

  it(`under_5_screening can be filled`, async () => {
    const under_5_screening = await harness.fillForm(
      'under_5_screening',
      [],
      [],
      ['no', '15', 'none'],
      ['none'],
      [],
      ['yes'],
      ['1'],
      [NOW.minus(Duration.fromObject({ days: 10 })).toString().slice(0, 10), 'bcg,opv_1,pcv_1,dpt_hepb_hib_1,ipv,rota_1,vitamin_a,measles_1'],
      [NOW.plus(Duration.fromObject({ days: 10 })).toString().slice(0, 10)],
      ['no'],
      ['no']
    );

    expect(under_5_screening.errors).to.be.empty;
    expect(under_5_screening.report.fields.visited_contact_uuid).to.not.be.empty;
    expect(under_5_screening.report.fields.visited_contact_uuid).to.equal(harness.subject.parent._id);
  });

  it('over_5_screening can be loaded', async () => {
    await harness.loadForm('over_5_screening');
    expect(harness.state.pageContent).to.include('id="over_5_screening"');
  });

  it(`over_5_screening can be filled`, async () => {
    const over_5_screening = await harness.fillForm(
      'over_5_screening',
      [],
      [],
      ['no', 'none'],
      ['no', 'none'],
      ['no']
    );

    expect(over_5_screening.errors).to.be.empty;
    expect(over_5_screening.report.fields.visited_contact_uuid).to.not.be.empty;
    expect(over_5_screening.report.fields.visited_contact_uuid).to.equal(harness.subject.parent._id);
  });

});
