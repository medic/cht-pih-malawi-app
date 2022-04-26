const { expect } = require('chai');
const TestHarness = require('cht-conf-test-harness');
const harness = new TestHarness();
const { over_5_screening } = require('../form-inputs');
const { DateTime } = require('luxon');
const now = DateTime.now();

describe('contact summary - pregnancy card', () => {
    before(async () => await harness.start());
    after(async () => await harness.stop());
    beforeEach(async () => await harness.clear());
    afterEach(() => { expect(harness.consoleErrors).to.be.empty; });

    it('does not show edd when no anc visits', async () => {
        harness.subject.date_of_birth = now.minus({ year: 24 }).toISODate();
        const result = await harness.fillForm('over_5_screening', ...over_5_screening.pregnant_no_anc_vist);
        expect(result.errors).to.be.empty;

        const card = (await harness.getContactSummary()).cards.find(card => card.label === 'contact.profile.pregnancy');
        expect(card).to.be.not.undefined;
        const field = card.fields.find(field => field.label === 'contact.profile.edd');
        expect(field).to.be.undefined;
    });

    it('shows edd when there are anc visits', async () => {
        harness.subject.date_of_birth = now.minus({ year: 24 }).toISODate();
        const result = await harness.fillForm('over_5_screening',
            ...over_5_screening.pregnant_1_anc_vist(now.minus({ day: 7 }).toISODate(), now.plus({ month: 6 }).toISODate(), now.plus({ week: 3 }).toISODate()));
        expect(result.errors).to.be.empty;

        const card = (await harness.getContactSummary()).cards.find(card => card.label === 'contact.profile.pregnancy');
        expect(card).to.be.not.undefined;
        const field = card.fields.find(field => field.label === 'contact.profile.edd');
        expect(field).to.not.be.undefined;
    });

});
