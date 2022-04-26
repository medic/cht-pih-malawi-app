const { expect } = require('chai');
const TestHarness = require('cht-conf-test-harness');
const { traceFollowUpScenarios } = require('../form-inputs');
const formName = 'trace_follow_up';
const harness = new TestHarness();

describe('Trace follow up form test', () => {
    before(async () => {
        return await harness.start();
    });
    after(async () => {
        return await harness.stop();
    });
    beforeEach(async () => {
        await harness.clear();

        harness.content = {
          source: 'action',
          trace_reasons: 'IC3 clinic missed visit, TB missed visit',
        };

        // set harnes date to Jan 1st 2019
        return await harness.setNow('2019-01-01');
    });
    afterEach(() => {
        expect(harness.consoleErrors).to.be.empty;
    });

    it('trace follow up form can be loaded', async () => {
        await harness.loadForm(`${formName}`);
        expect(harness.state.pageContent).to.include(`${formName}`);
    });

    it('trace follow up form can be filled and successfully saved - patient visited', async () => {
        // Load the trace follow up up form and fill in
        const result = await harness.fillForm(formName, ...traceFollowUpScenarios.visited);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.nested.include({
            'trace_details.c_appt_date': '01/12/2021',
        });
    });

    it('trace follow up form can be filled and successfully saved - patient moved', async () => {
        // Load the mute form and fill in
        const result = await harness.fillForm(formName, ...traceFollowUpScenarios.moved);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;
    });

    it('trace follow up form can be filled and successfully saved - patient travelled', async () => {
        // Load the mute form and fill in
        const result = await harness.fillForm(formName, ...traceFollowUpScenarios.travelled);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;
    });

    it('trace follow up form can be filled and successfully saved - patient forgot', async () => {
        // Load the mute form and fill in
        const result = await harness.fillForm(formName, ...traceFollowUpScenarios.forgot);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.nested.include({
            'trace_details.next_attempt_date': '2021-12-01',
        });
    });
});
