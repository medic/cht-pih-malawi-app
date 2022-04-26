const { expect } = require('chai');
const TestHarness = require('cht-conf-test-harness');
const { traceScenarios } = require('../form-inputs');
const formName = 'trace';
const harness = new TestHarness();

describe('Trace form test', () => {
    before(async () => {
        return await harness.start();
    });
    after(async () => {
        return await harness.stop();
    });
    beforeEach(async () => {
        await harness.clear();
        // set harnes date to Jan 1st 2019
        return await harness.setNow('2019-01-01');
    });
    afterEach(() => {
        expect(harness.consoleErrors).to.be.empty;
    });

    it('trace form can be loaded', async () => {
        await harness.loadForm(`${formName}`);
        expect(harness.state.pageContent).to.include(`${formName}`);
    });

    it('trace form can be filled and successfully saved - visit immediately', async () => {
        // Load the trace form and fill in
        const result = await harness.fillForm(formName, ...traceScenarios.immediately);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;
    });

    it('trace form can be filled and successfully saved - visit next ic3 clinic', async () => {
        // Load the trace form and fill in
        const result = await harness.fillForm(formName, ...traceScenarios.next_clinic);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.nested.include({
            'group_review.c_next_visit': '01/12/2021',
        });
    });
});
