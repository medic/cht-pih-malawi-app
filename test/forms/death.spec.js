const { expect } = require('chai');
const TestHarness = require('cht-conf-test-harness');
const { deathScenarios } = require('../form-inputs');
const formName = 'death';
const harness = new TestHarness();

describe('Death form test', () => {
    before(async () => {
        return await harness.start();
    });
    after(async () => {
        return await harness.stop();
    });
    beforeEach(async () => {
        await harness.clear();
        // set harnes date to Jan 1st 2019
        return await harness.setNow('2020-04-01');
    });
    afterEach(() => {
        expect(harness.consoleErrors).to.be.empty;
    });

    it('death form can be loaded', async () => {
        await harness.loadForm(`${formName}`);
        expect(harness.state.pageContent).to.include(`${formName}`);
    });

    it('death form can be filled and successfully saved - not other', async () => {
        // Load the death up form and fill in
        const result = await harness.fillForm(...deathScenarios.notOther);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.deep.include({
            death_date: '2020-03-01',
        });
    });

    it('death form can be filled and successfully saved - other', async () => {
        // Load the mute form and fill in
        await harness.loadForm(`${formName}`);
        const result = await harness.fillForm(...deathScenarios.other);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.deep.include({
            death_date: '2020-03-01',
        });
    });
});
