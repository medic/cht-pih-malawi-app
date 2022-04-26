const { expect } = require('chai');
const TestHarness = require('cht-conf-test-harness');
const { unmuteCHWAreaScenarios } = require('../form-inputs');
const formName = 'unmute_health_center';
const harness = new TestHarness({
    subject: 'chw_area_id',
    user: 'schw_id',
});

describe('Unmute chw area form test', () => {
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

    it('unmute chw area form can be loaded', async () => {
        await harness.loadForm(`${formName}`);
        expect(harness.state.pageContent).to.include(`${formName}`);
    });

    it('unmute chw area form can be filled and successfully saved - reason: {in list} ', async () => {
        // Load the unmute form and fill in
        const result = await harness.fillForm(...unmuteCHWAreaScenarios.notOther);

        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.deep.include({
            place_id: 'chw_area_id',
        });
    });

    it('unmute chw area form can be filled and successfully saved - reason: other ', async () => {
        // Load the unmute form and fill in
        await harness.loadForm(`${formName}`);
        const result = await harness.fillForm(...unmuteCHWAreaScenarios.other);


        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.nested.include({
            place_id: 'chw_area_id',
            'unmute_request.reason_other': 'unspecified'
        });
    });
});
