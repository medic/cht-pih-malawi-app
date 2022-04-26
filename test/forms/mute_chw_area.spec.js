const { expect } = require('chai');
const TestHarness = require('cht-conf-test-harness');
const { muteCHWAreaScenarios } = require('../form-inputs');
const formName = 'mute_health_center';
const harness = new TestHarness({
  subject: 'chw_area_id',
  user: 'schw_id',
});

describe('Mute chw area form test', () => {
    before(async () => { return await harness.start(); });
    after(async () => { return await harness.stop(); });
    beforeEach(async () => {
        await harness.clear();
        // set harnes date to Jan 1st 2019
        return await harness.setNow('2019-01-01');
    });
    afterEach(() => {
        expect(harness.consoleErrors).to.be.empty;
    });

    it('mute chw area form can be loaded', async () => {
        await harness.loadForm(`${formName}`);
        expect(harness.state.pageContent).to.include(`${formName}`);
    });

    it('mute chw area form can be filled and successfully saved - reason: {in list} ', async () => {
        // Load the mute form and fill in
        const result = await harness.fillForm(...muteCHWAreaScenarios.notOther);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.deep.include({
            place_id: 'chw_area_id',
        });
    });

    it('mute chw area form can be filled and successfully saved - reason: other ', async () => {
        // Load the mute form and fill in
        await harness.loadForm(`${formName}`);
        const result = await harness.fillForm(...muteCHWAreaScenarios.other);


        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.nested.include({
            place_id: 'chw_area_id',
            'mute_request.reason_other': 'unspecified'
        });
    });
});
