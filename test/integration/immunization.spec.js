const { expect } = require('chai');
const Harness = require('cht-conf-test-harness');
const { DateTime, Duration } = require('luxon');

const NOW = DateTime.local();
const harness = new Harness();

describe('Immunization worklow tests', () => {

  before(async () => { return await harness.start(); });
  after(async () => { return await harness.stop(); });

  const formName = 'under_5_screening';

  it(`${formName} can be loaded`, async () => {
    await harness.loadForm(`${formName}`);
    expect(harness.state.pageContent).to.include(`id="${formName}"`);
  });

  it(`updates contact card with immunization status`, async () => {

    const monthly_screening_1 = await harness.fillForm(
      formName,
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

    expect(monthly_screening_1.errors).to.be.empty;

    const cs = await harness.getContactSummary();
    const imm_card = cs.cards.find(c => c.label === 'contact.profile.immunizations');
    const fully_immunized = imm_card.fields.find(f => f.label === 'contact.profile.immunization.fully_immunized');
    expect(fully_immunized.value).to.equal('contact.profile.immunization.fully_immunized.no');

    const next_visit_date = imm_card.fields.find(f => f.label === 'contact.profile.immunization.next_visit');
    expect(next_visit_date.value).to.equal(NOW.plus(Duration.fromObject({ days: 10 })).toFormat('dd/MM/yyyy'));

    const monthly_screening_2 = await harness.fillForm(
      formName,
      [],
      [],
      ['no', '15', 'none'],
      ['none'],
      [],
      ['yes'],
      ['2'],
      [NOW.minus(Duration.fromObject({ days: 5 })).toString().slice(0, 10), 'opv_2,pcv_2,dpt_hepb_hib_2,rota_2,measles_2'],
      [NOW.minus(Duration.fromObject({ days: 4 })).toString().slice(0, 10), 'opv_3,pcv_3,dpt_hepb_hib_3'],
      [NOW.plus(Duration.fromObject({ days: 10 })).toString().slice(0, 10)],
      ['no'],
      ['no']
    );
    expect(monthly_screening_2.errors).to.be.empty;

    const cs2 = await harness.getContactSummary();
    const imm_card2 = cs2.cards.find(c => c.label === 'contact.profile.immunizations');
    const fully_immunized2 = imm_card2.fields.find(f => f.label === 'contact.profile.immunization.fully_immunized');
    expect(fully_immunized2.value).to.equal('contact.profile.immunization.fully_immunized.yes');

    const next_visit_date2 = imm_card2.fields.find(f => f.label === 'contact.profile.immunization.next_visit');
    expect(next_visit_date2).to.be.undefined;

  });
});
