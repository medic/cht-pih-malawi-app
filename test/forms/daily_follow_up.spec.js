const { expect } = require('chai');
const TestHarness = require('cht-conf-test-harness');
const { dailyFollowUpScenarios } = require('../form-inputs');
const formName = 'daily_follow_up';
const harness = new TestHarness();

describe('Daily follow up form test', () => {
    before(async () => {
        return await harness.start();
    });
    after(async () => {
        return await harness.stop();
    });
    beforeEach(async () => {
        await harness.clear();
        // set harnes date to Jan 1st 2019
        return await harness.setNow('2020-01-01');
    });
    afterEach(() => {
        expect(harness.consoleErrors).to.be.empty;
    });

    it('daily follow up form can be loaded', async () => {
        await harness.loadForm(`${formName}`);
        expect(harness.state.pageContent).to.include(`${formName}`);
    });

    it('daily follow up form can be filled and successfully saved - hiv home visit', async () => {
        // Load the daily follow up form and fill in
        const result = await harness.fillForm(...dailyFollowUpScenarios.hivHomeVisit);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.deep.include({
            patient_id: 'patient_id',
        });
    });/*

    it('daily follow up form can be filled and successfully saved - reason: other ', async () => {
        // Load the mute form and fill in
        await harness.loadForm(`${formName}`);
        const result = await harness.fillForm(...muteScenarios.other);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.nested.include({
            patient_id: 'patient_id',
            'mute_request.reason_other': 'unspecified'
        });
    });*/
});
