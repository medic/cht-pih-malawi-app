const { expect } = require('chai');
const TestHarness = require('cht-conf-test-harness');
const { tbContactTracingScenarios } = require('../form-inputs');
const formName = 'tb_contact_tracing';
const harness = new TestHarness();

describe('TB contact tracing form test', () => {
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

    it('tb contact tracing form can be loaded', async () => {
        await harness.loadForm(`${formName}`);
        expect(harness.state.pageContent).to.include(`${formName}`);
    });

    it('tb contact tracing form can be filled and successfully saved - referred', async () => {
        // Load the tb contact tracing up form and fill in
        const result = await harness.fillForm(...tbContactTracingScenarios.referred);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.deep.include({
            is_referral_case: 'yes',
        });
    });

    it('tb contact tracing form can be filled and successfully saved - not referred', async () => {
        // Load the mute form and fill in
        await harness.loadForm(`${formName}`);
        const result = await harness.fillForm(...tbContactTracingScenarios.notReferred);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.nested.include({
            is_referral_case: 'no',
        });
    });
});
